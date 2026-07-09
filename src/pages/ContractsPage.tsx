import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { formatTimeAgo, formatDate, shortenHash } from "@/utils/formatter";
import { 
  Code, Copy, ExternalLink, Search, Terminal, Cpu, Layers, 
  Activity, Check, Play, FileCode, Clock, Info, ShieldAlert, RefreshCw 
} from "lucide-react";
import { MotionContainer, MotionChild } from "@/components/ui/motion-container";
import { fetchContracts, Contract } from "@/services/api";
import { toast } from "sonner";

// Micro-component for clipboard copies with animation
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200 ml-1.5"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Copy className="h-3.5 w-3.5 opacity-60 hover:opacity-100 transition-opacity" />
      )}
    </Button>
  );
};

const ContractsPage = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "dApp" | "Smart Account">("all");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadContracts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchContracts();
        setContracts(data);
        if (data.length < 100) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (error) {
        console.error("Error loading contracts:", error);
        toast.error("Failed to fetch contract data from the blockchain");
      } finally {
        setIsLoading(false);
      }
    };

    loadContracts();
  }, []);

  const handleLoadMore = async () => {
    if (contracts.length === 0 || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const lastContract = contracts[contracts.length - 1];
      const lastSeq = lastContract.seq;
      const nextOffset = lastSeq - 1;
      
      const data = await fetchContracts(nextOffset);
      if (data.length > 0) {
        setContracts(prev => [...prev, ...data]);
        if (data.length < 100) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
        toast.info("Todos os contratos ativos foram carregados!");
      }
    } catch (error) {
      console.error("Error loading more contracts:", error);
      toast.error("Erro ao carregar mais contratos");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Control Filters & Search pipeline
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = 
        contract.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.name && contract.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contract.deployer && contract.deployer.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === "all" || contract.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [contracts, searchTerm, filterType]);

  // Real-time metadata metrics calculated from the loaded contract set
  const metrics = useMemo(() => {
    const activeCount = contracts.length;
    const totalCalls = contracts.reduce((sum, c) => sum + (c.callCount || 0), 0);
    const avgComplexity = activeCount > 0 
      ? Math.round(contracts.reduce((sum, c) => sum + (c.complexity || 0), 0) / activeCount) 
      : 0;
    
    return {
      activeCount,
      totalCalls,
      avgComplexity,
    };
  }, [contracts]);

  return (
    <MotionContainer className="space-y-8 pb-12">
      {/* Premium Page Header */}
      <MotionChild>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/15 p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-96 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
                <Terminal className="h-3.5 w-3.5" />
                Live Smart Contract Registry
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                Smart Contracts
              </h1>
              <p className="text-base text-muted-foreground/95 leading-relaxed">
                Analyze, query, and trigger decentralized applications (dApps) running on the Planet One Blockchain. Total auditability, on-chain script validation, and instant invocation logs.
              </p>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <Button asChild size="lg" className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                <a href="#table-section">
                  <Layers className="mr-2 h-4 w-4" />
                  Explore dApps
                </a>
              </Button>
            </div>
          </div>
        </div>
      </MotionChild>

      {/* Metrics Row */}
      <MotionChild delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card relative overflow-hidden group hover:border-primary/30 transition-all duration-300 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Contracts</span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {isLoading ? "..." : metrics.activeCount}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Cpu className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Executions</span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {isLoading ? "..." : metrics.totalCalls.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card relative overflow-hidden group hover:border-sky-500/30 transition-all duration-300 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none group-hover:bg-sky-500/10 transition-colors" />
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Complexity</span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {isLoading ? "..." : `${metrics.avgComplexity} pts`}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Network Engine</span>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  RIDE v4
                </h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <FileCode className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </MotionChild>

      {/* Control Bar & Search Filter */}
      <MotionChild delay={0.15}>
        <div id="table-section" className="bg-card/40 border border-border/80 rounded-2xl p-5 backdrop-blur-xl shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Spotlight */}
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search smart contracts by address, custom name or deployer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 w-full bg-background/50 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Type Filters Toggle */}
            <div className="md:col-span-4 flex gap-1 bg-background/50 border border-border/80 p-1 rounded-xl h-10">
              <button
                onClick={() => setFilterType("all")}
                className={`flex-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  filterType === "all" 
                    ? "bg-primary text-primary-foreground shadow" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("dApp")}
                className={`flex-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  filterType === "dApp" 
                    ? "bg-primary text-primary-foreground shadow" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                dApps
              </button>
              <button
                onClick={() => setFilterType("Smart Account")}
                className={`flex-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  filterType === "Smart Account" 
                    ? "bg-primary text-primary-foreground shadow" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                Accounts
              </button>
            </div>
          </div>
        </div>
      </MotionChild>

      {/* Main Table List */}
      <MotionChild delay={0.2}>
        <Card className="glass-card overflow-hidden shadow-2xl border-border/80 relative">
          <CardHeader className="border-b border-border/50 bg-muted/30 px-6 py-4 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center text-foreground">
                <Code className="mr-2.5 h-5 w-5 text-primary" />
                Deployed Smart Contracts
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Real-time active scripts compiled on the Planet One virtual execution layer
              </CardDescription>
            </div>
            {!isLoading && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 font-semibold text-xs">
                {filteredContracts.length} Listed
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/15">
                  <TableRow className="hover:bg-transparent border-b border-border/60">
                    <TableHead className="w-[200px] text-foreground font-semibold py-3.5 pl-6">Address</TableHead>
                    <TableHead className="text-foreground font-semibold py-3.5">Contract Name</TableHead>
                    <TableHead className="text-foreground font-semibold py-3.5">Engine Type</TableHead>
                    <TableHead className="text-foreground font-semibold py-3.5">On-Chain Deployer</TableHead>
                    <TableHead className="text-foreground font-semibold py-3.5">Registration Time</TableHead>
                    <TableHead className="text-foreground font-semibold py-3.5">Invocations</TableHead>
                    <TableHead className="text-foreground font-semibold py-3.5 text-right pr-6">Operations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <TableRow key={idx} className="border-b border-border/40">
                        <TableCell className="py-4 pl-6">
                          <div className="h-5 w-24 bg-muted/60 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-5 w-20 bg-muted/60 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-5 w-16 bg-muted/60 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-5 w-24 bg-muted/60 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-5 w-16 bg-muted/60 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-5 w-10 bg-muted/60 rounded animate-pulse" />
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <div className="h-8 w-16 bg-muted/60 rounded-lg animate-pulse ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredContracts.length > 0 ? (
                    filteredContracts.map((contract) => (
                      <TableRow 
                        key={contract.address} 
                        className="border-b border-border/40 hover:bg-muted/30 transition-colors group"
                      >
                        <TableCell className="font-semibold py-4 pl-6">
                          <div className="flex items-center">
                            <Link 
                              to={`/contract/${contract.address}`} 
                              className="text-primary hover:underline hover:text-primary/90 font-mono tracking-tight"
                            >
                              {shortenHash(contract.address)}
                            </Link>
                            <CopyButton text={contract.address} />
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                              {contract.name || `Contract_${contract.address.slice(-6)}`}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {contract.description || "Active decentralised contract code."}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge 
                            variant="secondary" 
                            className={`px-2.5 py-0.5 text-xs font-semibold select-none rounded-md border shadow-sm ${
                              contract.type === "dApp" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400" 
                                : "bg-sky-500/10 border-sky-500/20 text-sky-500 dark:text-sky-400"
                            }`}
                          >
                            {contract.type || "dApp"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <div className="flex items-center">
                            <Link to={`/address/${contract.deployer}`} className="hover:underline">
                              {shortenHash(contract.deployer)}
                            </Link>
                            <CopyButton text={contract.deployer} />
                          </div>
                        </TableCell>

                        <TableCell className="py-4 text-sm text-muted-foreground">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {contract.deployTime ? formatTimeAgo(contract.deployTime) : "..."}
                            </span>
                            <span className="text-[10px] text-muted-foreground/80">
                              {contract.deployTime ? formatDate(contract.deployTime) : "..."}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground text-sm">
                              {(contract.callCount || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">calls</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 text-right pr-6">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild 
                            className="rounded-lg h-8 bg-background/40 hover:bg-primary hover:text-primary-foreground border-border/80 hover:border-primary transition-all duration-200"
                          >
                            <Link to={`/contract/${contract.address}`} className="flex items-center gap-1 font-semibold text-xs">
                              <Play className="h-3 w-3" />
                              View & Run
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <ShieldAlert className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-foreground text-sm">No smart contracts found</h4>
                            <p className="text-xs text-muted-foreground">
                              Try clearing your search query or switching your active filters.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          {!isLoading && hasMore && (
            <div className="flex justify-center p-6 border-t border-border/50 bg-muted/10">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="px-8 py-4 h-auto rounded-xl font-bold bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-all duration-300 shadow-md flex items-center gap-2 group hover:scale-[1.03]"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-primary group-hover:text-primary-foreground" />
                    Carregando próximos 100...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                    Carregar Próximos 100 Contratos (RIDE)
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      </MotionChild>
    </MotionContainer>
  );
};

export default ContractsPage;
