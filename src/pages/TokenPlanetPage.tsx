import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchAssetDetails, Asset } from '@/services/api';
import { formatNumber, formatDate, shortenHash } from '@/utils/formatter';
import { 
  Trees, 
  MapPin, 
  Scale, 
  Coins, 
  ShieldCheck, 
  Calculator, 
  Info, 
  ExternalLink, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Compass, 
  Layers, 
  TrendingUp,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { wavesAsset2Eth } from '@better2better/waves-node-api-js';
import { motion } from 'framer-motion';

const TokenPlanetPage: React.FC = () => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ethAssetId, setEthAssetId] = useState<string | null>(null);

  // Calculator State
  const [verdeAmount, setVerdeAmount] = useState<string>('1000');

  useEffect(() => {
    const loadVerdeAsset = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch real VERDE asset details from the blockchain node API
        const assetData = await fetchAssetDetails('VERDE');
        if (assetData) {
          setAsset(assetData);
          try {
            const ethId = wavesAsset2Eth(assetData.assetId);
            setEthAssetId(ethId);
          } catch (e) {
            console.error('Error converting asset ID to 0x format:', e);
          }
        } else {
          throw new Error('Asset VERDE não encontrado na rede atual.');
        }
      } catch (err: any) {
        console.error('Failed to load VERDE asset details:', err);
        setError(err.message || 'Erro ao sincronizar dados on-chain do token VERDE.');
      } finally {
        setLoading(false);
      }
    };

    loadVerdeAsset();
  }, []);

  // Constants for standard market carbon calculation
  // 1 m² (1 VERDE) = 0.75 kg CO₂ / year (or 7.50 t CO₂ / ha / year)
  const CO2_KG_PER_M2_YEAR = 0.75;
  const YEARS = 10;

  const parsedVerde = parseFloat(verdeAmount.replace(/,/g, '')) || 0;
  const equivalentHectares = parsedVerde / 10000;
  
  // Total CO2 in kg over 10 years = parsedVerde * 0.75 * 10
  const co2KgTotal = parsedVerde * CO2_KG_PER_M2_YEAR * YEARS;
  // Total CO2 in tonnes = co2KgTotal / 1000
  const co2TonnesTotal = co2KgTotal / 1000;

  // Environmental equivalents
  const treesEquivalents = Math.round(co2TonnesTotal * 6); // 1 tonne CO2 offsets approx 6 trees growth
  const carKmEquivalents = Math.round(co2KgTotal * 4.1); // approx car emissions km

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in space-y-10 pb-20">
      
      {/* Back to explorer button */}
      <div className="flex items-center justify-between animate-fade-in">
        <Button variant="ghost" size="sm" asChild className="hover:bg-muted/50 text-muted-foreground hover:text-foreground">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Explorer
          </Link>
        </Button>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-semibold flex items-center gap-1">
          <Leaf className="w-3.5 h-3.5" />
          RWA Ecossistema
        </Badge>
      </div>

      {/* Hero Section with Split Layout & 3D Rotating Token Coin */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-background p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-[80px] -z-10 animate-pulse duration-5000" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left: Text part */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Primeiro Ativo Ambiental Tokenizado
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              O Token <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">VERDE</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              O <strong>VERDE</strong> é o primeiro ativo ambiental tokenizado do ecossistema Planet One, desenvolvido para representar projetos certificados de créditos de carbono provenientes da preservação e conservação de ecossistemas naturais.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="sm" asChild className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl px-5 py-5 font-semibold text-xs">
                <a href="https://wallet.planetone.io" target="_blank" rel="noopener noreferrer">
                  Adquirir Token VERDE
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild className="border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 rounded-xl px-5 py-5 font-semibold text-xs">
                <a href="https://better2better.net/softwares/b2-wallet" target="_blank" rel="noopener noreferrer">
                  B2 Wallet
                </a>
              </Button>
            </div>
          </div>

          {/* Right: Floating rotating token coin */}
          <div className="md:col-span-5 lg:col-span-4 flex justify-center items-center">
            <motion.div 
              animate={{ 
                y: [0, -12, 0],
                rotateY: [0, 15, -15, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative w-44 h-44 md:w-52 md:h-52 select-none filter drop-shadow-[0_15px_30px_rgba(16,185,129,0.35)]"
            >
              <img 
                src="/img/token_verde.png" 
                alt="Token VERDE" 
                className="w-full h-full object-contain pointer-events-none"
              />
            </motion.div>
          </div>

        </div>
      </div>

      {/* Visão do Ativo Section (Highly Premium full narrative presentation) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Text Content Column */}
        <div className="md:col-span-8 space-y-4 bg-card/20 backdrop-blur-xl border border-border p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500 animate-pulse" />
              Preservação Ambiental com Lastro On-Chain
            </h3>
            
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Cada emissão do <strong>VERDE</strong> está vinculada a ativos ambientais reais, auditáveis e georreferenciados, permitindo total transparência sobre sua origem, documentação e rastreabilidade. Por meio da blockchain Planet One, investidores, empresas e instituições podem acompanhar todas as informações do ativo em tempo real, desde a área protegida até sua evolução ao longo do ciclo de geração dos créditos de carbono.
            </p>
            
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              O <strong>VERDE</strong> foi projetado para transformar a preservação ambiental em um ativo digital acessível globalmente, conectando tecnologia blockchain, certificação ambiental e sustentabilidade em uma única infraestrutura. Seu objetivo é ampliar o financiamento de projetos de conservação, democratizar o acesso ao mercado de carbono e oferecer uma forma transparente de participar da economia ambiental.
            </p>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Como primeiro token do ecossistema Planet One, o <strong>VERDE</strong> estabelece as bases para uma nova geração de ativos ambientais tokenizados, impulsionando um mercado mais eficiente, auditável e global para a proteção dos recursos naturais.
            </p>
          </div>

          <div className="pt-4 border-t border-border/20 text-xs md:text-sm font-bold text-emerald-500 italic mt-2">
            "VERDE — Tokenizando a preservação. Conectando o futuro."
          </div>
        </div>

        {/* Areas / Certificate Registry Status Column */}
        <div className="md:col-span-4 bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/10 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-md">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              Garantia de Multi-Áreas
            </h4>
            <div className="space-y-3 text-xs">
              <p className="text-foreground leading-relaxed font-semibold">
                O ecossistema está preparado para hospedar e rastrear **múltiplas áreas de preservação ambiental**.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Embora o ecossistema suporte diversos polígonos no futuro, atualmente o token conta com uma primeira área principal georreferenciada, integrada por meio de mapa 3D interactivo e certificado digital auditável.
              </p>
            </div>
          </div>

          {/* Current active area badge */}
          <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Lote Ativo Inicial</span>
              <Badge className="bg-emerald-500/20 text-emerald-500 text-[9px] font-bold py-0.5 border-none">Rio Luna II</Badge>
            </div>
            <p className="text-xs font-bold text-foreground">Gleba Rio Luna II</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Beruri, Amazonas. Matrícula Cartorária Nº 598. Lastro inicial do ecossistema para paridade de solo.
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Live On-Chain Data & Legal Registry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* On-Chain Info */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-500" />
                  Dados On-Chain da Blockchain
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Informações extraídas diretamente em tempo real do livro-razão.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/15 text-[10px] font-mono">
                Ativo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-xs text-muted-foreground animate-pulse">Consultando dados do nó...</p>
              </div>
            ) : error || !asset ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 gap-2 bg-destructive/5 border border-destructive/10 rounded-xl">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-xs font-semibold text-foreground">Aviso de Rede</p>
                <p className="text-[11px] text-muted-foreground leading-normal max-w-xs">
                  O token VERDE está registrado na rede principal (Mainnet). Caso esteja visualizando em ambiente de testes ou o nó esteja sincronizando, estes dados serão atualizados em breve.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs md:text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Nome do Token</span>
                  <span className="font-semibold text-foreground">{asset.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Decimais</span>
                  <span className="font-semibold text-foreground">{asset.decimals}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Suprimento Total</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatNumber(asset.quantity / Math.pow(10, asset.decimals))} VERDE
                  </span>
                </div>
                <div className="flex flex-col py-2 border-b border-border/30 gap-1">
                  <span className="text-muted-foreground">ID do Asset (Waves/PLO)</span>
                  <span className="font-mono text-xs break-all bg-muted/30 p-1.5 rounded border border-border/50">
                    {asset.assetId}
                  </span>
                </div>
                {ethAssetId && (
                  <div className="flex flex-col py-2 border-b border-border/30 gap-1">
                    <span className="text-muted-foreground">ID do Asset (EVM / 0x)</span>
                    <span className="font-mono text-xs break-all bg-emerald-500/5 text-emerald-500 p-1.5 rounded border border-emerald-500/10">
                      {ethAssetId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Tipo de Reissão</span>
                  <Badge variant="outline" className={asset.reissuable ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}>
                    {asset.reissuable ? 'Reissível' : 'Escasso / Não-Reissível'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Emissor</span>
                  <Link to={`/address/${asset.issuer}`} className="font-mono text-xs text-emerald-500 hover:underline">
                    {shortenHash(asset.issuer, 8)}
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal Registry Info */}
        <Card className="border border-border bg-card/40 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-border/40">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-500" />
                Segurança Jurídica & Registro
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Resguardo documental e cartorário que garante a integridade do ativo.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 flex-1 text-xs md:text-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Localização Georreferenciada</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Lote Atual: Gleba Rio Luna II, Beruri, Amazonas. O protocolo está desenhado para expandir para múltiplos polígonos GPS georreferenciados adicionais de preservação.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <FileText className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Matrícula & Certificado</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Ofício de Registro de Imóveis (Matrícula Nº 598 para a área atual). Cada área integrada possui auditoria transparente vinculada ao ativo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <Compass className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Escassez Absoluta Proporcional</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    A quantidade emitida de tokens VERDE é rigorosamente correspondente à metragem real em m² de todas as áreas florestais integradas ao ecossistema.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/30">
              <Button variant="outline" className="w-full text-xs font-semibold gap-1.5 border-border hover:bg-muted/50 rounded-xl" asChild>
                <Link to="/carbon-map">
                  <Compass className="w-4 h-4 text-emerald-500" />
                  Explorar no VERDE MAPS (3D)
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Carbon Credits & Staking Simulator */}
      <Card className="border border-border bg-card/50 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                <Calculator className="w-5.5 h-5.5 text-emerald-500" />
                Simulador de Retorno de Carbono (Staking)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Calcule a estimativa de créditos de carbono gerados pelos seus tokens VERDE sob o contrato de staking de 10 anos.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg text-emerald-500 text-xs font-bold w-fit">
              <TrendingUp className="w-3.5 h-3.5" />
              1 VERDE = 1 m² / 10 Anos
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-8">
          
          {/* Inputs & Visual Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Quantidade de Tokens VERDE (m²)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={verdeAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      setVerdeAmount(val);
                    }}
                    placeholder="Ex: 1.000"
                    className="pl-4 pr-20 py-6 text-base font-mono font-bold rounded-xl border-border bg-background focus-visible:ring-emerald-500/50"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-bold text-muted-foreground bg-muted/40 px-3 rounded-r-xl border-l border-border/80">
                    VERDE / m²
                  </div>
                </div>
              </div>
 
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                  <Info className="w-4 h-4 shrink-0" />
                  Métrica de Referência de Mercado
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Calculado sob a taxa de absorção biológica estimada de <strong className="text-foreground font-semibold">0,75 kg CO₂ / m² / ano</strong> (equivalente a <strong className="text-foreground font-semibold">7,50 t CO₂ / ha / ano</strong>), em conformidade com as diretrizes regulatórias florestais.
                </p>
              </div>
            </div>

            {/* Simulated Results Indicators */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-2xl border border-border/60 bg-background/50 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Área Conservada</span>
                  <h3 className="text-2xl font-extrabold text-foreground mt-2">
                    {formatNumber(parsedVerde)} m²
                  </h3>
                </div>
                <div className="pt-4 mt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Equivalente a:</span>
                  <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 font-mono font-bold">
                    {equivalentHectares.toFixed(4)} ha
                  </Badge>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">Retorno Estimado em CC</span>
                  <h3 className="text-3xl font-black text-emerald-500 mt-2 font-mono">
                    {co2TonnesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} t
                  </h3>
                </div>
                <div className="pt-4 mt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs text-emerald-500 font-semibold">
                  <span>Toneladas de CO₂</span>
                  <span className="font-bold">10 Anos</span>
                </div>
              </div>

            </div>

          </div>

          {/* Environmental Impacts / Comparison Cards */}
          <div className="pt-6 border-t border-border/50">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 block">
              Impacto Ecológico da sua Conservação
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Trees className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Árvores Ativas Preservadas</p>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    ~ {treesEquivalents.toLocaleString()} árvores de grande porte
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Offset de Emissões de Automóvel</p>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    ~ {carKmEquivalents.toLocaleString()} km rodados neutralizados
                  </p>
                </div>
              </div>

            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
};

export default TokenPlanetPage;
