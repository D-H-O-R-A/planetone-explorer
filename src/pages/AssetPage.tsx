import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { fetchAssetDetails, Asset } from "@/services/api";
import { 
  Loader2, ArrowLeft, Trophy, Medal, Wallet, Copy, Check, 
  ExternalLink, Search, RefreshCw, Flame, CheckCircle, Trees, 
  Info, Sparkles, TrendingUp, HelpCircle, AlertCircle,
  Globe, Twitter, Send, Github, FileText, Coins
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatNumber, shortenHash } from "@/utils/formatter";
import { toast } from "sonner";
import { wavesAsset2Eth, ethAsset2Waves } from "@better2better/waves-node-api-js";
import { getCoinName, isTestnet, getFullExplorerApiUrl } from "@/lib/utils";
import { MotionContainer, MotionChild } from "@/components/ui/motion-container";

interface HolderAddress {
  rank: number;
  address: string;
  balance: number;
}

interface AssetSocialMetadata {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  medium?: string;
  email?: string;
  description?: string;
  whitepaper?: string;
}

const VERIFIED_ASSETS_METADATA: Record<string, AssetSocialMetadata> = {
  "AAyf6hiqW17aivtcdY34eFx2GobqnkdSx4Pj5U8S5nfk": {
    website: "https://planetone.io",
    twitter: "https://x.com/planetone_io",
    telegram: "https://t.me/planetone_io",
    github: "https://github.com/planetone-io",
    discord: "https://discord.gg/planetone",
    whitepaper: "https://planetone.io/whitepaper.pdf",
    description: "VERDE é o primeiro ativo ecológico e utilitário do ecossistema Planet One, lastreado e certificado em projetos de preservação de áreas florestais, biodiversidade e mitigação de créditos de carbono de alta integridade."
  }
};

const AssetPage = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [convertedEthId, setConvertedEthId] = useState<string | null>(null);
  const [processedAssetId, setProcessedAssetId] = useState<string>("");
  const navigate = useNavigate();

  // Holders list state
  const [holders, setHolders] = useState<HolderAddress[]>([]);
  const [loadingHolders, setLoadingHolders] = useState<boolean>(false);
  const [totalHoldersCount, setTotalHoldersCount] = useState<number>(0);
  const [holdersOffset, setHoldersOffset] = useState<number>(0);
  const [hasMoreHolders, setHasMoreHolders] = useState<boolean>(true);
  const [searchHolderQuery, setSearchHolderQuery] = useState<string>("");

  // Copy clipboards index tracker
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const VERDE_CONTRACT_ID = "AAyf6hiqW17aivtcdY34eFx2GobqnkdSx4Pj5U8S5nfk";
  const isVerde = asset?.assetId === VERDE_CONTRACT_ID;

  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (asset?.assetId) {
      const url = `/img/${asset.assetId}.png`;
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImgUrl(url);
      };
      img.onerror = () => {
        setImgUrl(null);
      };
    } else {
      setImgUrl(null);
    }
  }, [asset?.assetId]);

  const loadAssetDataAndHolders = async (assetId: string, currentOffset: number = 0, append: boolean = false) => {
    try {
      if (currentOffset === 0) {
        setLoadingHolders(true);
      }
      
      const baseUrl = getFullExplorerApiUrl();
      
      // Fetch holders ranking from full explorer
      const response = await fetch(`${baseUrl}/top/${assetId}/${currentOffset}`);
      if (response.ok) {
        const result = await response.json();
        const holdersList = result.holders || [];
        const total = result.total || 0;
        
        setTotalHoldersCount(total);
        
        if (append) {
          setHolders(prev => [...prev, ...holdersList]);
        } else {
          setHolders(holdersList);
        }
        
        if (holdersList.length < 100) {
          setHasMoreHolders(false);
        } else {
          setHasMoreHolders(true);
        }
      }
    } catch (err) {
      console.error("Failed to load holders for asset:", err);
    } finally {
      setLoadingHolders(false);
    }
  };

  useEffect(() => {
    const loadAsset = async () => {
      if (id) {
        setLoading(true);
        try {
          let assetIdToFetch = id;
          const coinName = getCoinName();
          
          if (id.startsWith("0x")) {
            try {
              assetIdToFetch = ethAsset2Waves(id);
            } catch (error) {
              console.error("Erro ao converter asset ID 0x para Waves:", error);
              toast.error("Erro ao converter asset ID para formato Waves");
              setLoading(false);
              return;
            }
          }
          
          if (assetIdToFetch.startsWith("3") && assetIdToFetch.length < 40) {
            toast.error("Este parece ser um endereço, não um asset ID");
            setLoading(false);
            return;
          }
          
          setProcessedAssetId(assetIdToFetch);
          
          // Fetch asset data using Waves format
          const assetData = await fetchAssetDetails(assetIdToFetch);
          setAsset(assetData);
          
          if (assetData) {
            // Convert to EVM format for display
            try {
              const ethId = wavesAsset2Eth(assetData.assetId);
              setConvertedEthId(ethId);
            } catch (error) {
              console.error("Erro ao converter asset para formato 0x:", error);
            }
            
            // Load initial top 100 holders
            await loadAssetDataAndHolders(assetData.assetId, 0, false);
          }
          
        } catch (error) {
          navigate("/tx/" + id, { replace: true });
          console.error("Erro ao carregar dados do asset:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAsset();
  }, [id]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copiado com sucesso!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLoadMoreHolders = () => {
    if (loadingHolders || !hasMoreHolders) return;
    const nextOffset = holdersOffset + 100;
    setHoldersOffset(nextOffset);
    loadAssetDataAndHolders(processedAssetId, nextOffset, true);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-black shadow-sm text-[10px]">
          <Trophy className="w-3 h-3" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-slate-200 to-slate-400 text-slate-800 font-black shadow-sm text-[10px]">
          <Medal className="w-3 h-3" />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black shadow-sm text-[10px]">
          <Medal className="w-3 h-3" />
        </span>
      );
    }
    return <span className="font-mono text-[10px] font-bold text-muted-foreground w-6 text-center">{rank}</span>;
  };

  const getAvatarColor = (address: string) => {
    const charCode = address.charCodeAt(address.length - 1) + address.charCodeAt(address.length - 2);
    const colors = [
      "from-emerald-400 to-teal-500 text-emerald-500 bg-emerald-500/10 border-emerald-500/15",
      "from-indigo-400 to-blue-500 text-indigo-500 bg-indigo-500/10 border-indigo-500/15",
      "from-violet-400 to-purple-500 text-violet-500 bg-violet-500/10 border-violet-500/15",
      "from-pink-400 to-rose-500 text-pink-500 bg-pink-500/10 border-pink-500/15",
      "from-amber-400 to-orange-500 text-amber-500 bg-amber-500/10 border-amber-500/15",
    ];
    return colors[charCode % colors.length];
  };

  // Filter holders based on search query
  const filteredHolders = useMemo(() => {
    if (!searchHolderQuery.trim()) return holders;
    return holders.filter(h => 
      h.address.toLowerCase().includes(searchHolderQuery.trim().toLowerCase())
    );
  }, [holders, searchHolderQuery]);

  const isNFT = asset && asset.quantity === 1 && asset.decimals === 0;
  const assetDecimals = asset?.decimals !== undefined ? asset.decimals : 8;
  const assetTotalSupply = asset ? asset.quantity / Math.pow(10, assetDecimals) : 0;

  return (
    <MotionContainer 
      animateOnMount={true}
      className="min-h-screen px-4 md:px-8 py-8 pb-24 md:pb-12 max-w-6xl mx-auto space-y-8"
    >
      
      {/* Header and navigation */}
      <MotionChild className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="rounded-xl border-border bg-background/50 hover:bg-muted"
          >
            <Link to="/ranking" className="flex items-center gap-1.5 font-bold text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Ranking
            </Link>
          </Button>
          <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-500 border-emerald-500/15 font-mono py-1 px-2.5 rounded-lg">
            Asset Explorer
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground font-medium font-mono">
          Network: {isTestnet() ? "Testnet Node" : "Mainnet Node"}
        </p>
      </MotionChild>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground animate-pulse font-bold">Injetando dados on-chain do ativo...</p>
        </div>
      ) : !asset ? (
        <MotionChild>
          <Card className="border border-destructive/20 bg-destructive/5 p-8 rounded-2xl text-center max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-foreground">Ativo não encontrado</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O ID de asset requisitado não está registrado na rede atual ou pode ter sido reconfigurado.
              </p>
            </div>
            <Button asChild size="sm" className="rounded-xl font-bold bg-primary text-primary-foreground">
              <Link to="/ranking">Voltar ao Ranking</Link>
            </Button>
          </Card>
        </MotionChild>
      ) : (
        <>
          {/* Main Hero Asset Banner */}
          <MotionChild>
            <div className={`relative p-6 md:p-8 rounded-3xl border shadow-lg overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
              isVerde 
                ? "bg-gradient-to-r from-emerald-950/20 via-green-900/10 to-transparent border-emerald-500/15 shadow-emerald-500/5" 
                : "bg-card/45 border-border/80"
            }`}>
              {/* Background glowing visual */}
              <div className={`absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl opacity-20 ${
                isVerde ? "bg-emerald-500" : "bg-primary"
              }`} />
              
              <div className="flex items-center gap-4 relative z-10">
                {imgUrl ? (
                  <img 
                    src={imgUrl} 
                    alt={asset.name} 
                    className="w-14 h-14 rounded-2xl object-contain bg-background/50 border border-border/40 shadow-sm" 
                  />
                ) : (
                  <span className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-white shadow-md bg-gradient-to-br ${
                    isVerde 
                      ? "from-emerald-400 to-green-600 shadow-emerald-500/20" 
                      : "from-primary to-indigo-600 shadow-primary/20"
                  }`}>
                    {isVerde ? <Trees className="w-7 h-7" /> : <Coins className="w-7 h-7" />}
                  </span>
                )}
                
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                      {asset.name}
                    </h1>
                    {isNFT && <Badge className="bg-primary/20 text-primary border-none">NFT</Badge>}
                    {isVerde && (
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-none flex items-center gap-1 font-extrabold text-[10px] px-2.5 py-0.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Ativo Ecológico Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium font-mono flex items-center gap-1.5 flex-wrap">
                    ID: <span className="bg-muted px-1.5 py-0.5 rounded border border-border/40 select-all max-w-[200px] truncate">{asset.assetId}</span>
                    <button 
                      onClick={() => handleCopy(asset.assetId, "assetid")}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Copiar ID"
                    >
                      {copiedKey === "assetid" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </p>
                </div>
              </div>

              {/* Extra visual metadata banner */}
              <div className="flex flex-col items-start md:items-end gap-1.5 text-xs font-semibold">
                <span className="text-muted-foreground">Emissor Contratual</span>
                <Link 
                  to={`/address/${asset.issuer}`}
                  className="font-mono text-emerald-500 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  {shortenHash(asset.issuer, 12)}
                </Link>
              </div>
            </div>
          </MotionChild>

          {/* Special Verified VERDE Description Block */}
          {isVerde && (
            <MotionChild>
              <Card className="border border-emerald-500/15 bg-emerald-500/5 overflow-hidden rounded-2xl relative">
                <div className="absolute right-4 top-4 text-emerald-500/15 pointer-events-none">
                  <Trees className="w-24 h-24" />
                </div>
                <CardHeader className="pb-2 border-b border-emerald-500/10 bg-emerald-500/5">
                  <CardTitle className="text-sm font-extrabold text-emerald-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Especificação do Ativo VERDE (Planet One)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-xs text-foreground/80 leading-relaxed space-y-3.5 max-w-4xl relative z-10">
                  <p>
                    <strong className="text-emerald-500 font-bold">VERDE</strong> é o primeiro ativo ambiental tokenizado do ecossistema Planet One, desenvolvido para representar projetos certificados de créditos de carbono provenientes da preservação e conservação de ecossistemas naturais.
                  </p>
                  <p>
                    Cada emissão do VERDE está vinculada a ativos ambientais reais, auditáveis e georreferenciados, permitindo total transparência sobre sua origem, documentação e rastreabilidade. Por meio da blockchain Planet One, investidores, empresas e instituições podem acompanhar todas as informações do ativo em tempo real, desde a área protegida até sua evolução ao longo do ciclo de geração dos créditos de carbono.
                  </p>
                  <p>
                    O VERDE foi projetado para transformar a preservação ambiental em um ativo digital acessível globalmente, conectando tecnologia blockchain, certificação ambiental e sustentabilidade em uma única infraestrutura. Seu objetivo é ampliar o financiamento de projetos de conservação, democratizar o acesso ao mercado de carbono e oferecer uma forma transparente de participar da economia ambiental.
                  </p>
                </CardContent>
              </Card>
            </MotionChild>
          )}

          {/* Grid Analytics Grid */}
          <MotionChild className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Supply */}
            <Card className="border border-border/50 bg-card/35 backdrop-blur-xl relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
              <div className="absolute right-3 top-3 h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-60">
                <TrendingUp className="w-5 h-5" />
              </div>
              <CardContent className="p-5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Suprimento Total</span>
                <h3 className="text-xl font-extrabold text-foreground mt-1 font-mono">
                  {assetTotalSupply.toLocaleString(undefined, { maximumFractionDigits: assetDecimals })}
                </h3>
                <div className="mt-2">
                  {asset.reissuable ? (
                    <Badge className="bg-amber-500/10 text-amber-500 dark:text-amber-400 border-none font-extrabold text-[9px] px-2 rounded-full py-0.5">Reissível (Reissuable)</Badge>
                  ) : (
                    <Badge className="bg-rose-500/10 text-rose-500 dark:text-rose-400 border-none font-extrabold text-[9px] px-2 rounded-full py-0.5">Escasso (Não-Reissível)</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* KPI 2: Unique Holders count */}
            <Card className="border border-border/50 bg-card/35 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
              <div className="absolute right-3 top-3 h-10 w-10 rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-500 opacity-60">
                <Wallet className="w-5 h-5" />
              </div>
              <CardContent className="p-5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Unique Holders (Wallets)</span>
                <h3 className="text-xl font-extrabold text-foreground mt-1 font-mono">
                  {totalHoldersCount.toLocaleString()}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Contas com saldo ativo maior que 0
                </p>
              </CardContent>
            </Card>

            {/* KPI 3: Decimals */}
            <Card className="border border-border/50 bg-card/35 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
              <div className="absolute right-3 top-3 h-10 w-10 rounded-full bg-indigo-500/5 flex items-center justify-center text-indigo-500 opacity-60">
                <Info className="w-5 h-5" />
              </div>
              <CardContent className="p-5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Casas Decimais</span>
                <h3 className="text-xl font-extrabold text-foreground mt-1 font-mono">
                  {assetDecimals} Decimals
                </h3>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                  1 unidade = 10^{-assetDecimals} tokens
                </p>
              </CardContent>
            </Card>

            {/* KPI 4: Issue Block height */}
            <Card className="border border-border/50 bg-card/35 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
              <div className="absolute right-3 top-3 h-10 w-10 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 opacity-60">
                <Flame className="w-5 h-5" />
              </div>
              <CardContent className="p-5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Bloco de Emissão</span>
                <h3 className="text-xl font-extrabold text-foreground mt-1">
                  <Link 
                    to={`/block/${asset.issueHeight}`}
                    className="hover:underline hover:text-amber-500 font-mono transition-colors"
                  >
                    #{asset.issueHeight}
                  </Link>
                </h3>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Emitido em: {formatDate(asset.issueTimestamp)}
                </p>
              </CardContent>
            </Card>
          </MotionChild>

          {/* Grid: EVM equivalent ID and description */}
          <MotionChild className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* EVM Equivalency and Extra Specs */}
            <div className="lg:col-span-4 space-y-4">
              {/* Verified Asset Socials & Website Details Card */}
              {(imgUrl || VERIFIED_ASSETS_METADATA[asset.assetId]) && (
                <Card className="border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <CardHeader className="pb-3 border-b border-emerald-500/20 bg-emerald-500/10">
                    <CardTitle className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Ativo Verificado Planet One
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {VERIFIED_ASSETS_METADATA[asset.assetId]?.description || "Este token foi verificado oficialmente pelo ecossistema Planet One."}
                    </p>
                    
                    {/* Social Links Buttons */}
                    <div className="space-y-2 pt-1.5">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-2">Links Oficiais</span>
                      <div className="grid grid-cols-2 gap-2">
                        {VERIFIED_ASSETS_METADATA[asset.assetId]?.website && (
                          <Button variant="outline" size="sm" asChild className="w-full text-xs font-bold rounded-xl border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 flex items-center justify-start gap-1.5 px-3">
                            <a href={VERIFIED_ASSETS_METADATA[asset.assetId].website} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-3.5 h-3.5" />
                              Website
                            </a>
                          </Button>
                        )}
                        {VERIFIED_ASSETS_METADATA[asset.assetId]?.whitepaper && (
                          <Button variant="outline" size="sm" asChild className="w-full text-xs font-bold rounded-xl border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 flex items-center justify-start gap-1.5 px-3">
                            <a href={VERIFIED_ASSETS_METADATA[asset.assetId].whitepaper} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-3.5 h-3.5" />
                              Whitepaper
                            </a>
                          </Button>
                        )}
                        {VERIFIED_ASSETS_METADATA[asset.assetId]?.twitter && (
                          <Button variant="outline" size="sm" asChild className="w-full text-xs font-bold rounded-xl border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 flex items-center justify-start gap-1.5 px-3">
                            <a href={VERIFIED_ASSETS_METADATA[asset.assetId].twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="w-3.5 h-3.5" />
                              Twitter / X
                            </a>
                          </Button>
                        )}
                        {VERIFIED_ASSETS_METADATA[asset.assetId]?.telegram && (
                          <Button variant="outline" size="sm" asChild className="w-full text-xs font-bold rounded-xl border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 flex items-center justify-start gap-1.5 px-3">
                            <a href={VERIFIED_ASSETS_METADATA[asset.assetId].telegram} target="_blank" rel="noopener noreferrer">
                              <Send className="w-3.5 h-3.5" />
                              Telegram
                            </a>
                          </Button>
                        )}
                        {VERIFIED_ASSETS_METADATA[asset.assetId]?.github && (
                          <Button variant="outline" size="sm" asChild className="w-full text-xs font-bold rounded-xl border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 flex items-center justify-start gap-1.5 px-3 col-span-2">
                            <a href={VERIFIED_ASSETS_METADATA[asset.assetId].github} target="_blank" rel="noopener noreferrer">
                              <Github className="w-3.5 h-3.5" />
                              GitHub Repository
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border border-border/60 bg-card/45 backdrop-blur-xl rounded-2xl shadow-md">
                <CardHeader className="pb-3 border-b border-border/30 bg-muted/5">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Paridade Cross-Chain EVM
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs">
                  {convertedEthId ? (
                    <div className="space-y-1.5">
                      <span className="text-muted-foreground font-semibold">Equivalente ID em EVM / 0x</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono bg-emerald-500/5 text-emerald-500 p-2 border border-emerald-500/10 rounded-xl break-all flex-1 font-bold text-[11px]">
                          {convertedEthId}
                        </span>
                        <button 
                          onClick={() => handleCopy(convertedEthId, "ethid")}
                          className="p-2 bg-muted/60 text-muted-foreground hover:text-foreground rounded-xl border border-border/40 transition-colors"
                          title="Copiar ID EVM"
                        >
                          {copiedKey === "ethid" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                        Utilizado em bridges, carteiras EVM e contratos Ethereum compatíveis integrados ao ecossistema Planet One.
                      </p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground leading-relaxed py-2">
                      Sem paridade EVM ativa mapeada para este token.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extra specifications */}
              <Card className="border border-border/60 bg-card/45 backdrop-blur-xl rounded-2xl shadow-md">
                <CardHeader className="pb-3 border-b border-border/30 bg-muted/5">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Especificações Técnicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                    <span className="text-muted-foreground">Decimais</span>
                    <span className="font-bold text-foreground font-mono">{assetDecimals}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                    <span className="text-muted-foreground">Reissível</span>
                    <span className="font-bold text-foreground">{asset.reissuable ? "Sim" : "Não"}</span>
                  </div>
                  {asset.minSponsoredAssetFee && (
                    <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground">Sponsorship Mínimo</span>
                      <span className="font-bold text-foreground font-mono">{formatNumber(asset.minSponsoredAssetFee / Math.pow(10, 8))} PLO</span>
                    </div>
                  )}
                  {asset.description && !isVerde && (
                    <div className="pt-2">
                      <span className="text-muted-foreground block mb-1">Descrição do Ativo</span>
                      <p className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-border/40">
                        {asset.description}
                      </p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full text-xs font-bold rounded-xl border-border hover:bg-muted">
                      <Link to={`/tx/${asset.originTransactionId}`}>
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Ver Transação de Criação
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Holders Rich List and Ranking Search */}
            <div className="lg:col-span-8">
              <Card className="border border-border/70 bg-card/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/50 bg-muted/15">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        Distribuição de Detentores (Rich List)
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Lista classificada das carteiras com maior saldo acumulado.
                      </CardDescription>
                    </div>
                    
                    <Badge variant="outline" className="bg-background/80 border-border/80 text-[10px] font-mono py-0.5">
                      Total: {totalHoldersCount} Holders
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 space-y-4">
                  
                  {/* Search box for ranking check */}
                  <div className="p-4 border-b border-border/40 bg-muted/5 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={searchHolderQuery}
                        onChange={(e) => setSearchHolderQuery(e.target.value)}
                        placeholder="Pesquise o endereço de uma carteira para verificar sua posição..."
                        className="pl-9 h-10 bg-background/50 border-border/60 hover:border-border rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {loadingHolders && holders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                      <p className="text-xs text-muted-foreground animate-pulse font-medium">Buscando holders do indexador...</p>
                    </div>
                  ) : filteredHolders.length === 0 ? (
                    <div className="text-center py-16 text-xs text-muted-foreground font-medium">
                      {searchHolderQuery.trim() ? "Nenhum holder correspondente ao endereço pesquisado." : "Nenhum holder indexado para este ativo."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border hover:bg-transparent bg-muted/10">
                            <TableHead className="w-[80px] text-center font-bold text-xs pl-5 text-foreground/80">Posição</TableHead>
                            <TableHead className="text-left font-bold text-xs text-foreground/80">Detentor (Wallet)</TableHead>
                            <TableHead className="text-right font-bold text-xs text-foreground/80">Saldo Acumulado ({asset.name})</TableHead>
                            <TableHead className="text-right font-bold text-xs pr-5 text-foreground/80">% do Supply</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHolders.map((row, index) => {
                            const balanceDecimal = row.balance / Math.pow(10, assetDecimals);
                            const percentOfSupply = assetTotalSupply > 0 ? (balanceDecimal / assetTotalSupply) * 100 : 0;
                            const avatarClass = getAvatarColor(row.address);

                            return (
                              <TableRow 
                                key={index} 
                                className="border-b border-border/40 hover:bg-muted/30 transition-colors group"
                              >
                                {/* Rank */}
                                <TableCell className="text-center py-3.5 pl-4">
                                  <div className="flex items-center justify-center">
                                    {getRankBadge(row.rank)}
                                  </div>
                                </TableCell>

                                {/* Wallet Address */}
                                <TableCell className="text-left py-3.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shadow-sm bg-gradient-to-br ${avatarClass}`}>
                                      <Wallet className="w-3 h-3" />
                                    </span>
                                    
                                    <div className="flex items-center gap-1.5">
                                      <Link 
                                        to={`/address/${row.address}`}
                                        className="font-mono text-xs font-bold text-foreground hover:text-emerald-500 hover:underline transition-colors"
                                      >
                                        <span className="hidden sm:inline">{row.address}</span>
                                        <span className="inline sm:hidden">{shortenHash(row.address, 10)}</span>
                                      </Link>
                                      
                                      <button
                                        onClick={() => handleCopy(row.address, "holder-" + index)}
                                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copiar Endereço"
                                      >
                                        {copiedKey === "holder-" + index ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                </TableCell>

                                {/* Balance */}
                                <TableCell className="text-right py-3.5 font-mono text-xs font-extrabold text-foreground">
                                  {balanceDecimal.toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: assetDecimals 
                                  })}
                                </TableCell>

                                {/* Percent of Supply distribution bar */}
                                <TableCell className="text-right py-3.5 pr-5">
                                  <div className="flex flex-col items-end gap-1 max-w-[120px] ml-auto">
                                    <span className="font-mono text-xs text-foreground/95 font-bold">
                                      {percentOfSupply.toFixed(4)}%
                                    </span>
                                    <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${
                                          row.rank <= 3 ? "from-yellow-400 to-amber-500" : "from-emerald-500 to-teal-500"
                                        }`} 
                                        style={{ width: `${Math.min(100, Math.max(0.5, percentOfSupply * 4))}%` }} 
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>

                {/* Load More Holders Pagination */}
                {!loadingHolders && hasMoreHolders && !searchHolderQuery && (
                  <div className="flex justify-center p-4 border-t border-border/50 bg-muted/5">
                    <Button
                      onClick={handleLoadMoreHolders}
                      disabled={loadingHolders}
                      variant="outline"
                      className="px-6 py-3 h-auto rounded-xl font-bold bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-all duration-300 shadow-md flex items-center gap-1.5 group hover:scale-[1.02]"
                    >
                      {loadingHolders ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary group-hover:text-primary-foreground" />
                          Buscando mais holders...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 text-primary group-hover:text-primary-foreground" />
                          Carregar Próximos 100 Holders (Rich List)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </MotionChild>
        </>
      )}
    </MotionContainer>
  );
};

export default AssetPage;
