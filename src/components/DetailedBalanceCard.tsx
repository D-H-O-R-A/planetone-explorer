
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertTriangle } from 'lucide-react';
import { fetchDetailedBalance, DetailedBalance } from '@/services/api';
import { formatGicBalance } from '@/utils/formatter';
import { Skeleton } from "@/components/ui/skeleton";
import { getCoinName } from '@/lib/utils';

interface DetailedBalanceCardProps {
  address: string;
}

const DetailedBalanceCard = ({ address }: DetailedBalanceCardProps) => {
  const [balanceData, setBalanceData] = useState<DetailedBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBalanceData = async () => {
      if (!address) return;
      
      setLoading(true);
      try {
        const data = await fetchDetailedBalance(address);
        setBalanceData(data);
      } catch (error) {
        console.error("Error loading detailed balance:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBalanceData();
  }, [address]);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Detailed Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!balanceData) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Detailed Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load balance details</p>
        </CardContent>
      </Card>
    );
  }

  // Check if the address is a validator node
  const isValidatorNode = (balanceData.generatingBalance !== balanceData.regularBalance ||
                          balanceData.generatingBalance !== balanceData.availableBalance ||
                          balanceData.generatingBalance !== balanceData.effectiveBalance) && balanceData.generatingBalance > 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Detailed Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-secondary/30 border border-border/30 p-4 rounded-lg hover:border-primary/20 transition-all duration-300">
            <div className="text-sm text-muted-foreground mb-1">Balance</div>
            <div className="text-xl font-bold">{formatGicBalance(balanceData.balance)} {getCoinName()}</div>
          </div>
          
          <div className="bg-secondary/30 border border-border/30 p-4 rounded-lg hover:border-primary/20 transition-all duration-300">
            <div className="text-sm text-muted-foreground mb-1">Regular Balance</div>
            <div className="text-xl font-bold">{formatGicBalance(balanceData.regularBalance)} {getCoinName()}</div>
          </div>
          
          <div className="bg-secondary/30 border border-border/30 p-4 rounded-lg hover:border-primary/20 transition-all duration-300">
            <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
            <div className="text-xl font-bold">{formatGicBalance(balanceData.availableBalance)} {getCoinName()}</div>
          </div>
          
          <div className="bg-secondary/30 border border-border/30 p-4 rounded-lg hover:border-primary/20 transition-all duration-300">
            <div className="text-sm text-muted-foreground mb-1">Effective Balance</div>
            <div className="text-xl font-bold">{formatGicBalance(balanceData.effectiveBalance)} {getCoinName()}</div>
          </div>
          
          <div className="bg-secondary/30 border border-border/30 p-4 rounded-lg hover:border-primary/20 transition-all duration-300">
            <div className="text-sm text-muted-foreground mb-1">Generating Balance</div>
            <div className="text-xl font-bold">{formatGicBalance(balanceData.generatingBalance)} {getCoinName()}</div>
            {isValidatorNode && (
              <Badge variant="outline" className="mt-2 text-xs">
                Validator Node
              </Badge>
            )}
          </div>
          
          <div className="bg-secondary/30 border border-border/30 p-4 rounded-lg hover:border-primary/20 transition-all duration-300">
            <div className="text-sm text-muted-foreground mb-1">Confirmations</div>
            <div className="text-xl font-bold">{balanceData.confirmations}</div>
          </div>
        </div>

        {isValidatorNode && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-400 mb-1">Validator Node Detected</h4>
                <p className="text-sm text-muted-foreground">
                  The generating balance differs from other balances because this address is a validator node. 
                  The value will be effective at the end of an epoch.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedBalanceCard;
