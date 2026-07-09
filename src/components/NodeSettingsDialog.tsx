import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, RotateCcw, HelpCircle, Check, Network, Server } from "lucide-react";
import { toast } from "sonner";
import { 
  getNodeUrl, 
  getEthNodeUrl, 
  getChainIdLetter, 
  getCoinName,
  NODE_URL,
  ETH_NODE_URL,
  CHAIN_ID_LETTER
} from "@/lib/utils";

interface Preset {
  name: string;
  nodeUrl: string;
  ethRpcUrl: string;
  coinName: string;
  chainIdLetter: string;
}

const PRESETS: Preset[] = [
  {
    name: "Planet One Mainnet",
    nodeUrl: "https://nodes.planetone.io",
    ethRpcUrl: "https://rpc.planetone.io",
    coinName: "PLO",
    chainIdLetter: "P"
  },
  {
    name: "Planet One Testnet",
    nodeUrl: "https://nodes-testnet.planetone.io",
    ethRpcUrl: "https://rpc-testnet.planetone.io",
    coinName: "PLOT",
    chainIdLetter: "S"
  }
];

export const NodeSettingsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [nodeUrl, setNodeUrl] = useState('');
  const [ethRpcUrl, setEthRpcUrl] = useState('');
  const [coinName, setCoinName] = useState('');
  const [chainIdLetter, setChainIdLetter] = useState('');

  // Load current settings when dialog opens
  useEffect(() => {
    if (open) {
      setNodeUrl(getNodeUrl());
      setEthRpcUrl(getEthNodeUrl());
      setCoinName(getCoinName());
      setChainIdLetter(getChainIdLetter());
    }
  }, [open]);

  const handleSave = () => {
    try {
      if (!nodeUrl.trim() || !ethRpcUrl.trim() || !coinName.trim() || !chainIdLetter.trim()) {
        toast.error("Por favor, preencha todos os campos");
        return;
      }

      // Quick URL validation
      if (!nodeUrl.startsWith('http://') && !nodeUrl.startsWith('https://')) {
        toast.error("A URL do nó deve começar com http:// ou https://");
        return;
      }
      if (!ethRpcUrl.startsWith('http://') && !ethRpcUrl.startsWith('https://')) {
        toast.error("A URL do RPC ETH deve começar com http:// ou https://");
        return;
      }

      // Max 1 character for chain id letter
      const normalizedLetter = chainIdLetter.trim().substring(0, 1).toUpperCase();

      localStorage.setItem('custom_node_url', nodeUrl.trim());
      localStorage.setItem('custom_eth_node_url', ethRpcUrl.trim());
      localStorage.setItem('custom_coin_name', coinName.trim().toUpperCase());
      localStorage.setItem('custom_chain_id_letter', normalizedLetter);
      localStorage.setItem('custom_chain_id', String(normalizedLetter.charCodeAt(0)));

      toast.success("Configurações salvas com sucesso! Reconectando...");
      setOpen(false);

      // Reload to apply settings globally across the app
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao salvar as configurações");
    }
  };

  const handleApplyPreset = (preset: Preset) => {
    setNodeUrl(preset.nodeUrl);
    setEthRpcUrl(preset.ethRpcUrl);
    setCoinName(preset.coinName);
    setChainIdLetter(preset.chainIdLetter);
    toast.info(`Predefinição "${preset.name}" aplicada!`);
  };

  const handleReset = () => {
    localStorage.removeItem('custom_node_url');
    localStorage.removeItem('custom_eth_node_url');
    localStorage.removeItem('custom_coin_name');
    localStorage.removeItem('custom_chain_id_letter');
    localStorage.removeItem('custom_chain_id');

    setNodeUrl(NODE_URL);
    setEthRpcUrl(ETH_NODE_URL);
    setCoinName("PLO");
    setChainIdLetter(CHAIN_ID_LETTER);

    toast.success("Configurações redefinidas para o padrão!");
    setOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          title="Configurações de Rede"
          className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 font-semibold text-xs"
        >
          <Settings className="w-4 h-4 animate-spin-hover text-emerald-500" />
          <span>Configurações</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[480px] bg-background border border-border text-foreground shadow-2xl rounded-2xl p-6 overflow-hidden">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold flex items-center gap-2.5 text-foreground">
            <Server className="w-5 h-5 text-emerald-500" /> Configurações de Rede
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
            Personalize as conexões dos nós RPC, o símbolo da moeda e as propriedades da rede PlanetOne.
          </DialogDescription>
        </DialogHeader>

        {/* Presets Grid */}
        <div className="space-y-2 mt-4">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Predefinições Rápidas</Label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => {
              const isActive = nodeUrl === preset.nodeUrl && chainIdLetter === preset.chainIdLetter;
              return (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className={`flex items-center justify-between p-2.5 text-xs rounded-xl border text-left cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold' 
                      : 'bg-muted/45 border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{preset.name}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3.5 py-4">
          {/* Node URL */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="node-url" className="text-xs font-semibold text-foreground/90">URL do Nó (REST API)</Label>
              <span className="text-[9px] text-emerald-500 font-mono font-semibold">Obrigatório</span>
            </div>
            <Input
              id="node-url"
              value={nodeUrl}
              onChange={(e) => setNodeUrl(e.target.value)}
              placeholder="https://nodes.planetone.io"
              className="bg-muted/30 border-border text-foreground rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-xs h-9.5"
            />
          </div>

          {/* ETH RPC URL */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="eth-rpc" className="text-xs font-semibold text-foreground/90">URL do Nó RPC Ethereum (EVM)</Label>
              <span className="text-[9px] text-emerald-500 font-mono font-semibold">Obrigatório</span>
            </div>
            <Input
              id="eth-rpc"
              value={ethRpcUrl}
              onChange={(e) => setEthRpcUrl(e.target.value)}
              placeholder="https://rpc.planetone.io"
              className="bg-muted/30 border-border text-foreground rounded-xl focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-xs h-9.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Currency Name */}
            <div className="space-y-1">
              <Label htmlFor="coin-name" className="text-xs font-semibold text-foreground/90">Símbolo da Moeda</Label>
              <Input
                id="coin-name"
                value={coinName}
                onChange={(e) => setCoinName(e.target.value)}
                placeholder="PLO"
                className="bg-muted/30 border-border text-foreground rounded-xl focus-visible:ring-emerald-500 text-xs h-9.5 uppercase font-semibold"
              />
            </div>

            {/* Chain ID Letter */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="chain-id-letter" className="text-xs font-semibold text-foreground/90">Letra da Rede</Label>
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-popover border border-border text-[10px] text-muted-foreground rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 leading-normal">
                    Letra identificadora da rede (ex: 'P' para PlanetOne Mainnet, 'S' para Testnet). Usado para decodificar e validar os endereços criptográficos.
                  </div>
                </div>
              </div>
              <Input
                id="chain-id-letter"
                value={chainIdLetter}
                onChange={(e) => setChainIdLetter(e.target.value.substring(0, 1).toUpperCase())}
                placeholder="P"
                className="bg-muted/30 border-border text-foreground rounded-xl focus-visible:ring-emerald-500 text-xs h-9.5 text-center font-bold"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3.5 mt-2 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="w-full sm:w-auto text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer flex items-center justify-center gap-1.5 h-9 rounded-xl font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrões
          </Button>

          <div className="flex w-full sm:w-auto gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 sm:flex-none border-border text-muted-foreground hover:bg-muted/50 cursor-pointer text-xs h-9 rounded-xl font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer text-xs font-bold h-9 rounded-xl px-4 shadow-lg shadow-emerald-500/10"
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
