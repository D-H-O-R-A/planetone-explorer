import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { fetchLatestBlocks, Block, fetchBlock } from "@/services/api";
import { formatDate, formatNumber, timeSince, shortenHash } from "@/utils/formatter";
import { 
  ArrowLeft, 
  ArrowRight, 
  Blocks, 
  Loader2,
  Activity, 
  Cpu, 
  Database, 
  DollarSign, 
  Search, 
  Clock, 
  User, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { MotionContainer, MotionChild } from "@/components/ui/motion-container";
import { isTestnet, getGCSApiUrl, getCoinName } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

const BlocksPage = () => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentNetwork, setCurrentNetwork] = useState(isTestnet());
  const [searchHeight, setSearchHeight] = useState("");
  const blocksPerPage = 20;

  // Real-time Statistics derived from loaded block data
  const [avgBlockSize, setAvgBlockSize] = useState<number>(0);
  const [totalTxsRecent, setTotalTxsRecent] = useState<number>(0);
  const [latestProposer, setLatestProposer] = useState<string>("");

  useEffect(() => {
    const loadBlocks = async () => {
      setIsLoading(true);
      try {
        const latestBlocks = await fetchLatestBlocks(blocksPerPage);
        setBlocks(latestBlocks);
        setHasMore(latestBlocks.length >= blocksPerPage && latestBlocks[latestBlocks.length - 1].height > 1);

        // Derive stats
        if (latestBlocks.length > 0) {
          const sizes = latestBlocks.map(b => b.blockSize || b.size || (b as any).blocksize || 0).filter(s => s > 0);
          const avgSize = sizes.length > 0 ? Math.round(sizes.reduce((sum, s) => sum + s, 0) / sizes.length) : 0;
          setAvgBlockSize(avgSize);

          const totalTxs = latestBlocks.reduce((sum, b) => sum + (b.transactions?.length || b.transactionCount || 0), 0);
          setTotalTxsRecent(totalTxs);

          setLatestProposer(latestBlocks[0].generator || "");
        }
      } catch (error) {
        console.error("Error loading blocks:", error);
        toast.error("Erro ao carregar blocos on-chain.");
      } finally {
        setIsLoading(false);
      }
    };

    const newNetwork = isTestnet();
    if (newNetwork !== currentNetwork) {
      setCurrentNetwork(newNetwork);
    }

    loadBlocks();
    
    // Auto-refresh every 30 seconds for state-of-the-art telemetry
    const interval = setInterval(async () => {
      try {
        const networkCheck = isTestnet();
        if (networkCheck !== currentNetwork) {
          setCurrentNetwork(networkCheck);
          const updatedBlocks = await fetchLatestBlocks(blocksPerPage);
          setBlocks(updatedBlocks);
          setHasMore(updatedBlocks.length >= blocksPerPage && updatedBlocks[updatedBlocks.length - 1].height > 1);
          return;
        }

        const baseUrl = getGCSApiUrl();
        const latestBlockResponse = await fetch(`${baseUrl}/blocks/last`);
        if (!latestBlockResponse.ok) return;
        
        const latestBlock = await latestBlockResponse.json();
        
        if (blocks.length > 0 && blocks[0].height >= latestBlock.height) {
          return; // No new block
        }
        
        setBlocks(prev => {
          const newBlocks = [latestBlock, ...prev];
          const sliced = newBlocks.slice(0, blocksPerPage);
          
          // Recalculate stats dynamically
          const sizes = sliced.map(b => b.blockSize || b.size || (b as any).blocksize || 0).filter(s => s > 0);
          const avgSize = sizes.length > 0 ? Math.round(sizes.reduce((sum, s) => sum + s, 0) / sizes.length) : 0;
          setAvgBlockSize(avgSize);

          const totalTxs = sliced.reduce((sum, b) => sum + (b.transactions?.length || b.transactionCount || 0), 0);
          setTotalTxsRecent(totalTxs);

          setLatestProposer(sliced[0].generator || "");
          
          return sliced;
        });
      } catch (error) {
        console.error("Error refreshing latest block:", error);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [currentNetwork, blocks.length]);

  const loadMoreBlocks = async () => {
    try {
      if (blocks.length === 0) return;
      
      const lowestBlockHeight = blocks[blocks.length - 1].height;
      if (lowestBlockHeight <= 1) {
        setHasMore(false);
        return;
      }
      
      setIsLoading(true);
      const startHeight = lowestBlockHeight - 1;
      const moreBlocks: Block[] = [];
      
      // Fetch batch of blocks sequentially
      for (let height = startHeight; height > Math.max(1, startHeight - 10); height--) {
        try {
          const block = await fetchBlock(height);
          if (block) {
            moreBlocks.push(block);
          }
        } catch (error) {
          console.error(`Failed to fetch block at height ${height}:`, error);
        }
      }
      
      setBlocks(prev => [...prev, ...moreBlocks]);
      setHasMore(moreBlocks.length > 0 && moreBlocks[moreBlocks.length - 1].height > 1);
    } catch (error) {
      console.error("Error loading more blocks:", error);
      toast.error("Erro ao carregar lote adicional de blocos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(searchHeight.trim());
    if (isNaN(h) || h <= 0) {
      toast.error("Por favor, digite uma altura de bloco válida.");
      return;
    }
    navigate(`/block/${h}`);
  };

  const getBlockSize = (block: Block) => {
    return block.blockSize || block.size || (block as any).blocksize || 0;
  };

  const latestBlockHeight = blocks.length > 0 ? blocks[0].height : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 via-card to-card p-6 md:p-10 shadow-lg">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full filter blur-[80px] -z-10 animate-pulse duration-5000" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Consenso LPoS Telemetria
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Explorador de <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Blocos</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Navegue, inspecione e filtre em tempo real todos os blocos emitidos e validados pela rede descentralizada do <strong className="text-foreground font-semibold">Planet One ({getCoinName()})</strong>.
            </p>
          </div>
          
          {/* Quick Block Search */}
          <Card className="border border-border/60 bg-background/50 backdrop-blur-xl p-4 md:p-5 shadow-lg rounded-2xl w-full md:max-w-xs shrink-0">
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Buscar Bloco por Altura
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={searchHeight}
                  onChange={(e) => setSearchHeight(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Ex: 104523"
                  className="pl-4 pr-10 py-5 text-sm font-mono font-bold rounded-xl border-border bg-background focus-visible:ring-emerald-500/50"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 hover:bg-emerald-500/15 hover:text-emerald-500 text-muted-foreground rounded-lg h-8 w-8"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Network Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Stat: Latest Height */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow-md overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Última Altura</span>
              <h3 className="text-2xl font-black text-foreground font-mono">
                {latestBlockHeight > 0 ? formatNumber(latestBlockHeight) : <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />}
              </h3>
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-500 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Sincronizado (Live)
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Blocks className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Stat: Total Txs in batch */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow-md overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Transações Recentes</span>
              <h3 className="text-2xl font-black text-foreground font-mono">
                {totalTxsRecent > 0 ? formatNumber(totalTxsRecent) : '0'} txs
              </h3>
              <span className="text-[10px] text-muted-foreground block pt-1">
                Soma nos últimos 20 blocos
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Stat: Avg Block Size */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow-md overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Tamanho Médio</span>
              <h3 className="text-2xl font-black text-foreground font-mono">
                {avgBlockSize > 0 ? `${(avgBlockSize / 1024).toFixed(1)} KB` : 'Unknown'}
              </h3>
              <span className="text-[10px] text-muted-foreground block pt-1">
                {avgBlockSize > 0 ? `${formatNumber(avgBlockSize)} bytes` : 'Calibrando métricas...'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Database className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Stat: Latest Proposer */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow-md overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1 max-w-[calc(100%-48px)]">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Último Propositor</span>
              <h3 className="text-base font-bold text-foreground font-mono truncate pt-1">
                {latestProposer ? shortenHash(latestProposer, 6) : <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
              </h3>
              {latestProposer && (
                <Link to={`/address/${latestProposer}`} className="text-[10px] text-emerald-500 hover:underline font-bold inline-flex items-center gap-0.5">
                  Ver Validador <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Blocks Directory Listing Card */}
      <Card className="border border-border bg-card/30 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Blocks className="w-5.5 h-5.5 text-emerald-500" />
                Últimos Blocos Emitidos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Lista de blocos on-chain sincronizados e validados pelos nós.
              </CardDescription>
            </div>
            {blocks.length > 0 && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-[10px] font-bold">
                Mostrando {blocks.length} blocos
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Desktop Table: visible on md and up */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="font-bold text-muted-foreground">Altura</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Idade / Timestamp</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Transações</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Validador Propositor</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Tamanho do Bloco</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-right">Taxas (Fees)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => {
                  const size = getBlockSize(block);
                  const txCount = block.transactions?.length || block.transactionCount || 0;
                  const feeValue = block.fee || block.totalFee || 0;
                  return (
                    <TableRow 
                      key={block.height} 
                      className="border-b border-border/30 hover:bg-emerald-500/5 transition-all duration-150 group"
                    >
                      <TableCell className="py-4">
                        <Link 
                          to={`/block/${block.height}`} 
                          className="font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1 font-mono"
                        >
                          #{block.height}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {timeSince(block.timestamp)}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatDate(block.timestamp)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge variant="outline" className={`font-semibold text-xs ${txCount > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                          {txCount} {txCount === 1 ? 'tx' : 'txs'}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <Link 
                            to={`/address/${block.generator}`} 
                            className="font-mono text-sm text-foreground hover:text-emerald-500 hover:underline transition-colors"
                          >
                            {shortenHash(block.generator, 10)}
                          </Link>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 font-mono text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {size > 0 ? `${(size / 1024).toFixed(1)} KB` : 'Unknown'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {size > 0 ? `${formatNumber(size)} bytes` : '0 bytes'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-right font-mono text-sm font-semibold text-foreground">
                        {feeValue > 0 ? `${(feeValue / 1e8).toFixed(6)}` : '0.00'} <span className="text-emerald-500 text-xs font-bold">{getCoinName()}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View: visible on block md:hidden (gorgeous card list) */}
          <div className="block md:hidden p-4 space-y-4">
            {blocks.map((block) => {
              const size = getBlockSize(block);
              const txCount = block.transactions?.length || block.transactionCount || 0;
              const feeValue = block.fee || block.totalFee || 0;
              return (
                <div 
                  key={block.height}
                  onClick={() => navigate(`/block/${block.height}`)}
                  className="p-4 rounded-xl border border-border/80 bg-background/40 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all duration-150 active:scale-[0.98] cursor-pointer space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-500 font-mono text-base flex items-center gap-1">
                      #{block.height}
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </span>
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeSince(block.timestamp)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Validador</span>
                      <span className="font-mono text-foreground font-semibold">
                        {shortenHash(block.generator, 5)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Tamanho</span>
                      <span className="font-mono text-foreground font-semibold">
                        {size > 0 ? `${(size / 1024).toFixed(1)} KB` : 'Unknown'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Transações</span>
                      <Badge variant="outline" className={`font-bold py-0 h-5 text-[10px] ${txCount > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                        {txCount} txs
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Taxas</span>
                      <span className="font-semibold text-foreground font-mono">
                        {feeValue > 0 ? (feeValue / 1e8).toFixed(4) : '0.0'} {getCoinName()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-muted-foreground animate-pulse">Sincronizando lote de blocos com a blockchain...</p>
            </div>
          )}

          {/* Empty State */}
          {blocks.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 gap-2">
              <Blocks className="w-12 h-12 text-muted-foreground opacity-40 animate-pulse" />
              <p className="text-sm font-semibold text-foreground">Nenhum bloco localizado</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                Não foi possível encontrar blocos on-chain nesta rede. Verifique se o nó local está respondendo.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !isLoading && (
            <div className="text-center p-6 border-t border-border/30">
              <Button 
                onClick={loadMoreBlocks}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl px-10 py-5 text-xs shadow-lg shadow-emerald-500/15"
              >
                Carregar Mais Blocos
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
};

export default BlocksPage;
