import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getChainId, getGCSApiUrl } from '@/lib/utils';
import { ethAddress2waves } from '@better2better/waves-node-api-js';
import { Search, Loader2, ArrowRight, CornerDownLeft, Sparkles, Hash, ShieldCheck, Wallet, Database, Coins } from 'lucide-react';

const SearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global keydown listener for Cmd+K or Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time entity type detection
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setDetectedType(null);
      return;
    }

    if (query.startsWith('0x')) {
      if (query.length === 66) {
        setDetectedType('Transação EVM');
      } else {
        setDetectedType('Endereço EVM');
      }
    } else if (/^[1-9A-HJ-NP-Za-km-z]{34,36}$/.test(query)) {
      setDetectedType('Endereço PLO');
    } else if (query.length === 44 && isNaN(Number(query))) {
      setDetectedType('Asset / Token');
    } else if (!isNaN(Number(query))) {
      setDetectedType('Bloco');
    } else if (query.length < 37) {
      setDetectedType('Alias de Endereço');
    } else {
      setDetectedType('Transação PLO');
    }
  }, [searchQuery]);

  // Convert Ethereum address to Waves address
  const convertEthToWavesAddress = (ethAddress: string): string => {
    try {
      return ethAddress2waves(ethAddress, getChainId());
    } catch (error) {
      console.error('Error converting Ethereum address to Waves address:', error);
      return null;
    }
  };

  // Resolve alias to address
  const resolveAlias = async (alias: string): Promise<string | null> => {
    try {
      const apiUrl = getGCSApiUrl();
      const response = await fetch(`${apiUrl}/alias/by-alias/${alias}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.address || null;
    } catch (error) {
      console.error('Error resolving alias:', error);
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    
    if (!searchQuery.trim()) {
      toast.error("Por favor insira um termo de busca válido");
      return;
    }
    
    setIsSearching(true);
    const query = searchQuery.trim();
    
    try {
      if (query.startsWith('0x')) {
        toast.info("Analisando endereço Ethereum...");
        const convertedAddress = convertEthToWavesAddress(query);
        if (!convertedAddress) {
          toast.info("Processando hash como transação Ethereum...");
          navigate(`/tx/${query}`);
          return;
        }
  
        toast.success("Endereço Ethereum convertido com sucesso!");
        navigate(`/address/${convertedAddress}`);
        return;
      }
      
      const isBase58Address = /^[1-9A-HJ-NP-Za-km-z]{34,36}$/.test(query);
      if (isBase58Address) {
        toast.success("Endereço Planet One encontrado!");
        navigate(`/address/${query}`);
        return;
      }
      
      if (query.length === 44) {
        toast.success("Token encontrado!");
        navigate(`/asset/${query}`);
        return;
      }
      
      if (!isNaN(Number(query))) {
        toast.success("Bloco encontrado!");
        navigate(`/block/${query}`);
        return;
      }
      
      if (query.length < 37) {
        toast.info("Buscando alias...");
        const resolvedAddress = await resolveAlias(query);
        
        if (resolvedAddress) {
          toast.success("Alias resolvido!");
          navigate(`/address/${resolvedAddress}`);
          return;
        } else {
          toast.error("Alias não encontrado ou inválido");
          return;
        }
      }
      
      toast.success("Transação encontrada!");
      navigate(`/tx/${query}`);
      
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Erro ao realizar busca");
    } finally {
      setIsSearching(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Endereço PLO': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Endereço EVM': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Transação PLO': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'Transação EVM': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Bloco': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Asset / Token': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Alias de Endereço': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'Endereço PLO': return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 'Endereço EVM': return <Wallet className="w-4 h-4 text-blue-400" />;
      case 'Transação PLO': return <ShieldCheck className="w-4 h-4 text-teal-400" />;
      case 'Transação EVM': return <ShieldCheck className="w-4 h-4 text-sky-400" />;
      case 'Bloco': return <Database className="w-4 h-4 text-purple-400" />;
      case 'Asset / Token': return <Coins className="w-4 h-4 text-amber-400" />;
      default: return <Hash className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div ref={containerRef} className="w-full md:w-auto md:flex-1 max-w-xl relative">
      <form onSubmit={handleSearch} className="relative group">
        
        {/* Search Icon Left */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors duration-200 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Endereço, tx, bloco ou alias..."
          className="w-full pl-10 pr-24 py-5 text-xs rounded-xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground/75 focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 shadow-sm transition-all duration-300 group-hover:border-border-hover"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />

        {/* Keyboard shortcut tag */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] font-mono tracking-wider font-bold bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground flex items-center gap-0.5 hidden sm:flex select-none">
          <span>⌘</span>
          <span>K</span>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit"
          size="sm"
          disabled={isSearching}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 hover:shadow-glow-sm h-[80%] text-xs"
        >
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : "Buscar"}
        </Button>

      </form>

      {/* Futuristic Suggestions Spotlight Panel */}
      {isFocused && searchQuery.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-card/90 dark:bg-card/85 backdrop-blur-xl border border-border rounded-xl shadow-xl overflow-hidden p-2.5">
            
            {/* Header */}
            <div className="px-2 py-1.5 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-2">
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" /> Detecção Inteligente</span>
              <span>Spotlight</span>
            </div>

            {/* Main suggestion row */}
            {detectedType && (
              <div 
                onClick={handleSearch}
                className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/[0.02] border border-emerald-500/10 hover:border-emerald-500/20 cursor-pointer transition-all duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-card border border-border flex items-center justify-center">
                    {getEntityIcon(detectedType)}
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                      Buscar {detectedType}
                      <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[260px] sm:max-w-md mt-0.5">{searchQuery}</p>
                  </div>
                </div>

                <span className={`text-[9px] border rounded px-2 py-0.5 select-none font-bold uppercase tracking-wider ${getBadgeColor(detectedType)}`}>
                  {detectedType}
                </span>
              </div>
            )}

            {/* Instruction Footer */}
            <div className="mt-2.5 pt-2 border-t border-border/40 px-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 font-medium"><CornerDownLeft className="w-3 h-3" /> Pressione Enter para pesquisar</span>
              <span className="font-mono text-[9px] font-bold bg-muted px-1.5 py-0.5 border border-border rounded">W8DB INDEXER</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
