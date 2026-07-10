import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Transaction, getTransactionTypeName, fetchLatestBlocks, fetchAssetDetails } from '@/services/api';
import { formatDate, formatTimeAgo } from '@/utils/formatter';
import { Skeleton } from '@/components/ui/skeleton';
import { getGCSApiUrl, getCoinName, getFullExplorerApiUrl } from '@/lib/utils';
import { toast } from 'sonner';

interface TransactionListProps {
  limit?: number;
  address?: string;
}

interface AssetInfo {
  decimals: number;
  name: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ limit = 10, address }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assetMap, setAssetMap] = useState<Record<string, AssetInfo>>({});

  useEffect(() => {
    const fetchTransactionsAndAssets = async () => {
      setIsLoading(true);
      try {
        const apiUrl = getGCSApiUrl();
        let transactionData: Transaction[] = [];
        
        if (address) {
          const endpoint = `${apiUrl}/transactions/address/${address}/limit/${limit}`;
          console.log("Fetching transactions from:", endpoint);
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }
          
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            transactionData = data[0].slice(0, limit);
          } else if (Array.isArray(data)) {
            transactionData = data.slice(0, limit);
          }
        } else {
          console.log("Fetching transactions from FullExplorer API...");
          const baseUrl = getFullExplorerApiUrl();
          const response = await fetch(`${baseUrl}/transactions`);
          if (!response.ok) {
            throw new Error('Failed to fetch transactions from FullExplorer');
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            transactionData = data.slice(0, limit);
          }
        }
        
        setTransactions(transactionData);

        const uniqueAssetIds = Array.from(new Set(
          transactionData
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
            console.warn(`Error resolving asset ${id}:`, err);
            map[id] = { decimals: 8, name: id.substring(0, 6).toUpperCase() };
          }
        }));

        setAssetMap(map);
      } catch (error) {
        console.error("Error fetching transactions and asset metadata:", error);
        toast.error("Failed to fetch transactions");
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionsAndAssets();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchTransactionsAndAssets, 30000);
    return () => clearInterval(interval);
  }, [limit, address]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: limit }).map((_, i) => (
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
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No transactions found</p>
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

        // Resolve fee decimals & symbol
        const feeAssetId = tx.feeAsset;
        const feeDecimals = getAssetDecimals(feeAssetId, 8);
        const feeSymbol = getAssetSymbol(feeAssetId, getCoinName());

        return (
          <Card key={tx.id} className="glass-card hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getTransactionTypeName(tx.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(tx.timestamp)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">ID:</span>
                      <Link 
                        to={`/tx/${tx.id}`}
                        className="text-sm text-primary hover:underline truncate font-mono"
                      >
                        {tx.id.slice(0, 12)}...{tx.id.slice(-8)}
                      </Link>
                    </div>

                    {tx.type === 7 && tx.order1 && tx.order2 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Comprador:</span>
                          <Link 
                            to={`/address/${tx.order1.orderType === 'buy' ? tx.order1.sender : tx.order2.sender}`}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline truncate font-mono font-medium"
                          >
                            {tx.order1.orderType === 'buy' ? `${tx.order1.sender.slice(0, 8)}...${tx.order1.sender.slice(-6)}` : `${tx.order2.sender.slice(0, 8)}...${tx.order2.sender.slice(-6)}`}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Vendedor:</span>
                          <Link 
                            to={`/address/${tx.order1.orderType === 'sell' ? tx.order1.sender : tx.order2.sender}`}
                            className="text-xs text-amber-600 dark:text-amber-400 hover:underline truncate font-mono font-medium"
                          >
                            {tx.order1.orderType === 'sell' ? `${tx.order1.sender.slice(0, 8)}...${tx.order1.sender.slice(-6)}` : `${tx.order2.sender.slice(0, 8)}...${tx.order2.sender.slice(-6)}`}
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">From:</span>
                          <Link 
                            to={`/address/${tx.sender || '3LDqeVbNxAyg1pmyQBARW853LBxaFmjumcy'}`}
                            className="text-sm text-primary hover:underline truncate font-mono"
                          >
                            {!tx.sender || tx.sender === "" || tx.id === '5b41TrGD55vcfNc489rbdcKDnh5stoLY1UB1xFRde2JnKmZpHnU49nvi6k4j9u8ivR9hoaNPqQiARy7XVtEYt5zr' ? "Satoshi Nakamoto 👑" : `${tx.sender.slice(0, 8)}...${tx.sender.slice(-6)}`}
                          </Link>
                        </div>
                        {tx.recipient && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">To:</span>
                            <Link 
                              to={`/address/${tx.recipient}`}
                              className="text-sm text-primary hover:underline truncate font-mono"
                            >
                              {`${tx.recipient.slice(0, 8)}...${tx.recipient.slice(-6)}`}
                            </Link>
                          </div>
                        )}
                      </>
                    )}

                    {tx.type === 3 && (
                      <div className="text-xs text-muted-foreground italic font-normal mt-1 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 max-w-md">
                        Criação do token <strong className="text-foreground">{tx.name}</strong>: {tx.description || "Nenhuma descrição fornecida."}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {displayAmount !== undefined && (
                    <div className="text-sm font-semibold font-mono">
                      {(displayAmount / Math.pow(10, amountDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                      <span className="text-primary font-bold text-xs uppercase">{amountSymbol}</span>
                    </div>
                  )}
                  {tx.type === 7 && tx.price !== undefined && (
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Preço: {(tx.price / Math.pow(10, 8 + (tx.order1?.assetPair?.priceAsset ? (assetMap[tx.order1.assetPair.priceAsset]?.decimals ?? 8) : 8) - amountDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                      <span className="text-[9px] uppercase font-bold">PLO</span>
                    </div>
                  )}
                  {tx.fee !== undefined && (
                    <div className="text-xs text-muted-foreground font-mono">
                      Fee: {(tx.fee / Math.pow(10, feeDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                      <span className="text-primary text-[10px] uppercase font-bold">{feeSymbol}</span>
                    </div>
                  )}
                  <Link 
                    to={`/tx/${tx.id}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink className="h-3 w-3" />
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

export default TransactionList;
