const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const { transfer, broadcast } = require("@waves/waves-transactions");
const { ethAddress2waves, wavesAddress2eth } = require("@waves/node-api-js");

admin.initializeApp();
const rtdb = admin.database();

// Define Secrets using Google Cloud Secret Manager via Firebase params
const faucetPrivateKey = defineSecret("PLANETONE_PRIVATE_KEY");
const faucetNodeUrl = defineSecret("PLANETONE_NODE_URL");
const faucetChainId = defineSecret("PLANETONE_CHAIN_ID");

const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const AMOUNT = 10 * 1e8; // 10 PLO in atomic units
const FEE = 1_000_000;

// Utility to get real client IP
function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.ip ||
    "";

  ip = ip.trim();

  // Localhost IPv6 ::1 handling
  if (ip === "::1") ip = "127.0.0.1";

  // Keep numbers and periods only (IPv4) for RTDB keys
  ip = ip.replace(/[^0-9.]/g, "_");

  return ip;
}

exports.faucet = onRequest(
  { 
    cors: true,
    secrets: [faucetPrivateKey, faucetNodeUrl, faucetChainId]
  },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Use POST method" });
      }

      const { address } = req.body || {};
      if (!address || typeof address !== "string") {
        return res.status(400).json({ error: "Parameter 'address' is required" });
      }

      const ip = getClientIp(req);
      const now = Date.now();

      // Retrieve values from Google Cloud Secret Manager
      const privateKey = faucetPrivateKey.value();
      const nodeUrl = faucetNodeUrl.value() || "https://nodes-testnet.planetone.io";
      const chainId = faucetChainId.value() || "S";

      if (!privateKey) {
        return res.status(500).json({ error: "Faucet service is misconfigured: private key is missing." });
      }

      const gicAddress = address.startsWith("0x")
        ? ethAddress2waves(address, chainId)
        : address;

      if (!/^([3DSTWYL][a-zA-Z0-9]{34,35})$/.test(gicAddress)) {
        return res.status(400).json({ error: "Invalid PLO Testnet address" });
      }

      const addrSnap = await rtdb.ref(`faucet_addresses/${gicAddress}`).get();
      const ipSnap = await rtdb.ref(`faucet_ips/${ip || "unknown"}`).get();

      function isOnCooldown(snap) {
        if (!snap.exists()) return false;
        const last = snap.val().timestamp || 0;
        return now - last < COOLDOWN_MS;
      }

      if (isOnCooldown(addrSnap)) {
        const wait = Math.ceil((COOLDOWN_MS - (now - addrSnap.val().timestamp)) / 3.6e6);
        return res.status(429).json({ error: `Address must wait ${wait}h before requesting again` });
      }

      if (isOnCooldown(ipSnap)) {
        const wait = Math.ceil((COOLDOWN_MS - (now - ipSnap.val().timestamp)) / 3.6e6);
        return res.status(429).json({ error: `IP must wait ${wait}h before requesting again` });
      }

      const tx = transfer(
        {
          recipient: gicAddress,
          amount: AMOUNT,
          attachment: "",
          fee: FEE,
          chainId: chainId,
        },
        privateKey
      );

      const result = await broadcast(tx, nodeUrl);
      logger.info(`Transaction sent: ${result.id} to ${gicAddress} (IP: ${ip})`);

      await Promise.all([
        rtdb.ref(`faucet_addresses/${gicAddress}`).set({ timestamp: now, txId: result.id, ip }),
        rtdb.ref(`faucet_ips/${ip}`).set({ timestamp: now, txId: result.id, address: gicAddress }),
      ]);

      return res.json({
        success: true,
        txId: result.id,
        amount: "10 PLO",
        to: gicAddress,
        ethAlias: wavesAddress2eth(gicAddress),
      });
    } catch (err) {
      logger.error("Faucet error:", JSON.stringify(err) ?? err ?? "Unknown error");
      return res.status(500).json({ error: "Internal faucet error", details: err.message });
    }
  }
);
