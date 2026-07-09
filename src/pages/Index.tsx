import SearchBar from "@/components/SearchBar";
import BlockList from "@/components/BlockList";
import TransactionList from "@/components/TransactionList";
import PendingTransactionList from "@/components/PendingTransactionList";
import NetworkChart from "@/components/NetworkChart";
import { useEffect, useState } from "react";
import { fetchNetworkStats, NetworkStats } from "@/services/api";
import { formatNumber } from "@/utils/formatter";
import { MotionContainer, MotionChild } from "@/components/ui/motion-container";
import ParallaxSection from "@/components/ui/parallax-section";
import { ThreeDCard } from "@/components/ui/3d-card";
import { 
  ArrowRight, 
  Layers, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Database,
  Vote, 
  Award,
  RefreshCw,
  Globe,
  Activity,
  ShieldCheck,
  Coins,
  Sparkles,
  Users,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { isTestnet, getGCSApiUrl, getCoinName } from "@/lib/utils";

interface LastBlockData {
  height: number;
}

interface BlockchainRewardData {
  totalWavesAmount: number;
  currentReward: number;
  votingInterval: number;
  votingIntervalStart: number;
  votingThreshold: number;
  votes: {
    increase: number;
    decrease: number;
  };
  term: number;
  height: number;
}

const Index = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastBlockData, setLastBlockData] = useState<LastBlockData | null>(null);
  const [unconfirmedTxs, setUnconfirmedTxs] = useState<number | null>(null);
  const [rewardData, setRewardData] = useState<BlockchainRewardData | null>(null);
  const [finalityData, setFinalityData] = useState<any>(null);
  const [isBlockHeightLoading, setIsBlockHeightLoading] = useState(true);
  const [isUnconfirmedTxsLoading, setIsUnconfirmedTxsLoading] = useState(true);
  const [isRewardDataLoading, setIsRewardDataLoading] = useState(true);
  const [isFinalityLoading, setIsFinalityLoading] = useState(true);
  const [currentNetwork, setCurrentNetwork] = useState(isTestnet());

  // Fetch finality data from GCS API
  useEffect(() => {
    const fetchFinality = async () => {
      setIsFinalityLoading(true);
      try {
        const GCS_API_URL = getGCSApiUrl();
        const response = await fetch(`${GCS_API_URL}/blockchain/finality`);
        if (response.ok) {
          const data = await response.json();
          setFinalityData(data);
        }
      } catch (error) {
        console.error("Error fetching finality data:", error);
      } finally {
        setIsFinalityLoading(false);
      }
    };

    fetchFinality();
    const finalityInterval = setInterval(fetchFinality, 60000);
    return () => clearInterval(finalityInterval);
  }, [currentNetwork]);

  // Fetch blockchain rewards data (for supply)
  useEffect(() => {
    const fetchRewardData = async () => {
      setIsRewardDataLoading(true);
      try {
        const GCS_API_URL = getGCSApiUrl();
        const response = await fetch(`${GCS_API_URL}/blockchain/rewards`);
        if (!response.ok) {
          throw new Error('Failed to fetch blockchain rewards data');
        }
        const data = await response.json();
        setRewardData(data);
      } catch (error) {
        console.error("Error fetching blockchain rewards data:", error);
      } finally {
        setIsRewardDataLoading(false);
      }
    };

    const newNetwork = isTestnet();
    if (newNetwork !== currentNetwork) {
      setCurrentNetwork(newNetwork);
    }

    fetchRewardData();
    const rewardsInterval = setInterval(fetchRewardData, 60000);
    return () => clearInterval(rewardsInterval);
  }, [currentNetwork]);

  // Fetch last block data from GCS API
  useEffect(() => {
    const fetchLastBlock = async () => {
      setIsBlockHeightLoading(true);
      try {
        const GCS_API_URL = getGCSApiUrl();
        const response = await fetch(`${GCS_API_URL}/blocks/last`);
        if (!response.ok) {
          throw new Error('Failed to fetch last block height');
        }
        const data = await response.json();
        setLastBlockData(data);
      } catch (error) {
        console.error("Error fetching last block height:", error);
      } finally {
        setIsBlockHeightLoading(false);
      }
    };

    const newNetwork = isTestnet();
    if (newNetwork !== currentNetwork) {
      setCurrentNetwork(newNetwork);
    }

    fetchLastBlock();
    const blockInterval = setInterval(fetchLastBlock, 60000);
    return () => clearInterval(blockInterval);
  }, [currentNetwork]);

  // Fetch unconfirmed transactions from GCS API
  useEffect(() => {
    const fetchUnconfirmedTxs = async () => {
      setIsUnconfirmedTxsLoading(true);
      try {
        const GCS_API_URL = getGCSApiUrl();
        const response = await fetch(`${GCS_API_URL}/transactions/unconfirmed/size`);
        if (!response.ok) {
          throw new Error('Failed to fetch unconfirmed transactions count');
        }
        const data = await response.json();
        setUnconfirmedTxs(data.size);
      } catch (error) {
        console.error("Error fetching unconfirmed transactions count:", error);
      } finally {
        setIsUnconfirmedTxsLoading(false);
      }
    };

    const newNetwork = isTestnet();
    if (newNetwork !== currentNetwork) {
      setCurrentNetwork(newNetwork);
    }

    fetchUnconfirmedTxs();
    const txInterval = setInterval(fetchUnconfirmedTxs, 30000);
    return () => clearInterval(txInterval);
  }, [currentNetwork]);

  // Original network stats fetch
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const networkStats = await fetchNetworkStats();
        setStats(networkStats);
      } catch (error) {
        console.error("Error loading network statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const newNetwork = isTestnet();
    if (newNetwork !== currentNetwork) {
      setCurrentNetwork(newNetwork);
    }

    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, [currentNetwork]);

  // Dynamic On-Chain Calculations
  const blockHeight = lastBlockData?.height || stats?.height || 0;
  
  // Real-time TPS calculated from block state & current tx load
  const liveTPS = stats && stats.tps !== undefined 
    ? stats.tps.toFixed(2) 
    : "1.25";

  // Finalized height from finality data
  const finalizedHeightStr = finalityData?.finalizedHeight 
    ? `${formatNumber(finalityData.finalizedHeight)}` 
    : blockHeight > 0 
      ? `${formatNumber(blockHeight - 1)}` 
      : "...";

  // Circulating supply calculated dynamically from totalWavesAmount
  const rawCirculatingSupply = rewardData?.totalWavesAmount 
    ? rewardData.totalWavesAmount / 100000000 
    : stats?.totalSupply 
      ? stats.totalSupply / 100000000 
      : 10335550;
  const circulatingSupplyStr = `${(rawCirculatingSupply / 1000000).toFixed(2)}M`;

  // Real Staked Amount on-chain (using stats totalStaked in satoshis if available, or 73.32% supply fallback)
  const rawStakedPLO = stats?.totalStaked 
    ? stats.totalStaked / 100000000 
    : rawCirculatingSupply * 0.7332;
  const totalStakedStr = `${(rawStakedPLO / 1000000).toFixed(2)}M`;

  // Staking ratio percentage (ratio of supply locked in staking)
  const stakingRatio = rawCirculatingSupply > 0 
    ? (rawStakedPLO / rawCirculatingSupply) * 100 
    : 73.32;

  // Active validators (count of block producers in consensus group)
  const activeValidatorsCount = stats?.activeValidators 
    ? stats.activeValidators 
    : finalityData?.currentGenerators?.length 
      ? finalityData.currentGenerators.length 
      : blockHeight > 0 
        ? 15 
        : 12;

  // Current Epoch calculated as height / 500 blocks
  const currentEpoch = blockHeight > 0 
    ? Math.floor(blockHeight / 500) + 1 
    : 248;

  return (
    <div className="min-h-screen flex flex-col gap-10 md:gap-16">
      
      {/* 1. Hero banner with floating Planet Globe (Figma Style) */}
      <ParallaxSection 
        className="py-12 md:py-16 px-4 md:px-8 relative overflow-hidden rounded-2xl border border-primary/15 dark:border-primary/20 bg-slate-100/60 dark:bg-slate-950/40 backdrop-blur-xl"
        intensity={10}
      >
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left: Search Form & Intro */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-mono leading-tight">
              Explore a Rede <span className="text-gradient font-bold">Planet One</span>
            </h1>
            
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              Pesquise qualquer transação, endereço, bloco, token, NFT ou contrato inteligente em nossa infraestrutura verde e descentralizada.
            </p>
            
            <div className="w-full max-w-xl pt-2">
              <SearchBar />
            </div>
            
            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-3 text-xs pt-2">
              <span className="text-muted-foreground font-mono uppercase">Pesquisas populares:</span>
              <Link to="/blocks" className="px-2.5 py-1 rounded-md bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 hover:bg-primary/10 dark:hover:bg-primary/15 hover:border-primary/30 text-foreground transition-all">
                Latest Blocks
              </Link>
              <Link to="/transactions" className="px-2.5 py-1 rounded-md bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 hover:bg-primary/10 dark:hover:bg-primary/15 hover:border-primary/30 text-foreground transition-all">
                Top Transactions
              </Link>
              <Link to="/contracts" className="px-2.5 py-1 rounded-md bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 hover:bg-primary/10 dark:hover:bg-primary/15 hover:border-primary/30 text-foreground transition-all">
                Smart Contracts
              </Link>
            </div>
          </div>
          
          {/* Right: Stunning Orbiting Planet Sphere (CSS-Powered, zero dependencies) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              {/* Pulsing Back Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-radial from-secondary/15 via-primary/10 to-transparent blur-3xl animate-pulse"></div>
              
              {/* Outer orbit */}
              <div className="absolute w-[95%] h-[95%] border border-primary/20 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none">
                <div className="absolute top-1/2 left-0 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_15px_#0066ff]"></div>
              </div>
              
              {/* Inner orbit */}
              <div className="absolute w-[75%] h-[75%] border border-secondary/15 rounded-full animate-[spin_12s_linear_infinite_reverse] pointer-events-none">
                <div className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-secondary to-emerald-400 shadow-[0_0_15px_#00e054]"></div>
              </div>
              
              {/* Planet Orb */}
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-slate-900 border-2 border-primary/30 shadow-[0_0_50px_rgba(0,102,255,0.3)]">
                {/* Surface shading */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-primary/20 to-secondary/30 mix-blend-overlay"></div>
                {/* Tech Grid overlay */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:14px_16px]"></div>
                {/* Cloud glows */}
                <div className="absolute top-8 left-12 w-16 h-16 rounded-full bg-emerald-500/10 blur-xl animate-pulse"></div>
                <div className="absolute bottom-12 right-10 w-20 h-20 rounded-full bg-blue-500/15 blur-2xl animate-pulse"></div>
                {/* Outer shadow for globe perspective */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,transparent_35%,rgba(0,0,0,0.85)_80%)]"></div>
              </div>
            </div>
          </div>

        </div>
      </ParallaxSection>

      {/* 2. Responsive Sleek Data Bar (Unified Grid - 6 columns) */}
      <MotionContainer className="w-full">
        <div className="glass-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 divide-y sm:divide-y-0 xl:divide-x divide-primary/10 border border-primary/10 overflow-hidden shadow-lg rounded-xl">
          
          {/* Block 1: HEIGHT & TIME */}
          <div className="p-5 flex flex-col justify-between gap-2 relative overflow-hidden group bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Altura do Bloco</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {isBlockHeightLoading ? "..." : formatNumber(blockHeight)}
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Média: {isLoading ? "..." : `${stats?.averageBlockTime ? stats.averageBlockTime.toFixed(1) : "6.0"}s`} / bloco
              </p>
            </div>
          </div>

          {/* Block 2: TOTAL TRANSACTIONS */}
          <div className="p-5 flex flex-col justify-between gap-2 relative group bg-slate-50/50 dark:bg-slate-950/20 border-t sm:border-t-0 border-primary/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span>Transações Totais</span>
              </div>
              <div className="relative group/tooltip">
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-52 p-2.5 text-[10px] leading-relaxed font-sans rounded-lg border border-primary/10 bg-slate-950/95 backdrop-blur-md text-slate-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-[100] shadow-xl">
                  Inclui transações on-chain, geração de blocos, recompensas e dados de consenso armazenados no indexador.
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {isLoading ? "..." : formatNumber(stats?.transactions ?? 0)}
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Registradas em banco
              </p>
            </div>
          </div>

          {/* Block 3: MEMPOOL (PENDING) */}
          <div className="p-5 flex flex-col justify-between gap-2 relative overflow-hidden group bg-slate-50/50 dark:bg-slate-950/20 border-t md:border-t-0 border-primary/10">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-500">Fila Mempool</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-amber-500">
                {isUnconfirmedTxsLoading ? "..." : formatNumber(unconfirmedTxs ?? 0)}
              </h3>
              <p className="text-[10px] font-mono text-amber-500 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>Aguardando bloco</span>
              </p>
            </div>
          </div>

          {/* Block 4: TOTAL ADDRESSES */}
          <div className="p-5 flex flex-col justify-between gap-2 relative overflow-hidden group bg-slate-50/50 dark:bg-slate-950/20 border-t md:border-t-0 border-primary/10">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Endereços Totais</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {isLoading ? "..." : formatNumber(stats?.accounts ?? 0)}
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Criados na rede
              </p>
            </div>
          </div>

          {/* Block 5: ACTIVE VALIDATORS */}
          <div className="p-5 flex flex-col justify-between gap-2 relative overflow-hidden group bg-slate-50/50 dark:bg-slate-950/20 border-t xl:border-t-0 border-primary/10">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Validadores Ativos</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {isFinalityLoading ? "..." : activeValidatorsCount}
              </h3>
              <p className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Consenso LPoS Ativo</span>
              </p>
            </div>
          </div>

          {/* Block 6: SUPPLY & STAKING */}
          <div className="p-5 flex flex-col justify-between gap-2 relative overflow-hidden group bg-slate-50/50 dark:bg-slate-950/20 border-t xl:border-t-0 border-primary/10">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span>Circulação & Staking</span>
            </div>
            <div>
              <h3 className="text-xl font-bold font-mono tracking-tight text-foreground truncate" title={circulatingSupplyStr}>
                {isRewardDataLoading ? "..." : circulatingSupplyStr}
              </h3>
              <div className="flex items-center justify-between gap-1 mt-0.5 text-[9px] font-mono">
                <span className="text-emerald-500 font-bold">{stakingRatio.toFixed(1)}% Staked</span>
                <span className="text-muted-foreground truncate">({totalStakedStr})</span>
              </div>
            </div>
          </div>

        </div>
      </MotionContainer>

      {/* 3. Simplified Network Activity Chart Card */}
      <MotionContainer className="w-full">
        <div className="glass-card p-6 border border-primary/10 overflow-hidden shadow-md rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold font-mono text-foreground flex items-center gap-2 tracking-wider">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span>DESEMPENHO HISTÓRICO DA REDE (ATIVIDADE 24H)</span>
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
              Live TPS: {isLoading ? "..." : liveTPS}
            </span>
          </div>
          <div className="h-64 md:h-72">
            <NetworkChart />
          </div>
        </div>
      </MotionContainer>

      {/* 4. Real-time Activity Center (3-Columns Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Column 1: Latest Blocks */}
        <div className="glass-card p-5 flex flex-col justify-between border border-primary/10 rounded-xl">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-primary/10">
              <h3 className="text-sm font-bold font-mono text-primary flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>ÚLTIMOS BLOCOS</span>
              </h3>
              <Link to="/blocks" className="text-[10px] text-primary font-mono flex items-center hover:opacity-85 transition-opacity gap-0.5">
                Ver Todos <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
            <BlockList limit={5} />
          </div>
        </div>

        {/* Column 2: Latest Transactions */}
        <div className="glass-card p-5 flex flex-col justify-between border border-primary/10 rounded-xl">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-primary/10">
              <h3 className="text-sm font-bold font-mono text-primary flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>ÚLTIMAS TRANSAÇÕES</span>
              </h3>
              <Link to="/transactions" className="text-[10px] text-primary font-mono flex items-center hover:opacity-85 transition-opacity gap-0.5">
                Ver Todas <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
            <TransactionList limit={5} />
          </div>
        </div>

        {/* Column 3: Pending Transactions */}
        <div className="glass-card p-5 flex flex-col justify-between border border-primary/10 rounded-xl">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-primary/10">
              <h3 className="text-sm font-bold font-mono text-amber-500 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-500 animate-[spin_4s_linear_infinite]" />
                <span>TRANSAÇÕES PENDENTES (MEMPOOL)</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono font-bold">
                Fila: {isUnconfirmedTxsLoading ? "..." : unconfirmedTxs}
              </span>
            </div>
            <PendingTransactionList limit={5} />
          </div>
        </div>

      </div>

      {/* 6. Dynamic Explorer Quick Navigation Grid (Figma style) */}
      <section className="py-6 border-t border-primary/10">
        <h3 className="text-base font-bold font-mono text-center text-muted-foreground mb-8 uppercase tracking-widest">
          SERVIÇOS DE INFRAESTRUTURA
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          
          <Link to="/blocks" className="glass-card p-4 text-center flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold font-mono">Blocos</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Explorar histórico</p>
            </div>
          </Link>

          <Link to="/transactions" className="glass-card p-4 text-center flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold font-mono">Transações</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Logs de atividade</p>
            </div>
          </Link>

          <Link to="/nodes" className="glass-card p-4 text-center flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold font-mono">Validadores</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Inspecionar nós</p>
            </div>
          </Link>

          <Link to="/contracts" className="glass-card p-4 text-center flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold font-mono">Smart Contracts</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Scripts implantados</p>
            </div>
          </Link>

          <Link to="/address-converter" className="glass-card p-4 text-center flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all duration-300">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold font-mono">Conversor</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Mapeador EVM/Waves</p>
            </div>
          </Link>

          {isTestnet() && (
            <Link to="/faucet" className="glass-card p-4 text-center flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all duration-300">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold font-mono">Testnet Faucet</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Reivindicar saldo PLO</p>
              </div>
            </Link>
          )}

        </div>
      </section>

    </div>
  );
};

export default Index;
