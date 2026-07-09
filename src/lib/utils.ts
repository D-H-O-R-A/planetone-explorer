
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Constants for blockchain node connections
export const NODE_URL = 'https://nodes.planetone.io';
export const ETH_NODE_URL = 'https://rpc.planetone.io';
export const CHAIN_ID = 80; // Planet One Blockchain ID
export const EXPLORER_URL = 'https://explorer.planetone.io';
export const CHAIN_ID_LETTER = 'P'; // Chain ID letter for Planet One SDK

// Testnet constants
export const TESTNET_NODE_URL = 'https://nodes-testnet.planetone.io';
export const TESTNET_ETH_NODE_URL = 'https://rpc-testnet.planetone.io';
export const TESTNET_CHAIN_ID = 'S'; // Testnet Chain ID
export const TESTNET_EXPLORER_URL = 'https://testnet-explorer.planetone.io';

// Import necessary functions from @better2better/waves-node-api-js
import { wavesAsset2Eth, ethTxId2waves } from '@better2better/waves-node-api-js';

// Add utility functions for asset and transaction conversions
export const convertWavesAssetToEth = (assetId: string): string => {
  try {
    return wavesAsset2Eth(assetId);
  } catch (error) {
    console.error("Error converting Waves asset to ETH:", error);
    return assetId;
  }
};

export const convertEthTxToWaves = (txId: string): string => {
  try {
    return ethTxId2waves(txId);
  } catch (error) {
    console.error("Error converting ETH tx to Waves:", error);
    return txId;
  }
};

// Environment detection
export const isTestnet = () => {
  const mode = localStorage.getItem('network_mode');
  if (mode === 'testnet') return true;
  if (mode === 'mainnet') return false;
  return window.location.hostname.includes('testnet') || 
         window.location.search.includes('testnet=true');
};

// Get appropriate URLs based on environment and local storage
export const getNodeUrl = (): string => {
  if (isTestnet()) return TESTNET_NODE_URL;
  return localStorage.getItem('custom_node_url') || NODE_URL;
};

export const getEthNodeUrl = (): string => {
  if (isTestnet()) return TESTNET_ETH_NODE_URL;
  return localStorage.getItem('custom_eth_node_url') || ETH_NODE_URL;
};

export const getChainId = (): number => {
  if (isTestnet()) return 83; // 'S' in ASCII is 83
  const custom = localStorage.getItem('custom_chain_id');
  if (custom) {
    if (isNaN(Number(custom))) {
      return custom.charCodeAt(0);
    } else {
      return Number(custom);
    }
  }
  return CHAIN_ID;
};

export const getChainIdLetter = (): string => {
  if (isTestnet()) return 'S';
  const customLetter = localStorage.getItem('custom_chain_id_letter');
  if (customLetter) return customLetter;
  const custom = localStorage.getItem('custom_chain_id');
  if (custom) {
    if (isNaN(Number(custom))) {
      return custom.substring(0, 1).toUpperCase();
    } else {
      return String.fromCharCode(Number(custom));
    }
  }
  return CHAIN_ID_LETTER;
};

export const getCoinName = (): string => {
  if (isTestnet()) return 'PLOT';
  return localStorage.getItem('custom_coin_name') || 'PLO';
};

export const getExplorerUrl = (): string => isTestnet() ? TESTNET_EXPLORER_URL : EXPLORER_URL;

// Get the appropriate base URL for GCS API based on current network and custom node URL
export const getGCSApiUrl = (): string => {
  if (isTestnet()) return TESTNET_NODE_URL;
  return localStorage.getItem('custom_node_url') || NODE_URL;
};

// Get the appropriate base URL for the FullExplorer API (PHP backend)
export const getFullExplorerApiUrl = (): string => {
  const isTest = isTestnet();
  
  // Allow overriding via localStorage for local backend development
  const customUrl = localStorage.getItem('custom_fullexplorer_url');
  if (customUrl) return customUrl;

  // Auto-detect local development
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.hostname.startsWith('192.168.');
  
  if (isLocalhost) {
    return "http://localhost:8080/api";
  }

  return isTest ? "https://testnet-fullexplorer.planetone.io/api" : "https://fullexplorer.planetone.io/api";
};

// Get the appropriate base URL for the FullExplorer Web UI
export const getFullExplorerUiUrl = (path: string = ''): string => {
  const isTest = isTestnet();
  
  // Allow overriding via localStorage
  const customUrl = localStorage.getItem('custom_fullexplorer_ui_url');
  if (customUrl) return `${customUrl}/${path}`;

  // Auto-detect local development
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.hostname.startsWith('192.168.');
  
  let baseUrl = '';
  if (isLocalhost) {
    baseUrl = "http://localhost:8080";
  } else {
    baseUrl = isTest ? "https://testnet-fullexplorer.planetone.io" : "https://fullexplorer.planetone.io";
  }
  return path ? `${baseUrl}/${path}` : baseUrl;
};



