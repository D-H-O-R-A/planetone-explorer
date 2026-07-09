import { CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface TransactionJsonTabProps {
  transaction: any;
  copiedFields: Record<string, boolean>;
  handleCopyToClipboard: (text: string, field: string) => void;
}

const TransactionJsonTab = ({ 
  transaction, 
  copiedFields, 
  handleCopyToClipboard 
}: TransactionJsonTabProps) => {
  return (
    <CardContent className="p-0 bg-transparent">
      <div className="px-4 sm:px-6 py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/10">
        <div className="text-sm font-semibold text-foreground">DADOS BRUTOS (RAW JSON)</div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs border-emerald-500/20 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold w-full sm:w-auto transition-all duration-200"
          onClick={() => handleCopyToClipboard(JSON.stringify(transaction, null, 2), "JSON Data")}
        >
          {copiedFields["JSON Data"] ? (
            <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 mr-1.5" />
          )}
          Copiar JSON Completo
        </Button>
      </div>
      <div className="p-4 sm:p-6 bg-muted/30 dark:bg-black/40 overflow-x-auto max-h-[500px] border border-border/20 m-4 rounded-xl">
        <pre className="text-xs text-foreground/80 dark:text-gray-300 font-mono whitespace-pre-wrap break-words leading-relaxed select-all">
          {JSON.stringify(transaction, null, 2)}
        </pre>
      </div>
    </CardContent>
  );
};

export default TransactionJsonTab;
