import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { Transaction, getTransactionTypeName, fetchAssetDetails } from '@/services/api';
import { formatTimeAgo } from '@/utils/formatter';
import { Skeleton } from '@/components/ui/skeleton';
import { getGCSApiUrl, getCoinName } from '@/lib/utils';
import { toast } from 'sonner';

interface PendingTransactionListProps {
  limit?: number;
}

interface AssetInfo {
  decimals: number;
  name: string;
}

const PendingTransactionList: React.FC<PendingTransactionListProps> = ({ limit = 10 }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assetMap, setAssetMap] = useState<Record<string, AssetInfo>>({});

  const fetchPendingTransactions = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const apiUrl = getGCSApiUrl();
      // Waves node endpoint for raw unconfirmed transactions
      const endpoint = `${apiUrl}/transactions/unconfirmed`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending transactions');
      }
      
      const data = await response.json();
      let pendingList: Transaction[] = [];
      
      if (Array.isArray(data)) {
        pendingList = data.slice(0, limit);
      } else if (data && typeof data === 'object') {
        // Handle alternative wrapper object
        if (Array.isArray(data.transactions)) {
          pendingList = data.transactions.slice(0, limit);
        } else if (Array.isArray(data.items)) {
          pendingList = data.items.slice(0, limit);
        }
      }
      
      setTransactions(pendingList);

      // Load asset details for metadata
      const uniqueAssetIds = Array.from(new Set(
        pendingList
          .flatMap(tx => {
            const ids = [tx.assetId, tx.feeAsset];
            if (tx.type === 3) {
              ids.push(tx.assetId || tx.id);
            }
            if (tx.type === 7 && tx.order1?.assetPair) {
              if (tx.order1.assetPair.amountAsset) ids.push(tx.order1.assetPair.amountAsset);
              if (tx.order1.assetPair.priceAsset) ids.push(tx.order1.assetPair.priceAsset);
            }
            return ids;
          })
          .filter((id): id is string => !!id)
      ));

      const map: Record<string, AssetInfo> = {};
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
          map[id] = { decimals: 8, name: id.substring(0, 6).toUpperCase() };
        }
      }));

      setAssetMap(map);
    } catch (error) {
      console.error("Error fetching unconfirmed transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingTransactions();
    // Auto refresh every 10 seconds for ultra-responsive mempool
    const interval = setInterval(() => fetchPendingTransactions(true), 10000);
    return () => clearInterval(interval);
  }, [limit]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="glass-card border-dashed border-primary/20 dark:border-primary/10">
        <CardContent className="p-10 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 animate-pulse">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold font-mono text-card-foreground">Mempool Vazio</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto">
              Nenhuma transação pendente. A rede está 100% sincronizada e processando as transações instantaneamente!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const getAssetDecimals = (id: string | null | undefined, fallback = 8) => {
          if (!id) return fallback;
          return assetMap[id]?.decimals ?? fallback;
        };

        const getAssetSymbol = (id: string | null | undefined, fallback = getCoinName()) => {
          if (!id) return fallback;
          return assetMap[id]?.name ?? id.substring(0, 4).toUpperCase();
        };

        // Resolve amount decimals & symbol & value
        let amountAssetId = tx.assetId;
        let amountDecimals = getAssetDecimals(amountAssetId, 8);
        let amountSymbol = getAssetSymbol(amountAssetId, getCoinName());
        let displayAmount = tx.amount;

        if (tx.type === 3) { // Issue
          const assetId = tx.assetId || tx.id;
          amountDecimals = getAssetDecimals(assetId, 8);
          amountSymbol = getAssetSymbol(assetId, tx.name || 'Token');
          displayAmount = tx.quantity;
        } else if (tx.type === 7) { // Exchange
          amountAssetId = tx.order1?.assetPair?.amountAsset;
          amountDecimals = getAssetDecimals(amountAssetId, 8);
          amountSymbol = getAssetSymbol(amountAssetId, amountAssetId ? amountAssetId.substring(0, 6).toUpperCase() : 'Token');
          displayAmount = tx.amount;
        }

        const feeAssetId = tx.feeAsset;
        const feeDecimals = getAssetDecimals(feeAssetId, 8);
        const feeSymbol = getAssetSymbol(feeAssetId, getCoinName());

        return (
          <Card key={tx.id} className="glass-card hover:bg-muted/50 transition-colors border-amber-500/10 dark:border-amber-500/15 hover:border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono">
                      {getTransactionTypeName(tx.type)}
                    </Badge>
                    <span className="text-[10px] text-amber-500 flex items-center gap-1 font-mono">
                      <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping"></span>
                      Pendente ({tx.timestamp ? formatTimeAgo(tx.timestamp) : 'agora'})
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">ID:</span>
                      <Link 
                        to={`/tx/${tx.id}`}
                        className="text-xs text-primary hover:underline truncate font-mono"
                      >
                        {tx.id.slice(0, 10)}...{tx.id.slice(-6)}
                      </Link>
                    </div>

                    {tx.type === 7 && tx.order1 && tx.order2 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">Comprador:</span>
                          <Link 
                            to={`/address/${tx.order1.orderType === 'buy' ? tx.order1.sender : tx.order2.sender}`}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline truncate font-mono font-medium"
                          >
                            {tx.order1.orderType === 'buy' ? `${tx.order1.sender.slice(0, 8)}...${tx.order1.sender.slice(-6)}` : `${tx.order2.sender.slice(0, 8)}...${tx.order2.sender.slice(-6)}`}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">Vendedor:</span>
                          <Link 
                            to={`/address/${tx.order1.orderType === 'sell' ? tx.order1.sender : tx.order2.sender}`}
                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline truncate font-mono font-medium"
                          >
                            {tx.order1.orderType === 'sell' ? `${tx.order1.sender.slice(0, 8)}...${tx.order1.sender.slice(-6)}` : `${tx.order2.sender.slice(0, 8)}...${tx.order2.sender.slice(-6)}`}
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">From:</span>
                          <Link 
                            to={`/address/${tx.sender}`}
                            className="text-xs text-primary hover:underline truncate font-mono"
                          >
                            {`${tx.sender.slice(0, 6)}...${tx.sender.slice(-4)}`}
                          </Link>
                        </div>
                        {tx.recipient && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">To:</span>
                            <Link 
                              to={`/address/${tx.recipient}`}
                              className="text-xs text-primary hover:underline truncate font-mono"
                            >
                              {`${tx.recipient.slice(0, 6)}...${tx.recipient.slice(-4)}`}
                            </Link>
                          </div>
                        )}
                      </>
                    )}

                    {tx.type === 3 && (
                      <div className="text-[11px] text-muted-foreground italic font-normal mt-1 bg-emerald-500/5 p-1.5 rounded-lg border border-emerald-500/10 max-w-md">
                        Criação do token <strong className="text-foreground">{tx.name}</strong>: {tx.description || "Nenhuma descrição fornecida."}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {displayAmount !== undefined && (
                    <div className="text-xs font-semibold font-mono">
                      {(displayAmount / Math.pow(10, amountDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                      <span className="text-primary font-bold text-[10px] uppercase">{amountSymbol}</span>
                    </div>
                  )}
                  {tx.type === 7 && tx.price !== undefined && (
                    <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                      Preço: {(tx.price / Math.pow(10, 8 + (tx.order1?.assetPair?.priceAsset ? (assetMap[tx.order1.assetPair.priceAsset]?.decimals ?? 8) : 8) - amountDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                      <span className="text-[9px] uppercase font-bold">PLO</span>
                    </div>
                  )}
                  {tx.fee !== undefined && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Fee: {(tx.fee / Math.pow(10, feeDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                      <span className="text-primary text-[9px] uppercase font-bold">{feeSymbol}</span>
                    </div>
                  )}
                  <Link 
                    to={`/tx/${tx.id}`}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PendingTransactionList;
