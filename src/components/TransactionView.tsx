
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, CreditCard, 
  Fingerprint, ExternalLink, ArrowLeftRight, 
  Flame, Coins, Tag, Code
} from 'lucide-react';
import { fetchAssetDetails, fetchTransaction, Transaction, fetchLatestHeight } from '@/services/api';
import { formatDate, formatNumber } from '@/utils/formatter';
import { useToast } from '@/hooks/use-toast';
import { getCoinName } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import TransactionHeader from './TransactionHeader';
import TransactionDetailsTab from './TransactionDetailsTab';
import TransactionJsonTab from './TransactionJsonTab';
import TransactionTransferCard from './TransactionTransferCard';

type TransactionType = {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
};

const transactionTypes: Record<number, TransactionType> = {
  1: { id: 1, name: 'Genesis', description: 'Initial distribution of tokens', icon: Flame },
  3: { id: 3, name: 'Issue', description: 'Creation of a new token', icon: CreditCard },
  4: { id: 4, name: 'Transfer', description: 'Asset transfer between addresses', icon: ArrowLeftRight },
  5: { id: 5, name: 'Reissue', description: 'Additional issuance of an existing token', icon: CreditCard },
  6: { id: 6, name: 'Burn', description: 'Destruction of token units', icon: Flame },
  7: { id: 7, name: 'Exchange', description: 'Exchange of different tokens', icon: ArrowLeftRight },
  8: { id: 8, name: 'Lease', description: 'Leasing of tokens', icon: Coins },
  9: { id: 9, name: 'Lease Cancel', description: 'Cancellation of a lease', icon: AlertCircle },
  10: { id: 10, name: 'Alias', description: 'Creation of an alias', icon: Tag },
  11: { id: 11, name: 'Mass Transfer', description: 'Multiple transfers in one transaction', icon: ArrowLeftRight },
  12: { id: 12, name: 'Data', description: 'Data storage on blockchain', icon: Code },
  13: { id: 13, name: 'Set Script', description: 'Setting a script for account', icon: Code },
  14: { id: 14, name: 'Sponsor Fee', description: 'Sponsoring transaction fees', icon: Coins },
  15: { id: 15, name: 'Set Asset Script', description: 'Setting a script for asset', icon: Code },
  16: { id: 16, name: 'Invoke Script', description: 'Invoking a dApp function', icon: Code },
  17: { id: 17, name: 'Update Asset Info', description: 'Updating asset information', icon: CreditCard },
  18: { id: 18, name: 'Ethereum Transaction', description: 'Ethereum-compatible transaction', icon: ArrowLeftRight },
};

const TransactionView = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [assetName, setAssetName] = useState(getCoinName())
  const [feeassetName, setfeeAssetName] = useState(getCoinName())
  const [assetDecimals, setAssetDecimals] = useState(8);
  const [feeassetDecimals, setfeeAssetDecimals] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [latestHeight, setLatestHeight] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadTransaction = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const txData = await fetchTransaction(id);
        if(txData.assetId!= null){
          const txDataAssset = await fetchAssetDetails(txData.assetId)
          setAssetName(txDataAssset.name)
          setAssetDecimals(txDataAssset.decimals);
        }
        if(txData.feeAsset!= null){
          const txDataAssset = await fetchAssetDetails(txData.feeAsset)
          setfeeAssetName(txDataAssset.name)
          setfeeAssetDecimals(txDataAssset.decimals);
        }
        setTransaction(txData);
        console.log("Transaction loaded:", txData);

        // Fetch latest block height
        try {
          const height = await fetchLatestHeight();
          setLatestHeight(height);
        } catch (e) {
          console.warn("Failed to fetch latest block height:", e);
        }
      } catch (error) {
        console.error(`Error loading transaction ${id}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransaction();
  }, [id]);

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFields({ ...copiedFields, [field]: true });
    
    toast({
      title: "Copied",
      description: `${field} copied to clipboard`,
      duration: 2000,
    });
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedFields((prev) => ({ ...prev, [field]: false }));
    }, 2000);
  };

  const getTxType = (type: number): TransactionType => {
    return transactionTypes[type] || {
      id: type,
      name: `Type ${type}`,
      description: 'Custom transaction type',
      icon: Fingerprint,
    };
  };

  if (isLoading) {
    return (
      <div className="w-full py-16 sm:py-32 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-2 border-t-primary rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 sm:mt-6 text-primary/50 title-tech animate-pulse-light text-sm sm:text-base">LOADING SYSTEM</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto mt-6 sm:mt-10 p-4 sm:p-8 tech-card text-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 title-tech text-gradient">TRANSACTION NOT FOUND</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
          The transaction you are looking for could not be found or may be invalid.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:gap-4">
          <Button variant="outline" className="neon-button w-full" asChild>
            <Link to="/transactions">Explore Transactions</Link>
          </Button>
          <Button className="neon-button w-full" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  const txType = getTxType(transaction.type);
  
  // Format all relevant data for display
  const formattedData = {
    timestamp: formatDate(transaction.timestamp),
    amount: transaction.amount ? formatNumber(transaction.amount / Math.pow(10, assetDecimals)) : null,
    fee: formatNumber(transaction.fee / Math.pow(10, feeassetDecimals)),
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Overview Card - Mobile Optimized */}
      <Card className="border border-border bg-card/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
        <TransactionHeader 
          transaction={transaction}
          txType={txType}
          formattedData={formattedData}
          copiedFields={copiedFields}
          coin={assetName}
          handleCopyToClipboard={handleCopyToClipboard}
          latestHeight={latestHeight}
        />
        
        <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
          <div className="border-b border-border bg-muted/20">
            <TabsList className="h-auto w-full justify-start bg-transparent border-b-0 p-0">
              <div className="flex w-full">
                <TabsTrigger 
                  value="details" 
                  className="flex-1 font-semibold h-11 px-4 text-xs sm:text-sm data-[state=active]:text-emerald-500 dark:data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 dark:data-[state=active]:border-emerald-400 rounded-none bg-transparent hover:text-emerald-500/80 transition-all"
                >
                  DETALHES
                </TabsTrigger>
                <TabsTrigger 
                  value="json" 
                  className="flex-1 font-semibold h-11 px-4 text-xs sm:text-sm data-[state=active]:text-emerald-500 dark:data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 dark:data-[state=active]:border-emerald-400 rounded-none bg-transparent hover:text-emerald-500/80 transition-all"
                >
                  JSON DA API
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          <TabsContent value="details" className="p-0 mt-0">
            <TransactionDetailsTab 
              transaction={transaction}
              coin={assetName}
              feeasset={feeassetName}
              txType={txType}
              formattedData={formattedData}
              copiedFields={copiedFields}
              handleCopyToClipboard={handleCopyToClipboard}
              latestHeight={latestHeight}
            />
          </TabsContent>

          <TabsContent value="json" className="p-0 mt-0">
            <TransactionJsonTab 
              transaction={transaction}
              copiedFields={copiedFields}
              handleCopyToClipboard={handleCopyToClipboard}
            />
          </TabsContent>
        </Tabs>

        <CardFooter className="bg-muted/10 border-t border-border p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Rede:</span>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-0.5 text-xs rounded-full">
              Planet One Blockchain (80)
            </Badge>
          </div>
          <a 
            href={`https://nodes.planetone.io/transactions/info/${id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group"
          >
            Visualizar JSON no Nó
            <ExternalLink className="h-3.5 w-3.5 text-primary group-hover:text-emerald-500 transition-colors" />
          </a>
        </CardFooter>
      </Card>

      {/* Transfer Details Card - Mobile Optimized */}
      {transaction.type === 4 && transaction.amount && (
        <TransactionTransferCard 
          transaction={transaction}
          coin={assetName}
          formattedData={formattedData}
        />
      )}

      {/* Related Transactions Accordion - Mobile Optimized */}
      <Accordion type="single" collapsible className="border border-border bg-card/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
        <AccordionItem value="related" className="border-0">
          <AccordionTrigger className="px-4 sm:px-6 py-4 border-b border-border/80 hover:no-underline bg-muted/20 text-foreground font-bold text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              TRANSAÇÕES RELACIONADAS
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 bg-transparent">
            <div className="text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full border border-dashed border-border p-3.5 bg-muted/30">
                  <Code className="w-5 h-5 text-muted-foreground/60" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">Nenhuma transação relacionada encontrada para este ID.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};

export default TransactionView;
