import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy, Check, ArrowRight, Coins, Code, Bookmark, Database, Send, Layers } from "lucide-react";
import { Block, fetchAssetDetails } from "@/services/api";
import { getCoinName } from "@/lib/utils";
import { shortenHash } from "@/utils/formatter";

interface BlockTransactionsTabProps {
  block: Block;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
}

interface AssetInfo {
  decimals: number;
  name: string;
}

const BlockTransactionsTab = ({ block, copiedField, copyToClipboard }: BlockTransactionsTabProps) => {
  const [assetMap, setAssetMap] = useState<Record<string, AssetInfo>>({});
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Load asset metadata dynamically for all transactions inside the block
  useEffect(() => {
    const loadAssets = async () => {
      if (!block.transactions || block.transactions.length === 0) return;
      
      setLoadingAssets(true);
      
      // Collect unique asset IDs
      const uniqueAssetIds = Array.from(new Set(
        block.transactions
          .flatMap(tx => [tx.assetId, tx.feeAsset])
          .filter((id): id is string => !!id)
      ));
      
      const map: Record<string, AssetInfo> = {};
      
      try {
        await Promise.all(uniqueAssetIds.map(async (id) => {
          try {
            const details = await fetchAssetDetails(id);
            if (details) {
              map[id] = {
                decimals: details.decimals ?? 8,
                name: details.name || id.substring(0, 6).toUpperCase()
              };
            } else {
              map[id] = { decimals: 8, name: id.substring(0, 6).toUpperCase() };
            }
          } catch (err) {
            console.warn(`Error resolving asset details for ${id}:`, err);
            map[id] = { decimals: 8, name: id.substring(0, 6).toUpperCase() };
          }
        }));
      } catch (error) {
        console.error("Failed to load block assets metadata:", error);
      } finally {
        setAssetMap(map);
        setLoadingAssets(false);
      }
    };
    
    loadAssets();
  }, [block.transactions]);
  
  // Helper to resolve a user-friendly transaction type name and icon
  const getTxTypeDetails = (type: number) => {
    switch (type) {
      case 2:
        return { name: "Criação de Conta", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Database };
      case 4:
        return { name: "Transferência", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: Send };
      case 8:
        return { name: "Lease (Arrendar)", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: Bookmark };
      case 9:
        return { name: "Cancelar Lease", color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: Bookmark };
      case 11:
        return { name: "Mass Transfer", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Layers };
      case 16:
        return { name: "Invocação de Smart Contract", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Code };
      default:
        return { name: `Tipo ${type}`, color: "bg-muted text-muted-foreground border-border", icon: Coins };
    }
  };

  return (
    <div className="space-y-4">
      {!block.transactions || block.transactions.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-background/20 p-8 text-center">
          <p className="text-muted-foreground text-sm">Nenhuma transação registrada neste bloco.</p>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {block.transactions.map((tx) => {
            const typeDetails = getTxTypeDetails(tx.type);
            const TypeIcon = typeDetails.icon;
            
            // Resolve amount decimals & name
            const amountAssetId = tx.assetId;
            const amountDecimals = amountAssetId ? (assetMap[amountAssetId]?.decimals ?? 8) : 8;
            const amountSymbol = amountAssetId ? (assetMap[amountAssetId]?.name ?? amountAssetId.substring(0, 4).toUpperCase()) : getCoinName();
            
            // Resolve fee decimals & name
            const feeAssetId = tx.feeAsset;
            const feeDecimals = feeAssetId ? (assetMap[feeAssetId]?.decimals ?? 8) : 8;
            const feeSymbol = feeAssetId ? (assetMap[feeAssetId]?.name ?? feeAssetId.substring(0, 4).toUpperCase()) : getCoinName();

            return (
              <div 
                key={tx.id} 
                className="p-4 md:p-5 rounded-xl border border-border/60 bg-card/30 backdrop-blur-xl hover:bg-emerald-500/5 hover:border-emerald-500/10 transition-all duration-200 shadow-sm space-y-4"
              >
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/20">
                  <div className="flex items-center gap-2 max-w-full overflow-hidden">
                    <div className={`p-2 rounded-lg shrink-0 ${typeDetails.color}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link 
                        to={`/tx/${tx.id}`} 
                        className="font-mono text-xs md:text-sm text-emerald-500 hover:text-emerald-600 font-bold truncate break-all hover:underline"
                      >
                        {tx.id}
                      </Link>
                      <button
                        onClick={() => copyToClipboard(tx.id, `tx-${tx.id}`)}
                        className="p-1 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded transition-colors shrink-0"
                        title="Copiar Hash"
                      >
                        {copiedField === `tx-${tx.id}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className={`font-bold shrink-0 self-start sm:self-auto text-xs py-0.5 px-2.5 ${typeDetails.color}`}>
                    {typeDetails.name}
                  </Badge>
                </div>

                {/* Ledger Addresses Transfer Flow */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center text-xs md:text-sm">
                  
                  {/* Sender */}
                  <div className="md:col-span-5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Origem (Sender)</span>
                    <div className="flex items-center gap-1.5 max-w-full overflow-hidden">
                      <Link 
                        to={`/address/${tx.sender || '3LDqeVbNxAyg1pmyQBARW853LBxaFmjumcy'}`} 
                        className="font-mono font-semibold text-foreground hover:text-emerald-500 hover:underline truncate"
                      >
                        {!tx.sender || tx.sender === "" || tx.id === '5b41TrGD55vcfNc489rbdcKDnh5stoLY1UB1xFRde2JnKmZpHnU49nvi6k4j9u8ivR9hoaNPqQiARy7XVtEYt5zr' ? "Satoshi Nakamoto 👑" : tx.sender}
                      </Link>
                      <button
                        onClick={() => copyToClipboard(tx.sender || '3LDqeVbNxAyg1pmyQBARW853LBxaFmjumcy', `sender-${tx.id}`)}
                        className="p-1 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded transition-colors shrink-0"
                        title="Copiar Origem"
                      >
                        {copiedField === `sender-${tx.id}` ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="md:col-span-2 flex md:justify-center shrink-0">
                    {tx.recipient ? (
                      <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                      </div>
                    ) : (
                      <div className="h-px bg-border/40 w-full hidden md:block" />
                    )}
                  </div>

                  {/* Recipient */}
                  <div className="md:col-span-5 flex flex-col gap-1">
                    {tx.recipient ? (
                      <>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Destino (Recipient)</span>
                        <div className="flex items-center gap-1.5 max-w-full overflow-hidden">
                          <Link 
                            to={`/address/${tx.recipient}`} 
                            className="font-mono font-semibold text-foreground hover:text-emerald-500 hover:underline truncate"
                          >
                            {tx.recipient}
                          </Link>
                          <button
                            onClick={() => copyToClipboard(tx.recipient, `recipient-${tx.id}`)}
                            className="p-1 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded transition-colors shrink-0"
                            title="Copiar Destino"
                          >
                            {copiedField === `recipient-${tx.id}` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ação</span>
                        <span className="text-muted-foreground italic font-semibold">Execução Interna de Protocolo</span>
                      </>
                    )}
                  </div>

                </div>

                {/* Amount and Fee footer line */}
                <div className="pt-3 border-t border-border/20 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-semibold">Fee:</span>
                    <span className="font-mono text-foreground font-bold">
                      {tx.fee ? (tx.fee / Math.pow(10, feeDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : '0,00'}{" "}
                      <span className="text-emerald-500 text-[10px] font-bold">{feeSymbol}</span>
                    </span>
                  </div>

                  {tx.amount !== undefined && (
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 px-3 font-semibold">
                      <Coins className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold">
                        {(tx.amount / Math.pow(10, amountDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                        <span className="text-[10px] font-bold uppercase">{amountSymbol}</span>
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlockTransactionsTab;
