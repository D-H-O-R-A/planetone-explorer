import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  AddressData, 
  Transaction, 
  getTransactionTypeName, 
  fetchDecimalsAsset, 
  DetailedBalance, 
  NFT 
} from '@/services/api';
import { shortenHash, formatTimestamp, formatPloBalance, formatAssetAmount } from '@/utils/formatter';
import { toast } from 'sonner';
import { 
  Copy, Check, User, Wallet, Code, Database, 
  Loader2, ExternalLink, Image as ImageIcon, 
  ShieldAlert, Award, FileText, Landmark, Clock, Coins, Terminal, Sparkles
} from 'lucide-react';
import { getChainId, getCoinName, getFullExplorerUiUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { maskedAssetId } from './TransactionTypeDetails';
import TokenImage from './TokenImage';

interface AddressViewProps {
  addressData: AddressData;
  detailedBalance: DetailedBalance | null;
  transactions?: Transaction[];
  loadingTransactions?: boolean;
  nfts?: NFT[];
  loadingNFTs?: boolean;
}

const AddressView = ({ 
  addressData, 
  detailedBalance, 
  transactions = [], 
  loadingTransactions = false,
  nfts = [],
  loadingNFTs = false
}: AddressViewProps) => {
  const { address } = useParams<{ address: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const [txWithDecimals, setTxWithDecimals] = useState<any[]>([]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copiado para a área de transferência`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTransactionClick = (txId: string) => {
    navigate(`/tx/${txId}`);
  };

  // Unique colorful gradient seeded from the address
  const generateGradientFromAddress = (addr: string) => {
    if (!addr) return "from-emerald-500 to-teal-600";
    let hash = 0;
    for (let i = 0; i < addr.length; i++) {
      hash = addr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorPairs = [
      "from-emerald-500 to-teal-600",
      "from-blue-500 to-indigo-600",
      "from-violet-500 to-purple-600",
      "from-fuchsia-500 to-pink-600",
      "from-amber-500 to-orange-600",
      "from-cyan-500 to-blue-600",
      "from-red-500 to-rose-600"
    ];
    return colorPairs[Math.abs(hash) % colorPairs.length];
  };

  const avatarGradient = generateGradientFromAddress(addressData.wavesAddress || '');

  // Load asset decimals for the transactions list
  useEffect(() => {
    const loadDecimals = async () => {
      if (!transactions || transactions.length === 0) return;

      const processed = await Promise.all(
        transactions.slice(0, 100).map(async (tx) => {
          try {
            const assetId = tx.assetId;
            const decimals = (!assetId || assetId === 'null' || assetId === 'undefined')
              ? 8
              : (await fetchDecimalsAsset(assetId)) ?? 8;

            return {
              ...tx,
              decimals,
            };
          } catch (error) {
            console.error(`Erro ao buscar decimals do asset ${tx.assetId}:`, error);
            return {
              ...tx,
              decimals: 8,
            };
          }
        })
      );

      setTxWithDecimals(processed);
    };

    loadDecimals();
  }, [transactions]);

  const openPlanetOneDApp = () => {
    if (addressData.wavesAddress) {
      window.open(`https://dapp.planetone.io/${addressData.wavesAddress}`, '_blank');
    }
  };

  // Verify if it's a validator node (generating balance differs from regular and is greater than 0)
  const isValidatorNode = detailedBalance && 
    (detailedBalance.generatingBalance !== detailedBalance.regularBalance ||
     detailedBalance.generatingBalance !== detailedBalance.availableBalance) && 
    detailedBalance.generatingBalance > 0;

  // Format big numbers cleanly
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className="space-y-6 section-transition">
      {/* Premium Web3 Header Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-6 md:p-8 backdrop-blur-xl shadow-lg">
        {/* Abstract decorative background glow */}
        <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Seed-generated Profile Avatar */}
          <div className={`relative flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${avatarGradient} text-white shadow-md shadow-emerald-500/10`}>
            {addressData.scriptInfo ? (
              <Code className="h-8 w-8 md:h-10 md:w-10 animate-pulse" />
            ) : (
              <Wallet className="h-8 w-8 md:h-10 md:w-10" />
            )}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border">
              {addressData.scriptInfo ? (
                <Terminal className="h-3 w-3 text-purple-500" />
              ) : (
                <User className="h-3 w-3 text-emerald-500" />
              )}
            </div>
          </div>

          {/* Core Info */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 w-full">
              <Badge variant="outline" className={`border-emerald-500/30 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400 font-medium px-2.5 py-0.5 text-xs`}>
                {addressData.scriptInfo ? "Smart Contract (dApp)" : "User Account"}
              </Badge>
              {isValidatorNode && (
                <Badge className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs font-semibold px-2.5 py-0.5">
                  Validator Node
                </Badge>
              )}
              {addressData.aliases && addressData.aliases.length > 0 && (
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-500 dark:text-blue-400 text-xs font-medium px-2.5 py-0.5">
                  <Award className="h-3 w-3 mr-1" />
                  {addressData.aliases.length} Alias{addressData.aliases.length > 1 ? 'es' : ''}
                </Badge>
              )}
              <a 
                href={getFullExplorerUiUrl(addressData.wavesAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="md:ml-auto flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/20 hover:border-primary/35 text-xs font-bold text-primary transition-all active:scale-95 shadow-sm"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Ver no Full Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {addressData.wavesAddress === '3LDqeVbNxAyg1pmyQBARW853LBxaFmjumcy' && (
              <div className="flex flex-wrap items-center gap-2 py-1">
                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-extrabold px-3 py-1 rounded-xl">
                  Criador Gênesis 👑
                </Badge>
              </div>
            )}

            <div className="space-y-2">
              {/* Main Planet One Address */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                  {getCoinName()} Address:
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm md:text-base text-card-foreground break-all bg-muted/30 dark:bg-black/20 p-1 px-2.5 rounded-lg border border-border/30">
                    {addressData.wavesAddress}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 shrink-0 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all rounded-lg" 
                    onClick={() => copyToClipboard(addressData.wavesAddress || '', `${getCoinName()} Address`)}
                    title="Copiar endereço"
                  >
                    {copiedField === `${getCoinName()} Address` ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Converted Ethereum Address */}
              {addressData.ethAddress && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    EVM Address:
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs md:text-sm text-muted-foreground break-all bg-muted/10 dark:bg-black/10 p-1 px-2.5 rounded-lg border border-border/20">
                      {addressData.ethAddress}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 shrink-0 hover:bg-blue-500/10 hover:text-blue-500 transition-all rounded-lg" 
                      onClick={() => copyToClipboard(addressData.ethAddress || '', "EVM Address")}
                      title="Copiar endereço EVM"
                    >
                      {copiedField === "EVM Address" ? <Check className="h-4 w-4 text-blue-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aliases Pill Badges list */}
        {addressData.aliases && addressData.aliases.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Aliases mapeados na rede:
            </span>
            <div className="flex flex-wrap gap-2">
              {addressData.aliases.map((alias, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-1 text-xs bg-muted/40 hover:bg-muted/80 border border-border/50 text-foreground rounded-full transition-all"
                >
                  <span className="font-mono">{alias}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unified Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-muted/40 border border-border/50 p-1 h-auto flex gap-1 rounded-xl mb-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background/80 data-[state=active]:text-emerald-500 dark:data-[state=active]:text-emerald-400 font-medium px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-background/80 data-[state=active]:text-emerald-500 dark:data-[state=active]:text-emerald-400 font-medium px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-background/80 data-[state=active]:text-emerald-500 dark:data-[state=active]:text-emerald-400 font-medium px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2">
            <Database className="h-4 w-4" />
            Tokens ({addressData.assets?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="nfts" className="data-[state=active]:bg-background/80 data-[state=active]:text-emerald-500 dark:data-[state=active]:text-emerald-400 font-medium px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            NFTs ({nfts.length})
          </TabsTrigger>
          <TabsTrigger value="script" className="data-[state=active]:bg-background/80 data-[state=active]:text-emerald-500 dark:data-[state=active]:text-emerald-400 font-medium px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2">
            <Code className="h-4 w-4" />
            Smart Contract
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-background/80 data-[state=active]:text-emerald-500 dark:data-[state=active]:text-emerald-400 font-medium px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Database entries ({addressData.dataEntries?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab content 1: Overview Dashboard */}
        <TabsContent value="overview" className="outline-none space-y-6">
          {/* Detailed Balances Grid */}
          {detailedBalance && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Saldos Detalhados do Portfólio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Balance Card */}
                <Card className="bg-card/30 border-border/50 hover:border-emerald-500/20 shadow-sm transition-all duration-300">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saldo Total</div>
                      <div className="text-lg md:text-xl font-bold truncate">
                        {formatPloBalance(detailedBalance.balance)} <span className="text-xs font-semibold text-primary">{getCoinName()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Balance Card */}
                <Card className="bg-card/30 border-border/50 hover:border-emerald-500/20 shadow-sm transition-all duration-300">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Disponível</div>
                      <div className="text-lg md:text-xl font-bold truncate">
                        {formatPloBalance(detailedBalance.availableBalance)} <span className="text-xs font-semibold text-primary">{getCoinName()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Effective Balance Card */}
                <Card className="bg-card/30 border-border/50 hover:border-emerald-500/20 shadow-sm transition-all duration-300">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Efetivo</div>
                      <div className="text-lg md:text-xl font-bold truncate">
                        {formatPloBalance(detailedBalance.effectiveBalance)} <span className="text-xs font-semibold text-primary">{getCoinName()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Generating Balance Card */}
                <Card className="bg-card/30 border-border/50 hover:border-emerald-500/20 shadow-sm transition-all duration-300">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gerador</div>
                      <div className="text-lg md:text-xl font-bold truncate">
                        {formatPloBalance(detailedBalance.generatingBalance)} <span className="text-xs font-semibold text-primary">{getCoinName()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Allocation Progress bar comparison */}
              <div className="border border-border/50 rounded-2xl bg-card/10 p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider">Uso e Alocação do Saldo</span>
                  <span className="text-muted-foreground">Saldos expressos em {getCoinName()}</span>
                </div>
                {(() => {
                  const total = detailedBalance.balance || 1;
                  const availablePercent = Math.min(100, Math.max(0, (detailedBalance.availableBalance / total) * 100));
                  const generatingPercent = Math.min(100, Math.max(0, (detailedBalance.generatingBalance / total) * 100));
                  
                  return (
                    <div className="space-y-4">
                      {/* Visual Stacked Progress Bar */}
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 h-full transition-all" 
                          style={{ width: `${availablePercent}%` }}
                          title={`Disponível: ${availablePercent.toFixed(1)}%`}
                        />
                        <div 
                          className="bg-amber-500 h-full transition-all" 
                          style={{ width: `${generatingPercent}%` }}
                          title={`Gerador: ${generatingPercent.toFixed(1)}%`}
                        />
                      </div>
                      
                      {/* Allocation Legend */}
                      <div className="flex flex-wrap gap-4 text-xs font-medium pt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          <span>Disponível para transferências ({availablePercent.toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-3 w-3 rounded-full bg-amber-500" />
                          <span>Gerando recompensas / Bloco ({generatingPercent.toFixed(1)}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Validator Node Amber warning info box */}
          {isValidatorNode && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-amber-500 dark:text-amber-400">Nó Validador Ativo Detectado</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    O saldo gerador deste endereço difere do saldo regular devido à sua participação no consenso do protocolo Planet One. Os blocos e recompensas que ele assina e distribui são baseados no Saldo Gerador efetivo, que se consolida ao término de cada época da rede.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* General Metadata Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/30 border-border/50 hover:border-emerald-500/10 shadow-sm transition-all duration-300">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  Metadados da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Volume de Transações:</span>
                    <span className="font-semibold bg-muted/40 p-1 px-3 rounded-lg text-xs font-mono">{addressData.totalTransactions || 0} Tx</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tokens Criados ou Detidos:</span>
                    <span className="font-semibold bg-muted/40 p-1 px-3 rounded-lg text-xs font-mono">{addressData.assets?.length || 0} Assets</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Colecionáveis (NFTs):</span>
                    <span className="font-semibold bg-muted/40 p-1 px-3 rounded-lg text-xs font-mono">{nfts.length} NFTs</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Smart Contract Script:</span>
                    <Badge variant={addressData.scriptInfo ? "default" : "secondary"} className="text-xs px-2.5">
                      {addressData.scriptInfo ? "Ativo (Ride Script)" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border/50 hover:border-emerald-500/10 shadow-sm transition-all duration-300">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-500" />
                  Base de Dados (State Key)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Registros na Blockchain (Database entries):</span>
                    <span className="font-semibold bg-muted/40 p-1 px-3 rounded-lg text-xs font-mono">{addressData.dataEntries?.length || 0} chaves</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Contas e dApps na rede Planet One podem persistir dados indexados diretamente no estado distribuído. Isso permite criar registros imutáveis de identidade, parâmetros de contrato e estados operacionais acessíveis publicamente. Explore as chaves na aba <strong>Database entries</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab content 2: Transactions History Table */}
        <TabsContent value="transactions" className="outline-none">
          <Card className="bg-card/40 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Histórico de Transações</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Últimas 100 transações envolvendo esta conta</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground px-3">
                Total: {transactions.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="border-b border-border/30">
                      <TableHead className="py-4 pl-6 text-xs uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Tx ID</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Bloco</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Timestamp</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Montante</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Taxa (Fee)</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Remetente</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Destinatário / dApp</TableHead>
                      <TableHead className="py-4 pr-6 text-xs uppercase tracking-wider text-muted-foreground">Informações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-20">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : transactions.length > 0 ? (
                      txWithDecimals.map((tx) => (
                        <TableRow 
                          key={tx.id} 
                          className="border-b border-border/20 cursor-pointer hover:bg-muted/20 transition-all"
                          onClick={() => handleTransactionClick(tx.id)}
                        >
                          <TableCell className="py-4 pl-6">
                            <Badge variant="outline" className="capitalize text-xs px-2 font-medium bg-muted/40 text-card-foreground">
                              {getTransactionTypeName(tx.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 font-mono font-medium text-xs text-primary hover:underline">
                            {shortenHash(tx.id, 8)}
                          </TableCell>
                          <TableCell className="py-4">
                            {tx.height ? (
                              <Link 
                                to={`/block/${tx.height}`} 
                                className="hover:text-primary hover:underline font-mono text-xs font-semibold" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                {tx.height}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-xs">Pendente</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col text-xs">
                              <span className="text-muted-foreground truncate max-w-[120px]" title={formatTimestamp(tx.timestamp)}>
                                {formatTimestamp(tx.timestamp)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {(() => {
                              if (tx.type === 11 && tx.totalAmount) {
                                return <span className="text-xs font-semibold font-mono text-card-foreground">{formatAssetAmount(tx.totalAmount, tx.decimals)} <span className="text-primary">{tx.assetId ? maskedAssetId(tx.assetId) : getCoinName()}</span></span>;
                              } else if (tx.amount) {
                                return <span className="text-xs font-semibold font-mono text-card-foreground">{formatAssetAmount(tx.amount, tx.decimals)} <span className="text-primary">{tx.assetId ? maskedAssetId(tx.assetId) : getCoinName()}</span></span>;
                              } else if (tx.payload && tx.payload.amount) {
                                return <span className="text-xs font-semibold font-mono text-card-foreground">{formatAssetAmount(tx.payload.amount, tx.decimals)} <span className="text-primary">{tx.assetId ? maskedAssetId(tx.assetId) : getCoinName()}</span></span>;
                              } else {
                                return <span className="text-muted-foreground text-xs">-</span>;
                              }
                            })()}
                          </TableCell>
                          <TableCell className="py-4 font-mono text-xs text-muted-foreground">
                            {formatAssetAmount(tx.fee, 8)} <span className="text-primary">{maskedAssetId(tx.feeAsset) ?? getCoinName()}</span>
                          </TableCell>
                           <TableCell className="py-4">
                            <Link 
                              to={`/address/${tx.sender}`} 
                              className="hover:underline text-xs text-primary font-mono truncate max-w-[100px] inline-block"
                              title={tx.sender}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!tx.sender || tx.sender === "" || tx.id === '5b41TrGD55vcfNc489rbdcKDnh5stoLY1UB1xFRde2JnKmZpHnU49nvi6k4j9u8ivR9hoaNPqQiARy7XVtEYt5zr' ? "Satoshi Nakamoto 👑" : shortenHash(tx.sender, 6)}
                            </Link>
                          </TableCell>
                          <TableCell className="py-4">
                            {(() => {
                              const recipient = tx.recipient || tx.dApp || (tx.payload && tx.payload.recipient);
                              if (recipient) {
                                return (
                                  <Link 
                                    to={`/address/${recipient}`} 
                                    className="hover:underline text-xs text-primary font-mono truncate max-w-[100px] inline-block"
                                    title={recipient}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {shortenHash(recipient, 6)}
                                  </Link>
                                );
                              } else {
                                return <span className="text-muted-foreground text-xs">-</span>;
                              }
                            })()}
                          </TableCell>
                          <TableCell className="py-4 pr-6">
                            {(() => {
                              if (tx.assetId) {
                                return (
                                  <Link 
                                    to={`/asset/${tx.assetId}`} 
                                    className="hover:underline text-xs text-primary transition-colors font-mono truncate max-w-[100px] inline-block"
                                    title={`Asset ID: ${tx.assetId}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Token: {shortenHash(tx.assetId, 4)}
                                  </Link>
                                );
                              } else if (tx.attachment && tx.attachment !== '') {
                                return (
                                  <span className="truncate inline-block max-w-[100px] text-xs text-muted-foreground font-sans" title={`Attachment: ${tx.attachment}`}>
                                    Anexo: {tx.attachment}
                                  </span>
                                );
                              } else if (tx.function || (tx.call && tx.call.function)) {
                                const funcName = tx.function || (tx.call && tx.call.function);
                                return (
                                  <span className="truncate inline-block max-w-[100px] text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md px-1.5 py-0.5 font-mono" title={`Function: ${funcName}`}>
                                    {funcName}
                                  </span>
                                );
                              } else if (tx.payload && tx.payload.call && tx.payload.call.function) {
                                return (
                                  <span className="truncate inline-block max-w-[100px] text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md px-1.5 py-0.5 font-mono" title={`Function: ${tx.payload.call.function}`}>
                                    {tx.payload.call.function}
                                  </span>
                                );
                              } else if (tx.alias) {
                                return (
                                  <span className="truncate inline-block max-w-[100px] text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md px-1.5 py-0.5 font-mono" title={`Alias: ${tx.alias}`}>
                                    {tx.alias}
                                  </span>
                                );
                              } else {
                                return <span className="text-muted-foreground text-xs">-</span>;
                              }
                            })()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-20">
                          <p className="text-muted-foreground text-sm">
                            Nenhuma transação encontrada para este endereço na blockchain.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content 3: Token Assets list */}
        <TabsContent value="assets" className="outline-none">
          <Card className="bg-card/40 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30">
              <CardTitle className="text-lg font-bold">Ativos Disponíveis</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Tokens customizados emitidos na blockchain Planet One detidos por esta conta</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="border-b border-border/30">
                      <TableHead className="py-4 pl-6 text-xs uppercase tracking-wider text-muted-foreground">Nome do Ativo</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Asset ID</TableHead>
                      <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Emissor</TableHead>
                      <TableHead className="py-4 pr-6 text-right text-xs uppercase tracking-wider text-muted-foreground">Saldo Disponível</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addressData.assets && addressData.assets.length > 0 ? (
                      addressData.assets.map((asset) => (
                        <TableRow 
                          key={asset.assetId} 
                          className="border-b border-border/20 cursor-pointer hover:bg-muted/20 transition-all"
                          onClick={() => navigate(`/asset/${asset.assetId}`)}
                        >
                          <TableCell className="py-4 pl-6">
                            <div className="flex items-center gap-3">
                              <TokenImage 
                                assetId={asset.assetId} 
                                size="sm" 
                                className="w-8 h-8 rounded-lg border-emerald-500/10"
                                fallback={
                                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm shrink-0">
                                    {asset.name?.substring(0, 2).toUpperCase() || "AS"}
                                  </div>
                                }
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-sm truncate max-w-[150px] md:max-w-[200px]" title={asset.name}>
                                  {asset.name || 'Unknown Asset'}
                                </div>
                                {asset.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-[250px]" title={asset.description}>
                                    {asset.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 font-mono text-xs text-primary hover:underline">
                            {shortenHash(asset.assetId, 12)}
                          </TableCell>
                          <TableCell className="py-4">
                            {asset.issuer ? (
                              <Link 
                                to={`/address/${asset.issuer}`} 
                                className="hover:underline text-xs text-muted-foreground font-mono"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {shortenHash(asset.issuer, 8)}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 pr-6 text-right font-mono font-semibold text-sm">
                            {asset.balance ? formatAssetAmount(asset.balance, asset.decimals) : '0'} <span className="text-xs text-muted-foreground">{asset.name}</span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-20">
                          <p className="text-muted-foreground text-sm">
                            Nenhum token customizado encontrado para esta conta.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content 4: NFTs Visual Gallery */}
        <TabsContent value="nfts" className="outline-none">
          <Card className="bg-card/40 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30">
              <CardTitle className="text-lg font-bold">Galeria de NFTs</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Fungible digital collectibles e NFTs detidos por esta conta</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingNFTs ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-sm">Nenhum NFT colecionável detido por esta conta.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <Card 
                      key={nft.assetId} 
                      className="group bg-muted/20 border-border/50 hover:border-emerald-500/30 overflow-hidden transition-all duration-300 shadow-md cursor-pointer"
                      onClick={() => navigate(`/asset/${nft.assetId}`)}
                    >
                      <div className="relative aspect-square w-full bg-gradient-to-tr from-muted/50 via-primary/5 to-emerald-500/10 flex items-center justify-center overflow-hidden">
                        <ImageIcon className="h-16 w-16 text-emerald-500/30 group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-2 backdrop-blur-sm">
                          <ExternalLink className="h-4 w-4" />
                          Ver Detalhes do NFT
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div className="min-w-0">
                          <h4 className="font-bold text-base truncate text-card-foreground">{nft.name || "Art Collectible"}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[2rem]">
                            {nft.description || 'Nenhuma descrição imutável anexada.'}
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border/30 text-xs">
                          <span className="font-mono text-muted-foreground">
                            ID: {shortenHash(nft.assetId, 6)}
                          </span>
                          <span className="text-emerald-500 font-semibold text-xs group-hover:underline flex items-center gap-1">
                            Explorar
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content 5: Smart Contract (Script Information) */}
        <TabsContent value="script" className="outline-none">
          <Card className="bg-card/40 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-500" />
                Arquitetura do Contrato (Ride dApp)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Informações de chamadas, scripts de complexidade e funções callable públicas</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {addressData.scriptInfo ? (
                <div className="space-y-6">
                  {/* Action buttons and callable functions header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                      Funções dApp Públicas Disponíveis (API)
                    </h3>
                    <Button 
                      onClick={openPlanetOneDApp}
                      className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 font-medium px-4 h-9 rounded-lg"
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visualizar dApp Console
                    </Button>
                  </div>

                  {/* Callable functions render list */}
                  {addressData.scriptInfo.callableFunctions && Object.keys(addressData.scriptInfo.callableFunctions).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(addressData.scriptInfo.callableFunctions).map(([funcName, params]) => (
                        <div key={funcName} className="border border-border/50 bg-card/20 rounded-xl p-4 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 font-mono text-sm">
                                {funcName}()
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {params.length} argumento{params.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {params.length > 0 ? (
                              <div className="mt-3 space-y-2 border-t border-border/30 pt-3">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
                                  Parâmetros de Entrada:
                                </span>
                                <div className="space-y-1.5">
                                  {params.map((param, index) => (
                                    <div key={index} className="flex items-center text-xs">
                                      <span className="font-mono bg-purple-500/5 text-purple-400 px-2 py-0.5 rounded border border-purple-500/10 font-bold mr-2">
                                        {param.name}
                                      </span>
                                      <Badge variant="outline" className="text-[10px] font-mono capitalize">
                                        {param.type}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-2 italic">Nenhum parâmetro de entrada exigido.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground">O Smart Contract está ativo mas não expõe funções `callable` públicas ou assinaturas de parâmetros.</p>
                    </div>
                  )}

                  {/* Code script JSON */}
                  <div className="space-y-3 pt-4 border-t border-border/30">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-purple-400" />
                        Ride Metadata (JSON Schema)
                      </h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 hover:bg-purple-500/10 text-purple-400 border border-purple-500/15"
                        onClick={() => copyToClipboard(addressData.scriptInfo?.script || '', "Metadata dApp")}
                      >
                        {copiedField === "Metadata dApp" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        Copiar Script
                      </Button>
                    </div>
                    <div className="bg-black/40 border border-border/40 p-4 rounded-xl overflow-auto max-h-96">
                      <pre className="text-xs text-purple-300 font-mono whitespace-pre-wrap leading-relaxed">
                        {addressData.scriptInfo.script}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-sm">Esta conta não possui dApp ou Script ativados na rede Planet One.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content 6: Data Entries (State list) */}
        <TabsContent value="data" className="outline-none">
          <Card className="bg-card/40 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-emerald-500 animate-pulse" />
                  Banco de Dados Imutável (On-chain State)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Registros persistentes indexados por chaves e tipos primitivos na blockchain</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground px-3">
                {addressData.dataEntries?.length || 0} entries
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {addressData.dataEntries && addressData.dataEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="border-b border-border/30">
                        <TableHead className="py-4 pl-6 text-xs uppercase tracking-wider text-muted-foreground">Chave (Key)</TableHead>
                        <TableHead className="py-4 text-xs uppercase tracking-wider text-muted-foreground">Tipo de Dado</TableHead>
                        <TableHead className="py-4 pr-6 text-xs uppercase tracking-wider text-muted-foreground">Valor Armazenado (Value)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addressData.dataEntries.map((entry, index) => (
                        <TableRow key={index} className="border-b border-border/20 hover:bg-muted/20 transition-all">
                          <TableCell className="py-4 pl-6 font-mono text-sm font-semibold text-card-foreground">
                            <span className="truncate inline-block max-w-[200px] md:max-w-[300px]" title={entry.key}>
                              {entry.key}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="capitalize text-xs px-2.5 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400 border-emerald-500/20">
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 pr-6">
                            <div className="font-mono bg-black/20 p-2.5 rounded-lg border border-border/30 text-xs text-card-foreground max-w-full overflow-x-auto whitespace-pre-wrap leading-normal break-all">
                              {String(entry.value)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-sm">Nenhum registro no banco de dados imutável encontrado para este endereço.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddressView;
