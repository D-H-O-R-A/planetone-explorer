
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Layers, Clock, Hash } from 'lucide-react';
import { Block } from '@/services/api';
import { formatNumber, formatTimeAgo, formatDate } from '@/utils/formatter';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getGCSApiUrl, getCoinName } from '@/lib/utils';

interface BlockListProps {
  limit?: number;
}

const BlockList: React.FC<BlockListProps> = ({ limit = 5 }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlocks = async () => {
      setIsLoading(true);
      try {
        const apiUrl = getGCSApiUrl();
        console.log("Fetching latest blocks...");
        
        // First get the latest block height
        const latestResponse = await fetch(`${apiUrl}/blocks/last`);
        if (!latestResponse.ok) {
          throw new Error('Failed to fetch latest block');
        }
        
        const latestBlock = await latestResponse.json();
        const latestHeight = latestBlock.height;
        
        // Fetch blocks using /blocks/at/{height}
        const blockData: Block[] = [];
        for (let i = 0; i < limit; i++) {
          const height = latestHeight - i;
          if (height <= 0) break;
          
          try {
            const response = await fetch(`${apiUrl}/blocks/at/${height}`);
            if (response.ok) {
              const block = await response.json();
              blockData.push(block);
            }
          } catch (error) {
            console.error(`Failed to fetch block at height ${height}:`, error);
          }
        }
        
        console.log("Block data received:", blockData);
        setBlocks(blockData);
      } catch (error) {
        console.error("Error fetching blocks:", error);
        toast.error("Failed to fetch latest blocks");
        setBlocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlocks();
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchBlocks, 60000);
    return () => clearInterval(interval);
  }, [limit]);

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

  if (blocks.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No blocks found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <Card key={block.height} className="glass-card hover:bg-muted/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Block
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(block.timestamp)}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Height:</span>
                    <Link 
                      to={`/block/${block.height}`}
                      className="text-sm text-primary hover:underline font-mono"
                    >
                      {formatNumber(block.height)}
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Transactions:</span>
                    <span className="text-sm font-medium">
                      {formatNumber(block.transactionCount)}
                    </span>
                  </div>
                  
                  {block.generator && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Generator:</span>
                      <Link 
                        to={`/address/${block.generator}`}
                        className="text-sm text-primary hover:underline truncate font-mono"
                      >
                        {block.generator.slice(0, 8)}...{block.generator.slice(-6)}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                {block.reward && (
                  <div className="text-sm font-medium">
                    {formatNumber(block.reward / 100000000)} {getCoinName()}
                  </div>
                )}
                {(block.blockSize || block.size) && (
                  <div className="text-xs text-muted-foreground">
                    Size: {formatNumber(block.blockSize || block.size)} bytes ({((block.blockSize || block.size) / 1024).toFixed(1)} KB)
                  </div>
                )}
                <Link 
                  to={`/block/${block.height}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlockList;
