import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDownUp, 
  Copy, 
  ArrowRight, 
  Check, 
  Cpu, 
  HelpCircle, 
  Database, 
  Wallet, 
  Key, 
  Activity, 
  Info, 
  Shuffle, 
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { getNodeUrl, getEthNodeUrl, getChainId, getChainIdLetter, getCoinName, getExplorerUrl, isTestnet } from "@/lib/utils";
import { wavesAsset2Eth, ethTxId2waves, wavesAddress2eth, ethAddress2waves } from '@better2better/waves-node-api-js';
import { toast } from 'sonner';

const ConverterPage = () => {
  const [activeTab, setActiveTab] = useState('addresses');
  
  // Addresses Tab States
  const [wavesAddressInput, setWavesAddressInput] = useState('');
  const [ethAddressInput, setEthAddressInput] = useState('');
  const [wavesAddressResult, setWavesAddressResult] = useState('');
  const [ethAddressResult, setEthAddressResult] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Tokens Tab States
  const [tokenInput, setTokenInput] = useState('');
  const [tokenOutput, setTokenOutput] = useState('');

  // Transactions Tab States
  const [ethTxInput, setEthTxInput] = useState('');
  const [wavesTxOutput, setWavesTxOutput] = useState('');

  const isTest = isTestnet();

  // Examples for interactive trial
  const sampleWavesAddress = isTest 
    ? '3MyzZepgQY6h99K58J2rQpY5oA8L4f3D4pB' 
    : '3P6D2sUshXn8XUscR4T2M9i2kUo9tG7e3pB';
  const sampleEthAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d1476B';
  const sampleTokenId = 'FSHorS47QpM57y6oAr839N41L4eW37uR6';
  const sampleEthTx = '0x4f0f9bda32f6a70a8d6e3c5a6b0c20a9829e1e2d3c4b5a6f7e8d9c0b1a2f3e4d';

  const handleCopy = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${type} copiado para a área de transferência!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Convert W2E Address
  const handleWavesAddressConvert = async () => {
    if (!wavesAddressInput) {
      toast.error(`Por favor, insira um endereço ${getCoinName()} válido.`);
      return;
    }
    try {
      const ethAddr = wavesAddress2eth(wavesAddressInput);
      setEthAddressResult(ethAddr);
      toast.success("Conversão de endereço concluída com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error(`Formato de endereço ${getCoinName()} inválido.`);
      setEthAddressResult('');
    }
  };

  // Convert E2W Address
  const handleEthAddressConvert = async () => {
    if (!ethAddressInput) {
      toast.error("Por favor, insira um endereço Ethereum (0x) válido.");
      return;
    }
    try {
      const wavesAddr = ethAddress2waves(ethAddressInput, getChainId());
      setWavesAddressResult(wavesAddr);
      toast.success("Conversão de endereço concluída com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Formato de endereço Ethereum inválido.");
      setWavesAddressResult('');
    }
  };

  // Convert Waves Token/Asset to ETH
  const handleTokenConvert = async () => {
    if (!tokenInput) {
      toast.error("Por favor, insira o ID do Token para conversão.");
      return;
    }
    try {
      const ethToken = await wavesAsset2Eth(tokenInput);
      setTokenOutput(ethToken);
      toast.success("Token convertido com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Formato de ID de Token inválido.");
      setTokenOutput('');
    }
  };

  // Convert Eth Tx Hash to Waves Tx
  const handleTxConvert = async () => {
    if (!ethTxInput) {
      toast.error("Por favor, insira a Hash de Transação ETH (0x).");
      return;
    }
    try {
      const wavesTx = ethTxId2waves(ethTxInput);
      setWavesTxOutput(wavesTx);
      toast.success("Hash de transação convertida com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Formato de hash de transação Ethereum inválido.");
      setWavesTxOutput('');
    }
  };

  // Metamask integration (wallet_addEthereumChain)
  const handleAddToMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x' + getChainId().toString(16), // hex chain ID
            chainName: `Planet One ${isTest ? 'Testnet' : 'Mainnet'}`,
            nativeCurrency: {
              name: 'Planet One',
              symbol: getCoinName(), // PLO
              decimals: 18
            },
            rpcUrls: [getEthNodeUrl()],
            blockExplorerUrls: [getExplorerUrl()]
          }]
        });
        toast.success("Rede Planet One adicionada ao MetaMask com sucesso!");
      } catch (error: any) {
        console.error("Error adding to MetaMask:", error);
        toast.error("Falha ao adicionar rede ao MetaMask: " + error.message);
      }
    } else {
      toast.error("MetaMask não detectado. Por favor, instale a extensão do MetaMask.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-6 pb-20 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              Tradutor de Criptografia & Redes
            </h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1 py-0.5 px-2.5 rounded-full font-bold text-[10px]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              EVM Dual-Addressing
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Consulte a correspondência de endereços, IDs de tokens e hashes de transações entre a infraestrutura nativa do Planet One e sua representação no ecossistema Ethereum (EVM).
          </p>
        </div>
      </div>

      {/* Ethereum compatibility explanation banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border/50 bg-card/25 backdrop-blur-sm p-5 flex items-start gap-4 hover:border-emerald-500/10 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Mesma Chave Privada</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O modelo de compatibilidade garante que uma única frase semente controle sua conta nativa e sua versão EVM de forma integrada.
            </p>
          </div>
        </Card>

        <Card className="border border-border/50 bg-card/25 backdrop-blur-sm p-5 flex items-start gap-4 hover:border-emerald-500/10 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Uso de MetaMask</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Adicione a rede RPC no MetaMask e utilize qualquer dApp EVM do ecossistema Planet One com taxas baixas e confirmação imediata.
            </p>
          </div>
        </Card>

        <Card className="border border-border/50 bg-card/25 backdrop-blur-sm p-5 flex items-start gap-4 hover:border-emerald-500/10 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <Shuffle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Payload Equivalente</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hashes de transação EVM de 32 bytes são traduzidas matematicamente para as assinaturas Base58 de transação nativa da rede.
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs list with icons */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1 border border-border/60 rounded-xl overflow-x-auto w-full md:grid md:grid-cols-3">
          <TabsTrigger value="addresses" className="flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-semibold text-xs md:text-sm">
            <Wallet className="w-3.5 h-3.5" /> Endereços (Contas)
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-semibold text-xs md:text-sm">
            <Database className="w-3.5 h-3.5" /> Identificadores de Token
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-semibold text-xs md:text-sm">
            <Activity className="w-3.5 h-3.5" /> Transações (Hashes)
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Address Converter */}
        <TabsContent value="addresses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Convert Native to EVM */}
            <Card className="border border-border bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:border-emerald-500/10 transition-all duration-300">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    Nativo &rarr; EVM (Ethereum)
                  </span>
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    onClick={() => setWavesAddressInput(sampleWavesAddress)}
                    className="text-[10px] text-emerald-500 hover:text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded"
                  >
                    Carregar Exemplo
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Traduza um endereço nativo {getCoinName()} (começa com 3) para seu hexadecimal EVM correspondente.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Endereço Nativo PLO</label>
                  <div className="flex gap-2">
                    <Input
                      value={wavesAddressInput}
                      onChange={(e) => setWavesAddressInput(e.target.value)}
                      placeholder={`Cole o endereço nativo (Ex: 3P...)`}
                      className="font-mono text-xs bg-background/50 border-border focus-visible:ring-emerald-500/50 py-5"
                    />
                    <Button onClick={handleWavesAddressConvert} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs px-4">
                      Traduzir
                    </Button>
                  </div>
                </div>

                {ethAddressResult && (
                  <div className="mt-4 p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 space-y-2 animate-fade-in">
                    <span className="text-xs font-bold text-emerald-500 block">Endereço Equivalente no Ethereum / MetaMask</span>
                    <div className="flex items-center justify-between gap-2 bg-background p-2.5 rounded-lg border border-border">
                      <code className="font-mono text-xs text-foreground break-all select-all">{ethAddressResult}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 shrink-0 hover:bg-muted" 
                        onClick={() => handleCopy(ethAddressResult, 'Endereço ETH')}
                      >
                        {copiedText === ethAddressResult ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Convert EVM to Native */}
            <Card className="border border-border bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:border-emerald-500/10 transition-all duration-300">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    EVM (Ethereum) &rarr; Nativo
                  </span>
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    onClick={() => setEthAddressInput(sampleEthAddress)}
                    className="text-[10px] text-emerald-500 hover:text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded"
                  >
                    Carregar Exemplo
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Traduza um endereço hexadecimal Ethereum (começa com 0x) para seu formato nativo {getCoinName()}.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Endereço EVM (Hexadecimal)</label>
                  <div className="flex gap-2">
                    <Input
                      value={ethAddressInput}
                      onChange={(e) => setEthAddressInput(e.target.value)}
                      placeholder={`Cole o endereço hexadecimal (Ex: 0x...)`}
                      className="font-mono text-xs bg-background/50 border-border focus-visible:ring-emerald-500/50 py-5"
                    />
                    <Button onClick={handleEthAddressConvert} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs px-4">
                      Traduzir
                    </Button>
                  </div>
                </div>

                {wavesAddressResult && (
                  <div className="mt-4 p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 space-y-2 animate-fade-in">
                    <span className="text-xs font-bold text-emerald-500 block">Endereço Equivalente no Planet One SDK / Ledger</span>
                    <div className="flex items-center justify-between gap-2 bg-background p-2.5 rounded-lg border border-border">
                      <code className="font-mono text-xs text-foreground break-all select-all">{wavesAddressResult}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 shrink-0 hover:bg-muted" 
                        onClick={() => handleCopy(wavesAddressResult, `Endereço ${getCoinName()}`)}
                      >
                        {copiedText === wavesAddressResult ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Tab 2: Token IDs */}
        <TabsContent value="tokens">
          <Card className="border border-border bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg max-w-2xl mx-auto">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Database className="w-4 h-4 text-emerald-500" />
                  Identificador de Ativo Nativo &rarr; Token ERC-20 EVM
                </span>
                <Button 
                  variant="ghost" 
                  size="xs" 
                  onClick={() => setTokenInput(sampleTokenId)}
                  className="text-[10px] text-emerald-500 hover:text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded"
                >
                  Carregar Exemplo
                </Button>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Descubra o contrato equivalente Ethereum de um ativo criado na engine nativa do Planet One.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">ID do Ativo Nativo (Base58)</label>
                <div className="flex gap-2">
                  <Input
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Ex: ID do ativo VERDE, PLO, etc."
                    className="font-mono text-xs bg-background/50 border-border focus-visible:ring-emerald-500/50 py-5"
                  />
                  <Button onClick={handleTokenConvert} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs px-4">
                    Traduzir
                  </Button>
                </div>
              </div>

              {tokenOutput && (
                <div className="mt-4 p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 space-y-2 animate-fade-in">
                  <span className="text-xs font-bold text-emerald-500 block">Endereço ERC-20 Equivalente na EVM</span>
                  <div className="flex items-center justify-between gap-2 bg-background p-2.5 rounded-lg border border-border">
                    <code className="font-mono text-xs text-foreground break-all select-all">{tokenOutput}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0 hover:bg-muted" 
                      onClick={() => handleCopy(tokenOutput, 'Endereço ERC-20')}
                    >
                      {copiedText === tokenOutput ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Transactions Converter */}
        <TabsContent value="transactions">
          <Card className="border border-border bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg max-w-2xl mx-auto">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Hash de Transação EVM &rarr; ID de Transação Nativa
                </span>
                <Button 
                  variant="ghost" 
                  size="xs" 
                  onClick={() => setEthTxInput(sampleEthTx)}
                  className="text-[10px] text-emerald-500 hover:text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded"
                >
                  Carregar Exemplo
                </Button>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Traduza uma hash de transação EVM originada pelo MetaMask (0x) para localizar o respectivo evento no ledger Base58 do Planet One.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Hash de Transação EVM (Hexadecimal)</label>
                <div className="flex gap-2">
                  <Input
                    value={ethTxInput}
                    onChange={(e) => setEthTxInput(e.target.value)}
                    placeholder="Cole a hash da transação EVM (0x...)"
                    className="font-mono text-xs bg-background/50 border-border focus-visible:ring-emerald-500/50 py-5"
                  />
                  <Button onClick={handleTxConvert} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs px-4">
                    Traduzir
                  </Button>
                </div>
              </div>

              {wavesTxOutput && (
                <div className="mt-4 p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 space-y-2 animate-fade-in">
                  <span className="text-xs font-bold text-emerald-500 block">ID de Transação Nativa Planet One</span>
                  <div className="flex items-center justify-between gap-2 bg-background p-2.5 rounded-lg border border-border">
                    <code className="font-mono text-xs text-foreground break-all select-all">{wavesTxOutput}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0 hover:bg-muted" 
                      onClick={() => handleCopy(wavesTxOutput, 'ID de Transação')}
                    >
                      {copiedText === wavesTxOutput ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Network Configuration card with MetaMask quick connect */}
      <Card className="border border-border bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
        <CardHeader className="pb-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              Parâmetros Técnicos para Carteiras Compatíveis (RPC)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Utilize as configurações abaixo para parear e integrar a rede Planet One no MetaMask, Rabby ou similares.
            </CardDescription>
          </div>
          
          {/* Quick MetaMask button */}
          <Button 
            onClick={handleAddToMetaMask}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-4 rounded-xl gap-1.5 self-start sm:self-center shrink-0 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Adicionar Rede ao MetaMask
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* RPC 1 */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">URL do Nó Nativo (Planet One)</span>
              <div className="flex items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-xl border border-border">
                <code className="font-mono text-xs text-foreground truncate select-all">{getNodeUrl()}</code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-muted" 
                  onClick={() => handleCopy(getNodeUrl(), 'URL do Nó Nativo')}
                >
                  {copiedText === getNodeUrl() ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {/* RPC 2 */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">URL do Provedor RPC EVM (Ethereum)</span>
              <div className="flex items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-xl border border-border">
                <code className="font-mono text-xs text-foreground truncate select-all">{getEthNodeUrl()}</code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-muted" 
                  onClick={() => handleCopy(getEthNodeUrl(), 'URL RPC EVM')}
                >
                  {copiedText === getEthNodeUrl() ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Chain ID (EVM)</span>
                <code className="bg-muted/40 p-2.5 rounded-xl border border-border block text-xs font-bold font-mono text-foreground">
                  {getChainId()} (0x{getChainId().toString(16)})
                </code>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Identificador de Rede SDK</span>
                <code className="bg-muted/40 p-2.5 rounded-xl border border-border block text-xs font-bold font-mono text-foreground">
                  {getChainIdLetter()} ({isTest ? 'Testnet' : 'Mainnet'})
                </code>
              </div>
            </div>

            {/* Explorer URL */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Explorador de Blocos de Referência</span>
              <div className="flex items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-xl border border-border">
                <code className="font-mono text-xs text-foreground truncate select-all">{getExplorerUrl()}</code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-muted" 
                  onClick={() => handleCopy(getExplorerUrl(), 'URL do Explorer')}
                >
                  {copiedText === getExplorerUrl() ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </Button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Educational accordion / guide */}
      <Card className="border border-border bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <HelpCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Como Funciona a Compatibilidade de Máquina Virtual?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A blockchain Planet One foi desenvolvida sob medida para herdar o poder do ecossistema de Contratos Inteligentes da Ethereum Virtual Machine (EVM) ao mesmo tempo que mantém a segurança escalável e carbono-zero de seu núcleo nativo.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2 p-4 rounded-xl border border-border/60 bg-background/50">
                <p className="font-bold text-emerald-500">Mapeamento Geométrico de Contas</p>
                <p className="text-muted-foreground leading-relaxed">
                  Ao assinar transações com o MetaMask ou Rabby, a rede processa os cabeçalhos de transação em formato EVM padrão, convertendo-os internamente para o livro-razão nativo. Isso resulta em taxas que custam frações de centavos de PLO, ao contrário de redes Ethereum congestionadas.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl border border-border/60 bg-background/50">
                <p className="font-bold text-emerald-500">Suporte a Contratos Inteligentes e dApps</p>
                <p className="text-muted-foreground leading-relaxed">
                  Qualquer ferramenta familiar do desenvolvedor Web3 &mdash; como Hardhat, Foundry, ethers.js e blocos de liquidez &mdash; opera de forma imediata simplesmente alterando a rota do RPC padrão para o endpoint oficial do Planet One.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default ConverterPage;
