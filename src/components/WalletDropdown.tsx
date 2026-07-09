
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCoinName } from '@/lib/utils';
import { WalletType } from '@/hooks/useWalletConnection';

interface WalletDropdownProps {
  walletAddress: string;
  walletType: WalletType;
  onDisconnect: () => void;
}

const WalletDropdown: React.FC<WalletDropdownProps> = ({ 
  walletAddress, 
  walletType, 
  onDisconnect 
}) => {
  const handleViewInExplorer = () => {
    window.open(`/address/${walletAddress}`, '_blank');
  };

  const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className="bg-green-900/20 px-3 py-1.5 rounded-full border border-green-500/30 hover:bg-green-900/30"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-400 font-medium">
              {shortAddress}
            </span>
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-green-300">
              {walletType === 'metamask' ? 'MM' : getCoinName()}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
        <DropdownMenuItem onClick={handleViewInExplorer} className="text-white hover:bg-gray-800">
          <ExternalLink className="mr-2 h-4 w-4" />
          View in Explorer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDisconnect} className="text-green-400 hover:bg-gray-800">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletDropdown;
