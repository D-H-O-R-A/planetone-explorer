import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowDown, Wallet, ArrowRightLeft } from 'lucide-react';

interface TransactionTransferCardProps {
  transaction: any;
  coin: string;
  formattedData: any;
}

const TransactionTransferCard = ({ 
  transaction, 
  coin,
  formattedData 
}: TransactionTransferCardProps) => {
  return (
    <Card className="border border-border bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="border-b border-border bg-muted/30 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-base sm:text-lg font-bold text-foreground">FLUXO DE TRANSFERÊNCIA</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">Representação visual detalhada do fluxo de ativos na blockchain</CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 py-4"
        >
          {/* Sender Address Block */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/40 border border-border/50 w-full md:w-[35%] transition-all duration-300 hover:border-emerald-500/20 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            <Badge variant="outline" className="mb-3 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] px-2.5 py-0.5 rounded-full">ORIGEM (DE)</Badge>
            <div className="p-2.5 rounded-full bg-muted border border-border/80 text-muted-foreground mb-2 group-hover:text-primary transition-colors">
              <Wallet className="h-5 w-5" />
            </div>
            <Link to={`/address/${transaction.sender || '3LDqeVbNxAyg1pmyQBARW853LBxaFmjumcy'}`} className="w-full text-center">
              <span className="font-mono text-xs sm:text-sm text-primary group-hover:underline truncate block px-2 font-medium">
                {!transaction.sender || transaction.sender === "" || transaction.id === '5b41TrGD55vcfNc489rbdcKDnh5stoLY1UB1xFRde2JnKmZpHnU49nvi6k4j9u8ivR9hoaNPqQiARy7XVtEYt5zr' ? "Satoshi Nakamoto 👑" : transaction.sender}
              </span>
            </Link>
          </div>
          
          {/* Transfer Value Arrow Block */}
          <div className="relative flex flex-col items-center justify-center py-2 w-full md:w-[25%]">
            {/* Arrow displayed horizontally on desktop, vertically on mobile */}
            <div className="hidden md:block">
              <ArrowRight className="h-6 w-6 text-emerald-500/80 animate-pulse" />
            </div>
            <div className="md:hidden">
              <ArrowDown className="h-6 w-6 text-emerald-500/80 animate-pulse" />
            </div>
            
            <motion.div 
              className="mt-2 text-center bg-emerald-500/5 border border-emerald-500/10 px-4 py-2.5 rounded-2xl shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Montante</div>
              <div className="text-base sm:text-lg font-bold text-foreground font-tech">
                {formattedData.amount} <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold">{coin}</span>
              </div>
            </motion.div>
          </div>
          
          {/* Recipient Address Block */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/40 border border-border/50 w-full md:w-[35%] transition-all duration-300 hover:border-emerald-500/20 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <Badge variant="outline" className="mb-3 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] px-2.5 py-0.5 rounded-full">DESTINO (PARA)</Badge>
            <div className="p-2.5 rounded-full bg-muted border border-border/80 text-muted-foreground mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
              <Wallet className="h-5 w-5" />
            </div>
            <Link to={`/address/${transaction.recipient}`} className="w-full text-center">
              <span className="font-mono text-xs sm:text-sm text-primary group-hover:underline truncate block px-2 font-medium">
                {transaction.recipient}
              </span>
            </Link>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TransactionTransferCard;
