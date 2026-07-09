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

        // Load asset details for all transactions in parallel
        const uniqueAssetIds = Array.from(new Set(
          transactionData
            .flatMap(tx => [tx.assetId, tx.feeAsset])
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
        // Resolve amount decimals & symbol
        const amountAssetId = tx.assetId;
        const amountDecimals = amountAssetId ? (assetMap[amountAssetId]?.decimals ?? 8) : 8;
        const amountSymbol = amountAssetId ? (assetMap[amountAssetId]?.name ?? amountAssetId.substring(0, 4).toUpperCase()) : getCoinName();

        // Resolve fee decimals & symbol
        const feeAssetId = tx.feeAsset;
        const feeDecimals = feeAssetId ? (assetMap[feeAssetId]?.decimals ?? 8) : 8;
        const feeSymbol = feeAssetId ? (assetMap[feeAssetId]?.name ?? feeAssetId.substring(0, 4).toUpperCase()) : getCoinName();

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
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {tx.amount !== undefined && (
                    <div className="text-sm font-semibold font-mono">
                      {(tx.amount / Math.pow(10, amountDecimals)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                      <span className="text-primary font-bold text-xs uppercase">{amountSymbol}</span>
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
