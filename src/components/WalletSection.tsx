
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useChainManager } from '@/hooks/useChainManager';
import WalletConnectDropdown from './WalletConnectDropdown';
import WalletDropdown from './WalletDropdown';
import { isTestnet } from '@/lib/utils';

const WalletSection = () => {
  const {
    isConnected,
    walletAddress,
    walletType,
    connectMetamask,
    connectGicWallet,
    disconnect
  } = useWalletConnection();

  const { handleAddGicChain, isAddingChain } = useChainManager(walletType);
  const currentIsTestnet = isTestnet();

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0">
      {!isConnected ? (
        <WalletConnectDropdown 
          onConnectMetamask={connectMetamask}
          onConnectGicWallet={connectGicWallet}
        />
      ) : (
        <>
          <WalletDropdown 
            walletAddress={walletAddress}
            walletType={walletType}
            onDisconnect={disconnect}
          />
          <Button 
            onClick={handleAddGicChain}
            size="sm"
            disabled={isAddingChain}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-all duration-200 hover:shadow-glow-sm"
          >
            {isAddingChain ? "Adding..." : "Add Planet One Blockchain"}
          </Button>
        </>
      )}
    </div>
  );
};

export default WalletSection;
