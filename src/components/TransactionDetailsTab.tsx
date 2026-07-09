import { Link } from 'react-router-dom';
import { CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Check, Clipboard, Clock, ShieldCheck, Tag, CreditCard, Flame, Coins, FileText, Landmark, Key, HelpCircle } from 'lucide-react';
import TransactionTypeDetails from './TransactionTypeDetails';

interface TransactionDetailsTabProps {
  transaction: any;
  txType: any;
  coin: string;
  feeasset: string;
  formattedData: any;
  copiedFields: Record<string, boolean>;
  handleCopyToClipboard: (text: string, field: string) => void;
  latestHeight?: number | null;
}

const TransactionDetailsTab = ({ 
  transaction, 
  txType, 
  coin,
  feeasset,
  formattedData, 
  copiedFields, 
  handleCopyToClipboard,
  latestHeight
}: TransactionDetailsTabProps) => {
  const confirmations = latestHeight && transaction.height ? latestHeight - transaction.height + 1 : null;

  return (
    <CardContent className="p-0 bg-transparent">
      <div className="divide-y divide-border">
        {/* Transaction ID */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Key className="h-4 w-4 text-muted-foreground/80" />
            <span>ID da Transação</span>
          </div>
          <div className="md:col-span-2 font-mono text-xs sm:text-sm flex items-start gap-2 break-all text-foreground bg-muted/30 p-2 sm:p-2.5 rounded-xl border border-border/40">
            <span className="flex-1 select-all font-semibold tracking-tight">{transaction.id}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-600 transition-colors flex-shrink-0"
              onClick={() => handleCopyToClipboard(transaction.id, "Transaction ID")}
              title="Copiar ID da Transação"
            >
              {copiedFields["Transaction ID"] ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Clipboard className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Type */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Tag className="h-4 w-4 text-muted-foreground/80" />
            <span>Tipo de Transação</span>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-0.5 text-xs rounded-full">
                {txType.name}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-muted border border-border/50 text-muted-foreground">
                Tipo {transaction.type}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Timestamp */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Clock className="h-4 w-4 text-muted-foreground/80" />
            <span>Timestamp</span>
          </div>
          <div className="md:col-span-2 flex items-center gap-2 text-foreground font-medium">
            <span className="break-words bg-muted/20 px-2.5 py-1 rounded-lg border border-border/30 text-sm">
              {formattedData.timestamp}
            </span>
          </div>
        </div>

        {/* Block Height */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Landmark className="h-4 w-4 text-muted-foreground/80" />
            <span>Bloco</span>
          </div>
          <div className="md:col-span-2">
            {transaction.height ? (
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  to={`/block/${transaction.height}`} 
                  className="flex items-center gap-1.5 text-primary hover:text-emerald-500 dark:hover:text-emerald-400 font-bold hover:underline group bg-primary/5 hover:bg-emerald-500/5 px-3 py-1 rounded-xl border border-primary/10 transition-all duration-200"
                >
                  <span className="font-mono text-sm">{transaction.height}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Link>
                {confirmations !== null && (
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 text-xs rounded-full flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{confirmations} {confirmations === 1 ? "confirmação" : "confirmações"}</span>
                  </Badge>
                )}
              </div>
            ) : (
              <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">Pendente</Badge>
            )}
          </div>
        </div>
        
        {/* Sender */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Landmark className="h-4 w-4 text-muted-foreground/80" />
            <span>Remetente (Emissor)</span>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-start gap-2 break-all text-foreground bg-muted/10 hover:bg-muted/25 border border-border/30 rounded-xl p-2.5 transition-colors">
              <Link 
                to={`/address/${transaction.sender || '3LDqeVbNxAyg1pmyQBARW853LBxaFmjumcy'}`} 
                className="flex-1 font-mono text-xs sm:text-sm text-primary hover:underline hover:text-emerald-500 dark:hover:text-emerald-400 font-medium leading-relaxed"
              >
                {!transaction.sender || transaction.sender === "" || transaction.id === '5b41TrGD55vcfNc489rbdcKDnh5stoLY1UB1xFRde2JnKmZpHnU49nvi6k4j9u8ivR9hoaNPqQiARy7XVtEYt5zr' ? "Satoshi Nakamoto 👑" : transaction.sender}
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-600 transition-colors flex-shrink-0"
                onClick={() => handleCopyToClipboard(transaction.sender || '3LDqeVbNxAyg1pmyQBARW853LBxaFmjumcy', "Sender Address")}
                title="Copiar Endereço do Remetente"
              >
                {copiedFields["Sender Address"] ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Clipboard className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Recipient */}
        {transaction.recipient && (
          <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Landmark className="h-4 w-4 text-muted-foreground/80" />
              <span>Destinatário</span>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-start gap-2 break-all text-foreground bg-muted/10 hover:bg-muted/25 border border-border/30 rounded-xl p-2.5 transition-colors">
                <Link 
                  to={`/address/${transaction.recipient}`} 
                  className="flex-1 font-mono text-xs sm:text-sm text-primary hover:underline hover:text-emerald-500 dark:hover:text-emerald-400 font-medium leading-relaxed"
                >
                  {transaction.recipient}
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-600 transition-colors flex-shrink-0"
                  onClick={() => handleCopyToClipboard(transaction.recipient, "Recipient Address")}
                  title="Copiar Endereço do Destinatário"
                >
                  {copiedFields["Recipient Address"] ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        {transaction.amount && transaction.type === 4 && (
          <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Coins className="h-4 w-4 text-muted-foreground/80" />
              <span>Valor</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-lg font-tech font-extrabold text-foreground tracking-tight select-all">
                {formattedData.amount} <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">{coin}</span>
              </span>
            </div>
          </div>
        )}

        {/* Attachment */}
        {transaction.attachment && (
          <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <FileText className="h-4 w-4 text-muted-foreground/80" />
              <span>Anexo (Mensagem)</span>
            </div>
            <div className="md:col-span-2 font-mono text-xs sm:text-sm break-all text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/40">
              {transaction.attachment}
            </div>
          </div>
        )}

        {/* Fee */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <HelpCircle className="h-4 w-4 text-muted-foreground/80" />
            <span>Taxa de Rede (Fee)</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-tech font-bold text-sm sm:text-base text-foreground bg-muted/40 px-3 py-1 rounded-xl border border-border/30">
              {formattedData.fee} <span className="text-emerald-600 dark:text-emerald-400 ml-1 font-semibold">{feeasset}</span>
            </span>
          </div>
        </div>

        {/* Type-specific details */}
        <TransactionTypeDetails 
          transaction={transaction}
          copiedFields={copiedFields}
          handleCopyToClipboard={handleCopyToClipboard}
        />
      </div>
    </CardContent>
  );
};

export default TransactionDetailsTab;
