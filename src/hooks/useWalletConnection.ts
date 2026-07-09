
import { Toast } from '@/components/ui/toast';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Interface for window with wallet extensions
interface WindowWithEthereum extends Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    selectedAddress?: string;
  };
  GicWalletPro?: {
    publicState: () => Promise<{ account?: { address: string } }>;
    auth: () => Promise<{ address: string }>;
  };
}

export type WalletType = 'metamask' | 'gkeeper' | null;

export const useWalletConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState<WalletType>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const windowWithEthereum = window as WindowWithEthereum;
      
      // Check MetaMask connection
      if (windowWithEthereum.ethereum && windowWithEthereum.ethereum.selectedAddress) {
        setIsConnected(true);
        setWalletAddress(windowWithEthereum.ethereum.selectedAddress);
        setWalletType('metamask');
        console.log("MetaMask already connected:", windowWithEthereum.ethereum.selectedAddress);
        return;
      }
      
      // Check GKeeper connection
      if (windowWithEthereum.GicWalletPro) {
        return;
        try {
          const state = await windowWithEthereum.GicWalletPro.publicState();
          if (state.account?.address) {
            setIsConnected(true);
            setWalletAddress(state.account.address);
            setWalletType('gkeeper');
            console.log("GKeeper already connected:", state.account.address);
          }
        } catch (error) {
          console.log("GKeeper not authenticated");
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectMetamask = async () => {
    try {
      console.log("Trying to connect to MetaMask...");
      const windowWithEthereum = window as WindowWithEthereum;
      if (!windowWithEthereum.ethereum) {
        toast.error("MetaMask not found! Please install the MetaMask extension.");
        return;
      }

      const accounts = await windowWithEthereum.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setWalletAddress(accounts[0]);
        setWalletType('metamask');
        toast.success("Successfully connected to MetaMask");
        console.log("Connected to MetaMask:", accounts[0]);
      } else {
        toast.error("No accounts found! Please create an account in MetaMask.");
      }
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error);
      toast.error(error.message || "Failed to connect to MetaMask");
    }
  };

  const connectGicWallet = async () => {
    try {
      console.log("Trying to connect to GKeeper...");
      const windowWithEthereum = window as WindowWithEthereum;
      return toast.info("GKeeper connection is temporarily disabled for maintenance.");
      if (!windowWithEthereum.GicWalletPro) {
        toast.error("GKeeper not found! Redirecting to installation...");
        window.open('https://chromewebstore.google.com/detail/gic-wallet-pro/kcpjmfgfjglnkkklpfnlkmbhkndmplfc?hl=pt', '_blank');
        return;
      }

      const authResult = await windowWithEthereum.GicWalletPro.auth();
      
      if (authResult?.address) {
        setIsConnected(true);
        setWalletAddress(authResult.address);
        setWalletType('gkeeper');
        toast.success("Successfully connected to GKeeper");
        console.log("Connected to GKeeper:", authResult.address);
      } else {
        toast.error("Authentication failed with GKeeper");
      }
    } catch (error: any) {
      console.error("Error connecting to GKeeper:", error);
      toast.error(error.message || "Failed to connect to GKeeper");
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    setWalletType(null);
    toast.success("Wallet disconnected");
  };

  return {
    isConnected,
    walletAddress,
    walletType,
    connectMetamask,
    connectGicWallet,
    disconnect
  };
};
