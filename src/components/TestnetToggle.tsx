
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { isTestnet } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';

const TestnetToggle: React.FC = () => {
  const currentIsTestnet = isTestnet();

  const toggleTestnet = (checked: boolean) => {
    const targetMode = checked ? 'testnet' : 'mainnet';
    localStorage.setItem('network_mode', targetMode);
    
    toast.success(`Alterando para a rede ${checked ? 'Testnet' : 'Mainnet'}...`);
    
    // Smoothly reload page to apply new network settings
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/40 backdrop-blur-sm hover:border-border/80 transition-all select-none">
      <Globe className={`w-3.5 h-3.5 transition-colors ${currentIsTestnet ? 'text-orange-500 animate-pulse' : 'text-emerald-500'}`} />
      <span className="text-xs font-bold text-foreground">
        {currentIsTestnet ? 'Testnet' : 'Mainnet'}
      </span>
      <Switch
        id="testnet-mode"
        checked={currentIsTestnet}
        onCheckedChange={toggleTestnet}
        className="data-[state=checked]:bg-orange-500 h-5 w-9"
      />
    </div>
  );
};

export default TestnetToggle;
