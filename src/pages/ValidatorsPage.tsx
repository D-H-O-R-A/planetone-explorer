import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPloBalance, shortenHash, formatNumber } from '@/utils/formatter';
import { 
  Cpu, 
  Server, 
  Shield, 
  Coins, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  Activity, 
  Trophy, 
  Sparkles, 
  HelpCircle, 
  ArrowUpRight, 
  TrendingUp, 
  Percent,
  Search,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { getFullExplorerApiUrl } from '@/lib/utils';

interface GeneratorNode {
  address: string;
  blocks: number;
  fees: number;
}

const ValidatorsPage: React.FC = () => {
  const [generators, setGenerators] = useState<GeneratorNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [validatorSearch, setValidatorSearch] = useState<string>('');

  const fetchGenerators = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch generators from FullExplorer SQL API
      const response = await fetch(`${getFullExplorerApiUrl()}/generators`);
      if (!response.ok) {
        throw new Error('FullExplorer generators endpoint returned an error.');
      }
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Sort by blocks generated descending
        const sorted = data.sort((a: any, b: any) => b.blocks - a.blocks);
        setGenerators(sorted);
      } else {
        throw new Error('Generators format invalid or empty.');
      }
    } catch (err: any) {
      console.error('Failed to fetch generators:', err);
      setError(err.message || 'Serviço de validadores temporariamente indisponível.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerators();
  }, []);

  const handleCopy = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setCopiedIndex(index);
    toast.success('Endereço do validador copiado!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Compute overall network validator metrics
  const totalBlocks = generators.reduce((acc, curr) => acc + curr.blocks, 0);
  const totalFees = generators.reduce((acc, curr) => acc + curr.fees, 0);
  const averageBlocksPerValidator = generators.length > 0 ? Math.round(totalBlocks / generators.length) : 0;

  // Filter based on search query
  const filteredValidators = generators.filter(node => 
    node.address.toLowerCase().includes(validatorSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-6 pb-20 animate-fade-in">
      
      {/* Header section with live counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              Nós Validadores da Blockchain
            </h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1 py-0.5 px-2.5 rounded-full font-bold text-[10px] animate-pulse">
              <Activity className="w-3 h-3" />
              LPoS Ativo
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Nós validadores responsáveis por assinar blocos, processar transações Ride e consolidar o consenso na blockchain Planet One (PLO).
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchGenerators}
          className="border-border self-start md:self-center hover:bg-muted/50 rounded-xl"
        >
          <Loader2 className={`w-3.5 h-3.5 mr-1.5 text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Validadores
        </Button>
      </div>

      {/* Grid: Validator Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Active Nodes */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow hover:border-emerald-500/15 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Validadores Ativos</CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Cpu className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : generators.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-emerald-500" /> Nós validando ativamente
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Total blocks produced */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow hover:border-emerald-500/15 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Blocos Gerados (Indexados)</CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Server className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground font-mono">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatNumber(totalBlocks)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Soma de blocos consolidados por nós</p>
          </CardContent>
        </Card>

        {/* Metric 3: Total fees distributed */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow hover:border-emerald-500/15 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Taxas de Consenso (PLO)</CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-emerald-500 font-mono">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatPloBalance(totalFees)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Incentivos coletados on-chain</p>
          </CardContent>
        </Card>

        {/* Metric 4: Average block rate */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow hover:border-emerald-500/15 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Produtividade Média</CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground font-mono">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatNumber(averageBlocksPerValidator)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Blocos gerados por validador</p>
          </CardContent>
        </Card>

      </div>

      {/* Consensus features quick guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border/50 bg-card/25 backdrop-blur-sm shadow-sm flex items-start gap-4 p-5 hover:border-emerald-500/10 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Consenso LPoS</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mecanismo Leased Proof of Stake ultra-eficiente e sustentável, alinhado à conservação ecológica da Planet One.
            </p>
          </div>
        </Card>

        <Card className="border border-border/50 bg-card/25 backdrop-blur-sm shadow-sm flex items-start gap-4 p-5 hover:border-emerald-500/10 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Geração de Blocos</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nós geradores recebem blocos por slots matemáticos proporcionais ao seu poder de stake arrendado (Leased).
            </p>
          </div>
        </Card>

        <Card className="border border-border/50 bg-card/25 backdrop-blur-sm shadow-sm flex items-start gap-4 p-5 hover:border-emerald-500/10 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Lease de Stake</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Detentores do token PLO podem realizar o arrendamento (lease) de seu stake para validadores e obter retornos on-chain.
            </p>
          </div>
        </Card>
      </div>

      {/* Validators Productivity Panel */}
      <Card className="border border-border bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
        <CardHeader className="pb-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Trophy className="w-4 h-4 text-emerald-500" />
              Ranking de Produtividade dos Validadores
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Desempenho histórico consolidado e participação percentual na consolidação do ledger.
            </CardDescription>
          </div>
          
          {/* Filter validators input */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={validatorSearch}
              onChange={(e) => setValidatorSearch(e.target.value)}
              placeholder="Buscar validador por endereço..."
              className="pl-8 pr-4 py-4 bg-background/50 border-border text-[11px] rounded-xl focus-visible:ring-emerald-500/50"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-muted-foreground font-medium animate-pulse">Sincronizando estatísticas de blocos...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 gap-3 bg-destructive/5 border border-destructive/10 rounded-xl m-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm font-semibold text-foreground">Telemetria de Validadores Indisponível</p>
              <p className="text-xs text-muted-foreground max-w-sm leading-normal">{error}</p>
            </div>
          ) : filteredValidators.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              Nenhum nó validador correspondente aos filtros de pesquisa.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="w-[80px] text-xs font-bold text-muted-foreground pl-6">Posição</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground">Endereço do Validador</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground text-right w-[150px]">Participação</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground text-right">Blocos Assinados</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground text-right pr-6">Taxas Coletadas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredValidators.map((node, index) => {
                      // Calculate percentage share of total blocks produced
                      const blockShare = totalBlocks > 0 ? (node.blocks / totalBlocks) * 100 : 0;
                      
                      return (
                        <TableRow 
                          key={index} 
                          className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                        >
                          <TableCell className="font-mono text-xs font-black text-muted-foreground pl-6 py-4">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] ${
                              index === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              index === 1 ? 'bg-slate-400/10 text-slate-400 border border-slate-400/20' :
                              index === 2 ? 'bg-amber-700/10 text-amber-700 border border-amber-700/20' :
                              'text-muted-foreground bg-muted/40'
                            }`}>
                              {index + 1}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-emerald-500/5 text-emerald-500">
                                <Server className="w-3.5 h-3.5" />
                              </span>
                              <Link 
                                to={`/address/${node.address}`} 
                                className="font-mono text-xs font-bold text-foreground hover:text-emerald-500 hover:underline transition-colors"
                              >
                                {node.address}
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 hover:bg-muted rounded" 
                                onClick={() => handleCopy(node.address, index)}
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                )}
                              </Button>
                            </div>
                          </TableCell>

                          {/* Dynamic Block Share Progress Bar */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs font-mono font-bold text-muted-foreground">{blockShare.toFixed(2)}%</span>
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full" 
                                  style={{ width: `${blockShare}%` }} 
                                />
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                            {node.blocks.toLocaleString()}
                          </TableCell>

                          <TableCell className="text-right font-mono text-xs font-bold text-emerald-500 pr-6">
                            {formatPloBalance(node.fees)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards Layout */}
              <div className="block md:hidden p-4 space-y-4">
                {filteredValidators.map((node, index) => {
                  const blockShare = totalBlocks > 0 ? (node.blocks / totalBlocks) * 100 : 0;
                  
                  return (
                    <div 
                      key={index} 
                      className="border border-border rounded-xl bg-muted/10 p-4 space-y-3 hover:border-emerald-500/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          index === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          index === 1 ? 'bg-slate-400/10 text-slate-400 border border-slate-400/20' :
                          index === 2 ? 'bg-amber-700/10 text-amber-700 border border-amber-700/20' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          Rank #{index + 1}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">{blockShare.toFixed(2)}% de share</span>
                          <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${blockShare}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-xs space-y-2 text-muted-foreground pt-1">
                        <div className="flex flex-col gap-1">
                          <span>Endereço do Validador:</span>
                          <div className="flex items-center gap-1 bg-background/50 p-2 rounded-lg border border-border">
                            <Link 
                              to={`/address/${node.address}`} 
                              className="font-mono text-[11px] text-foreground font-semibold truncate hover:text-emerald-500"
                            >
                              {node.address}
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 hover:bg-muted shrink-0" 
                              onClick={() => handleCopy(node.address, index)}
                            >
                              {copiedIndex === index ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between pt-1 border-t border-border/40">
                          <span>Blocos Assinados:</span>
                          <span className="font-mono text-foreground font-bold">{node.blocks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxas Acumuladas:</span>
                          <span className="font-mono text-emerald-500 font-bold">{formatPloBalance(node.fees)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Validator Lease Accordion Guide */}
      <Card className="border border-border bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <HelpCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Como Apoiar um Validador & Obter Rendimentos?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Qualquer detentor de moedas PLO pode participar ativamente da segurança da rede sem a necessidade de rodar um nó de infraestrutura própria.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl border border-border/60 bg-background/50">
                <p className="font-bold text-emerald-500">1. Arrende seu Stake (Lease)</p>
                <p className="text-muted-foreground leading-relaxed">
                  Realize um contrato de lease on-chain em sua carteira direcionando o stake de suas moedas para o endereço de um validador ativo acima. Suas moedas continuam seguras em sua carteira.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl border border-border/60 bg-background/50">
                <p className="font-bold text-emerald-500">2. Aumente o Poder do Nó</p>
                <p className="text-muted-foreground leading-relaxed">
                  Quanto maior o volume de moedas arrendadas para um nó, maior será sua probabilidade matemática de assinar os próximos blocos da rede e consolidar taxas.
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl border border-border/60 bg-background/50">
                <p className="font-bold text-emerald-500">3. Receba Recompensas</p>
                <p className="text-muted-foreground leading-relaxed">
                  Os validadores compartilham as taxas de transação e recompensas coletadas de forma automatizada com seus apoiadores, proporcionalmente ao stake arrendado por cada um.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button size="sm" asChild className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl font-semibold px-4 py-4 text-xs gap-1.5">
                <a href="https://wallet.planetone.io" target="_blank" rel="noopener noreferrer">
                  Arrendar Stake na Planet One Wallet
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default ValidatorsPage;
