import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WalletConnectDropdownProps {
  onConnectMetamask: () => void;
  onConnectGicWallet?: () => void;
}

const WalletConnectDropdown: React.FC<WalletConnectDropdownProps> = ({ 
  onConnectMetamask, 
  onConnectGicWallet 
}) => {
  const handleConnectPlanetOneWallet = () => {
    window.open('https://wallet.planetone.io', '_blank');
  };

  const handleConnectB2Wallet = () => {
    window.open('https://better2better.net/softwares/b2-wallet', '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm"
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold transition-all duration-200 shadow-md shadow-emerald-500/10 rounded-lg"
        >
          <Wallet className="mr-2 h-4 w-4 text-black" />
          Conectar Carteira
          <ChevronDown className="ml-1 h-3 w-3 text-black" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card text-card-foreground border border-border rounded-lg p-1.5 w-52 z-[100] shadow-md">
        
        {/* Planet One Wallet (Official - Direct link) */}
        <DropdownMenuItem 
          onClick={handleConnectPlanetOneWallet} 
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer rounded transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <img src="/img/logo.png" alt="Planet One" className="w-5 h-5 rounded-full object-cover border border-emerald-500/20" />
            <span>Planet One Wallet</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
        </DropdownMenuItem>

        {/* MetaMask */}
        <DropdownMenuItem 
          onClick={onConnectMetamask} 
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer rounded transition-colors"
        >
          <img src="/img/metamask.png" alt="MetaMask" className="w-5 h-5 object-contain" />
          <span>MetaMask</span>
        </DropdownMenuItem>

        {/* B2 Wallet (Link) */}
        <DropdownMenuItem 
          onClick={handleConnectB2Wallet} 
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer rounded transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <img src="/img/b2_wallet.png" alt="B2 Wallet" className="w-5 h-5 rounded object-cover border border-border" />
            <span>B2 Wallet</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletConnectDropdown;
