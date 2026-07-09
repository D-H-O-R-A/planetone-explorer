import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clipboard, ShieldCheck, Sparkles } from 'lucide-react';
import TokenImage from './TokenImage';

interface TransactionHeaderProps {
  transaction: any;
  txType: any;
  coin: string;
  formattedData: any;
  copiedFields: Record<string, boolean>;
  handleCopyToClipboard: (text: string, field: string) => void;
  latestHeight?: number | null;
}

const TransactionHeader = ({ 
  transaction, 
  txType, 
  coin,
  formattedData, 
  copiedFields, 
  handleCopyToClipboard,
  latestHeight
}: TransactionHeaderProps) => {
  const shortenHash = (hash: string, length: number = 12) => {
    if (!hash) return "";
    if (hash.length <= length * 2) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-length)}`;
  };

  const confirmations = latestHeight && transaction.height ? latestHeight - transaction.height + 1 : null;

  return (
    <CardHeader className="border-b border-border bg-card/60 backdrop-blur-xl p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative glass gradient background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Side accent border */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0 flex items-center justify-center">
              <txType.icon className="h-4 w-4" />
            </div>
            {(transaction.type === 3 || transaction.assetId) && (
              <TokenImage assetId={transaction.assetId || transaction.id} size="sm" className="border-emerald-500/30" />
            )}
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-0.5 text-xs rounded-full">
              {txType.name}
            </Badge>
            
            {/* Real-time confirmations display */}
            {confirmations !== null ? (
              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-0.5 text-xs rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{confirmations >= 1000 ? "1000+" : confirmations} {confirmations === 1 ? "Confirmação" : "Confirmações"}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium px-2.5 py-0.5 text-xs rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="h-3 w-3" />
                <span>Pendente</span>
              </Badge>
            )}
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold mt-2 flex flex-wrap items-center gap-2 text-foreground">
            <span className="font-mono tracking-tight break-all select-all">
              {shortenHash(transaction.id, 16)}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 flex-shrink-0"
              onClick={() => handleCopyToClipboard(transaction.id, "Transaction ID")}
              title="Copiar ID da Transação"
            >
              {copiedFields["Transaction ID"] ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>

          <CardDescription className="text-muted-foreground text-xs sm:text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{txType.description}</span>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <span className="font-medium text-foreground/80">{formattedData.timestamp}</span>
          </CardDescription>
        </div>
        
        {transaction.amount && transaction.type === 4 && (
          <div className="flex flex-col items-start md:items-end bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/10 rounded-2xl p-4 md:text-right min-w-[140px] shadow-sm">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Valor Transferido</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1 font-tech select-all">
              {formattedData.amount} <span className="text-xs sm:text-sm font-semibold text-muted-foreground">{coin}</span>
            </span>
          </div>
        )}
      </div>
    </CardHeader>
  );
};

export default TransactionHeader;
