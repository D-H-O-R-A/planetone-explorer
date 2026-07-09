import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGCSApiUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartDataPoint {
  timestamp: number;
  height: number;
  transactions: number;
  avgBlockTime: number;
  date: string;
}

const NetworkChart = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const apiUrl = getGCSApiUrl();
        console.log("Fetching network chart data...");
        
        // First get the latest block height
        const latestResponse = await fetch(`${apiUrl}/blocks/last`);
        if (!latestResponse.ok) {
          throw new Error('Failed to fetch latest block');
        }
        
        const latestBlock = await latestResponse.json();
        const latestHeight = latestBlock.height;
        
        // Fetch last 20 blocks using /blocks/at/{height}
        const blocks = [];
        for (let i = 0; i < 20; i++) {
          const height = latestHeight - i;
          if (height <= 0) break;
          
          try {
            const response = await fetch(`${apiUrl}/blocks/at/${height}`);
            if (response.ok) {
              const block = await response.json();
              blocks.push(block);
            }
          } catch (error) {
            console.error(`Failed to fetch block at height ${height}:`, error);
          }
        }
        
        console.log("Blocks for chart:", blocks);
        
        if (blocks.length > 0) {
          const processedData: ChartDataPoint[] = blocks.map((block: any, index: number) => {
            const prevBlock = blocks[index + 1];
            const blockTime = prevBlock ? (block.timestamp - prevBlock.timestamp) / 1000 : 60;
            
            return {
              timestamp: block.timestamp,
              height: block.height,
              transactions: block.transactionCount || 0,
              avgBlockTime: blockTime,
              date: new Date(block.timestamp).toLocaleDateString()
            };
          }).reverse(); // Reverse to show chronological order
          
          setChartData(processedData);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        toast.error("Failed to fetch chart data");
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
    
    // Set up auto-refresh every 2 minutes
    const interval = setInterval(fetchChartData, 120000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-center">No chart data available</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="transactions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="blocks">Block Heights</TabsTrigger>
        <TabsTrigger value="blocktime">Block Time</TabsTrigger>
      </TabsList>
      
      <TabsContent value="transactions" className="space-y-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="height" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `#${value}`}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => `Block #${value}`}
                formatter={(value: any) => [value, 'Transactions']}
              />
              <Bar dataKey="transactions" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      
      <TabsContent value="blocks" className="space-y-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [value, 'Block Height']}
              />
              <Line 
                type="monotone" 
                dataKey="height" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      
      <TabsContent value="blocktime" className="space-y-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="height" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `#${value}`}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => `Block #${value}`}
                formatter={(value: any) => [`${value.toFixed(1)}s`, 'Block Time']}
              />
              <Line 
                type="monotone" 
                dataKey="avgBlockTime" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default NetworkChart;
