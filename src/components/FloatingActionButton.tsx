import React, { useState, useEffect } from 'react';
import { Search, X, ChevronUp, Loader2, AlertCircle, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getChainId, getGCSApiUrl } from '@/lib/utils';
import { ethAddress2waves } from '@better2better/waves-node-api-js';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  // Monitor scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  // Convert Ethereum address to Waves address
  const convertEthToWavesAddress = (ethAddress: string): string => {
    try {
      return ethAddress2waves(ethAddress, getChainId());
    } catch (err) {
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
    
    if (!searchQuery.trim()) {
      toast.error("Por favor, digite um termo de busca válido");
      return;
    }
    
    setIsSearching(true);
    setSearchStatus('searching');
    
    const query = searchQuery.trim();
    
    try {
      // 1. If starts with 0x, convert or search as TX
      if (query.startsWith('0x')) {
        toast.info("Identificado endereço Ethereum. Buscando...");
        const convertedAddress = convertEthToWavesAddress(query);
        if (!convertedAddress) {
          setSearchStatus('error');
          toast.info("Tentando identificar como Transação EVM...");
          navigate(`/tx/${query}`);
          setIsOpen(false);
          return;
        }
        setSearchStatus('success');
        toast.success("Endereço Ethereum convertido com sucesso!");
        navigate(`/address/${convertedAddress}`);
        setIsOpen(false);
        return;
      }
      
      // 2. Base58 Address
      const isBase58Address = /^[1-9A-HJ-NP-Za-km-z]{34,36}$/.test(query);
      if (isBase58Address) {
        setSearchStatus('success');
        toast.success("Endereço localizado!");
        navigate(`/address/${query}`);
        setIsOpen(false);
        return;
      }
      
      // 3. Asset ID
      if (query.length === 44) {
        setSearchStatus('success');
        toast.success("Asset localizado!");
        if (query === 'VERDE') {
          navigate('/tokenplanet/VERDE');
        } else {
          navigate(`/asset/${query}`);
        }
        setIsOpen(false);
        return;
      }

      // 4. Special cases for VERDE/PLO
      if (query.toUpperCase() === 'VERDE') {
        setSearchStatus('success');
        navigate('/tokenplanet/VERDE');
        setIsOpen(false);
        return;
      }
      
      // 5. Block height
      if (!isNaN(Number(query))) {
        setSearchStatus('success');
        toast.success("Bloco localizado!");
        navigate(`/block/${query}`);
        setIsOpen(false);
        return;
      }
      
      // 6. Alias
      if (query.length < 37) {
        toast.info("Buscando alias...");
        const resolvedAddress = await resolveAlias(query);
        
        if (resolvedAddress) {
          setSearchStatus('success');
          toast.success("Alias resolvido com sucesso!");
          navigate(`/address/${resolvedAddress}`);
          setIsOpen(false);
          return;
        } else {
          setSearchStatus('error');
          toast.error("Alias não encontrado");
          return;
        }
      }
      
      // Fallback - Treat as Waves Tx ID
      setSearchStatus('success');
      toast.success("Buscando transação...");
      navigate(`/tx/${query}`);
      setIsOpen(false);
      
    } catch (error) {
      console.error("Search error:", error);
      setSearchStatus('error');
      toast.error("Ocorreu um erro ao realizar a busca");
    } finally {
      setIsSearching(false);
      setTimeout(() => {
        setSearchStatus('idle');
      }, 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <div className="fixed z-[180] md:hidden bottom-20 right-4 flex flex-col gap-3">
        {/* Animated scroll to top button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex justify-center"
            >
              <motion.div 
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className="h-10 w-10 rounded-full bg-emerald-500/95 dark:bg-emerald-500/80 hover:bg-emerald-600 dark:hover:bg-emerald-500/95 backdrop-blur-md shadow-lg flex items-center justify-center text-white cursor-pointer transition-colors border border-emerald-500/10"
              >
                <ChevronUp className="h-5 w-5" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setIsOpen(true)}
            size="icon"
            className="h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/25 border border-emerald-500/20"
          >
            <Search className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="bottom" 
          className="h-[45vh] rounded-t-3xl pt-6 bg-background/95 dark:bg-background/90 backdrop-blur-xl border-t border-border z-[250] px-6 flex flex-col justify-between pb-8"
        >
          <div className="space-y-4">
            <SheetHeader>
              <SheetTitle className="text-emerald-500 flex items-center gap-2 text-lg font-bold">
                <Compass className="w-5 h-5 text-emerald-500 animate-spin-slow" />
                <span>Busca Rápida</span>
                {searchStatus === 'searching' && (
                  <Loader2 className="ml-2 w-4 h-4 text-emerald-500 animate-spin" />
                )}
              </SheetTitle>
            </SheetHeader>
            
            <div className="pt-2">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Endereço (0x ou Base58), transação, bloco, alias..."
                    className={`pr-10 bg-muted/40 border-border text-foreground rounded-xl py-6 text-sm focus-visible:ring-emerald-500/50 
                      ${searchStatus === 'error' ? 'border-rose-500/50 focus-visible:ring-rose-500/45' : 
                      searchStatus === 'success' ? 'border-emerald-500/50 focus-visible:ring-emerald-500/45' : 
                      ''}`}
                    autoFocus
                  />
                  {searchQuery && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
                
                {searchStatus === 'error' && (
                  <div className="text-rose-500 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Nenhum resultado correspondente localizado. Verifique e tente novamente.
                  </div>
                )}
                
                <div className="flex gap-3 pt-2">
                  <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsOpen(false)}
                      className="w-full border-border text-foreground hover:bg-muted/50 rounded-xl py-5 font-semibold text-xs"
                    >
                      Cancelar
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                    <Button 
                      type="submit" 
                      className={`w-full ${isSearching ? 'bg-emerald-500/70' : 'bg-emerald-500 hover:bg-emerald-600'} text-white shadow-lg shadow-emerald-500/20 rounded-xl py-5 font-semibold text-xs`}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Buscando...
                        </span>
                      ) : "Buscar"}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingActionButton;
