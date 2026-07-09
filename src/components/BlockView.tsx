import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchBlock, Block } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Terminal, Database, Send, FileCode } from "lucide-react";
import { toast } from "sonner";
import { getGCSApiUrl } from "@/lib/utils";
import BlockHeader from "./BlockHeader";
import BlockOverviewTab from "./BlockOverviewTab";
import BlockTransactionsTab from "./BlockTransactionsTab";

const BlockView = () => {
  const { height } = useParams();
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const loadBlock = async () => {
      if (height) {
        try {
          setLoading(true);
          let blockData: Block | null = null;
          
          const baseUrl = getGCSApiUrl();
          
          if (height === "latest") {
            const response = await fetch(`${baseUrl}/blocks/last`);
            if (!response.ok) throw new Error(`Failed to fetch latest block`);
            blockData = await response.json();
          } else {
            blockData = await fetchBlock(Number(height));
          }
          
          setBlock(blockData);
        } catch (error) {
          console.error("Error loading block:", error);
          toast.error("Erro ao obter dados do bloco on-chain.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadBlock();
  }, [height]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado para a área de transferência!");
    
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const getBlockSize = (block: Block) => {
    return block.blockSize || block.size || (block as any).blocksize || 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3 rounded-xl bg-muted/50" />
        <Skeleton className="h-28 w-full rounded-2xl bg-muted/40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-44 rounded-xl bg-muted/30" />
          <Skeleton className="h-44 rounded-xl bg-muted/30" />
          <Skeleton className="h-44 rounded-xl bg-muted/30" />
        </div>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="p-8 text-center border border-dashed border-border/80 rounded-3xl bg-background/20 max-w-xl mx-auto space-y-3.5">
        <Terminal className="w-10 h-10 text-rose-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-foreground">Bloco Não Encontrado</h3>
        <p className="text-xs text-muted-foreground leading-normal">
          O bloco de altura <strong className="text-foreground font-mono">#{height}</strong> não pôde ser localizado na rede atual ou ainda não foi emitido pelos validadores.
        </p>
      </div>
    );
  }

  const blockSize = getBlockSize(block);
  const txCount = block.transactions?.length || 0;

  return (
    <div className="space-y-6">
      
      {/* Block General Header component */}
      <BlockHeader block={block} />

      {/* Tabs navigation & content container */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        
        {/* Tabs Headers */}
        <div className="border-b border-border/50 mb-6">
          <TabsList className="w-full h-auto p-0 bg-transparent flex justify-start gap-2">
            <TabsTrigger 
              value="overview" 
              className="py-3 px-5 text-xs md:text-sm font-semibold text-muted-foreground data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-emerald-500 transition-all duration-150 flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              Geral (Overview)
            </TabsTrigger>
            
            <TabsTrigger 
              value="transactions" 
              className="py-3 px-5 text-xs md:text-sm font-semibold text-muted-foreground data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-emerald-500 transition-all duration-150 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Transações (Ledger)
              <Badge variant="secondary" className="ml-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] px-1.5 h-4.5 font-bold font-mono">
                {txCount}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="json" 
              className="py-3 px-5 text-xs md:text-sm font-semibold text-muted-foreground data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-emerald-500 transition-all duration-150 flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              Dados JSON
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-0 focus-visible:ring-0">
          <BlockOverviewTab 
            block={block}
            blockSize={blockSize}
            copiedField={copiedField}
            copyToClipboard={copyToClipboard}
          />
        </TabsContent>

        {/* Tab 2: Transactions */}
        <TabsContent value="transactions" className="mt-0 focus-visible:ring-0">
          <BlockTransactionsTab 
            block={block}
            copiedField={copiedField}
            copyToClipboard={copyToClipboard}
          />
        </TabsContent>

        {/* Tab 3: raw JSON details */}
        <TabsContent value="json" className="mt-0 focus-visible:ring-0">
          <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-5 border-b border-border/30">
              <div>
                <h3 className="text-base font-bold text-foreground">Estrutura de Bloco Nativa</h3>
                <p className="text-xs text-muted-foreground">Payload brutos das propriedades retornadas pelo nó validador.</p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(block, null, 2), "block-json")}
                className="flex items-center gap-1.5 text-xs w-full sm:w-auto font-semibold border-border hover:bg-muted/50 rounded-xl"
              >
                {copiedField === "block-json" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                Copiar JSON
              </Button>
            </div>
            
            <div className="bg-background/40 p-4 md:p-5 overflow-x-auto max-h-[500px]">
              <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(block, null, 2)}
              </pre>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default BlockView;
