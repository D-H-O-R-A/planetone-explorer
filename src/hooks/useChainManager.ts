import { useState } from 'react';
import { toast } from 'sonner';
import { WalletType } from './useWalletConnection';
import { getCoinName, getChainId, getEthNodeUrl } from '@/lib/utils';

interface WindowWithEthereum extends Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
  GicWalletPro?: {
    publicState: () => Promise<{ 
      account?: { address: string };
      currentNetwork?: string;
    }>;
  };
}

export const useChainManager = (walletType: WalletType) => {
  const [isAddingChain, setIsAddingChain] = useState(false);

  const addGicChainToMetamask = async () => {
    try {
      setIsAddingChain(true);
      const coinName = getCoinName();
      const chainId = getChainId();
      const hexChainId = '0x' + chainId.toString(16);
      const rpcUrl = getEthNodeUrl();

      console.log(`Trying to add ${coinName} Blockchain to MetaMask...`);
      const windowWithEthereum = window as WindowWithEthereum;
      
      if (!windowWithEthereum.ethereum) {
        toast.error("MetaMask not found!");
        return;
      }

      await windowWithEthereum.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: hexChainId,
          chainName: `${coinName} Blockchain`,
          nativeCurrency: {
            name: coinName,
            symbol: coinName,
            decimals: 18,
          },
          rpcUrls: [rpcUrl],
          blockExplorerUrls: [window.location.origin],
        }],
      });

      toast.success(`${coinName} chain successfully added to MetaMask`);
    } catch (error: any) {
      console.error(`Error adding ${getCoinName()} chain to MetaMask:`, error);
      toast.error(error.message || `Failed to add ${getCoinName()} chain to MetaMask`);
    } finally {
      setIsAddingChain(false);
    }
  };

  const checkGicWalletNetwork = async () => {
    try {
      const windowWithEthereum = window as WindowWithEthereum;
      return toast.info("GKeeper connection is temporarily disabled for maintenance.");
      
      if (!windowWithEthereum.GicWalletPro) {
        toast.error("GKeeper not found!");
        return;
      }

      const state = await windowWithEthereum.GicWalletPro.publicState();
      const network = state.currentNetwork;
      const coinName = getCoinName();
      
      if (network === 'mainnet') {
        toast.success(`You are on ${coinName} mainnet`);
      } else if (network === 'testnet') {
        toast.success(`You are on ${coinName} testnet`);
      } else {
        toast.info(`Current network: ${network || 'unknown'}`);
      }
    } catch (error: any) {
      console.error(`Error checking ${getCoinName()} Wallet network:`, error);
      toast.error("Failed to check GKeeper network");
    }
  };

  const handleAddGicChain = async () => {
    if (walletType === 'metamask') {
      await addGicChainToMetamask();
    } else if (walletType === 'gkeeper') {
      await checkGicWalletNetwork();
    } else {
      toast.error("Please connect a wallet first");
    }
  };

  return {
    handleAddGicChain,
    isAddingChain
  };
};
