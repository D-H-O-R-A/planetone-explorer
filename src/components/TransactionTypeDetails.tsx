import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Check, Clipboard, Code, Hash, Link as LinkIcon, Database, ShieldAlert, Coins, Tag, Key, FileCode, User, ShoppingCart } from 'lucide-react';
import { formatNumber } from '@/utils/formatter';
import { getCoinName } from '@/lib/utils';
import { fetchAssetDetails } from '@/services/api';
import TokenImage from './TokenImage';

interface TransactionTypeDetailsProps {
  transaction: any;
  copiedFields: Record<string, boolean>;
  handleCopyToClipboard: (text: string, field: string) => void;
}

// Detailed and Premium rendering of an Exchange transaction (type 7)
const ExchangeDetails = ({ 
  transaction, 
  copiedFields, 
  handleCopyToClipboard 
}: {
  transaction: any;
  copiedFields: Record<string, boolean>;
  handleCopyToClipboard: (text: string, field: string) => void;
}) => {
  const [amountAsset, setAmountAsset] = useState<any>(null);
  const [priceAsset, setPriceAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAssets = async () => {
      try {
        const amountAssetId = transaction.order1?.assetPair?.amountAsset;
        const priceAssetId = transaction.order1?.assetPair?.priceAsset;

        const [amountData, priceData] = await Promise.all([
          fetchAssetDetails(amountAssetId),
          fetchAssetDetails(priceAssetId)
        ]);

        if (isMounted) {
          setAmountAsset(amountData);
          setPriceAsset(priceData);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load exchange assets:", e);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssets();
    return () => {
      isMounted = false;
    };
  }, [transaction]);

  if (loading) {
    return (
      <div className="p-8 text-center text-primary/50 animate-pulse text-xs font-bold tracking-widest font-tech">
        CARREGANDO ATIVOS DA NEGOCIAÇÃO...
      </div>
    );
  }

  const amountDecimals = amountAsset?.decimals ?? 8;
  const priceDecimals = priceAsset?.decimals ?? 8;

  // Traded Amount
  const actualAmount = transaction.amount / Math.pow(10, amountDecimals);

  // Unit Price
  const pricePower = 8 + priceDecimals - amountDecimals;
  const actualPrice = transaction.price / Math.pow(10, pricePower);

  // Total volume
  const actualTotal = (transaction.amount * transaction.price) / 1e8 / Math.pow(10, priceDecimals);

  const buyOrder = transaction.order1?.orderType === 'buy' ? transaction.order1 : transaction.order2;
  const sellOrder = transaction.order1?.orderType === 'sell' ? transaction.order1 : transaction.order2;

  return (
    <div className="space-y-6 pt-4">
      {/* Visual Order Flow Diagram */}
      <div className="mx-4 sm:mx-6 p-6 bg-muted/10 rounded-2xl border border-border/60 flex flex-col md:flex-row items-center justify-around gap-6 text-center shadow-sm">
        {/* Buyer Section */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-tech">Comprador</span>
          <Link 
            to={`/address/${buyOrder?.sender}`}
            className="font-mono text-xs text-primary hover:underline font-semibold max-w-[200px] truncate block"
          >
            {buyOrder?.sender}
          </Link>
          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
            ID Ordem: {buyOrder?.id}
          </span>
        </div>

        {/* Traded Pair Info & Direction */}
        <div className="flex flex-col items-center gap-1.5 px-4">
          <div className="flex items-center gap-1">
            <TokenImage assetId={amountAsset?.assetId} size="xs" className="border-emerald-500/20" />
            <span className="font-extrabold text-foreground text-sm">{amountAsset?.name}</span>
            <span className="text-muted-foreground text-xs font-medium">/</span>
            <span className="font-bold text-muted-foreground text-xs">{priceAsset?.name}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 animate-pulse-light">
            <ShoppingCart className="w-4 h-4 animate-bounce" />
            <span className="text-[10px] font-bold tracking-widest uppercase font-tech">Executado</span>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10 mt-1">
            {formatNumber(actualAmount, amountDecimals)} {amountAsset?.name}
          </div>
        </div>

        {/* Seller Section */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
            <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-tech">Vendedor</span>
          <Link 
            to={`/address/${sellOrder?.sender}`}
            className="font-mono text-xs text-primary hover:underline font-semibold max-w-[200px] truncate block"
          >
            {sellOrder?.sender}
          </Link>
          <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
            ID Ordem: {sellOrder?.id}
          </span>
        </div>
      </div>

      {/* Structured Parameters Grid */}
      <div className="divide-y divide-border/60 border-t border-border/60">
        {/* Trading Pair */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Code className="h-4 w-4 text-muted-foreground/80" />
            <span>Par de Negociação</span>
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-foreground bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/20 text-sm">
                {amountAsset?.name}
              </span>
              <span className="text-muted-foreground font-semibold">/</span>
              <span className="font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border text-xs">
                {priceAsset?.name}
              </span>
            </div>
            {amountAsset?.assetId && (
              <Link 
                to={`/asset/${amountAsset.assetId}`} 
                className="text-xs text-primary hover:underline font-semibold"
              >
                (Visualizar {amountAsset.name})
              </Link>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Coins className="h-4 w-4 text-muted-foreground/80" />
            <span>Quantidade Executada</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-mono text-base font-extrabold text-foreground tracking-tight select-all">
              {formatNumber(actualAmount, amountDecimals)} <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">{amountAsset?.name}</span>
            </span>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Valor bruto da blockchain (satoshis): {transaction.amount}
            </p>
          </div>
        </div>

        {/* Unit Price */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Tag className="h-4 w-4 text-muted-foreground/80" />
            <span>Preço Unitário</span>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-2">
              <span className="font-mono text-base font-extrabold text-foreground tracking-tight select-all block">
                {formatNumber(actualPrice, 8)} <span className="text-muted-foreground font-medium text-xs ml-0.5">{priceAsset?.name} / {amountAsset?.name}</span>
              </span>
              <div className="text-xs text-muted-foreground font-medium flex flex-col gap-1.5 mt-1.5 bg-muted/30 p-3 rounded-xl border border-border/40 max-w-md shadow-inner">
                <div className="flex justify-between items-center">
                  <span>1 <span className="font-bold text-foreground">{amountAsset?.name}</span></span>
                  <span className="text-muted-foreground font-semibold">= <span className="font-mono font-bold text-primary">{formatNumber(actualPrice, 8)}</span> {priceAsset?.name}</span>
                </div>
                {actualPrice > 0 && (
                  <div className="flex justify-between items-center border-t border-border/20 pt-1.5">
                    <span>1 <span className="font-bold text-foreground">{priceAsset?.name}</span></span>
                    <span className="text-muted-foreground font-semibold">= <span className="font-mono font-bold text-primary">{formatNumber(1 / actualPrice, 8)}</span> {amountAsset?.name}</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mt-2">
              Valor bruto da blockchain (satoshis): {transaction.price}
            </p>
          </div>
        </div>

        {/* Volume Total */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Coins className="h-4 w-4 text-muted-foreground/80" />
            <span>Valor Total Pago (Volume)</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight select-all">
              {formatNumber(actualTotal, priceDecimals)} <span className="font-bold text-sm ml-0.5">{priceAsset?.name}</span>
            </span>
          </div>
        </div>

        {/* Matcher Fees */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Hash className="h-4 w-4 text-muted-foreground/80" />
            <span>Taxas do Matcher (Intermediação)</span>
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
            <div className="bg-muted/20 p-3 rounded-xl border border-border/40 flex-1">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1 font-tech">Taxa Comprador</span>
              <span className="font-mono font-bold text-sm select-all">
                {formatNumber(transaction.buyMatcherFee / 1e8, 8)} <span className="text-xs text-muted-foreground font-medium">PLO</span>
              </span>
            </div>
            <div className="bg-muted/20 p-3 rounded-xl border border-border/40 flex-1">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1 font-tech">Taxa Vendedor</span>
              <span className="font-mono font-bold text-sm select-all">
                {formatNumber(transaction.sellMatcherFee / 1e8, 8)} <span className="text-xs text-muted-foreground font-medium">PLO</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detailed and Premium rendering of an Issue transaction (type 3) with dynamic node fetches
const IssueDetails = ({
  transaction,
  copiedFields,
  handleCopyToClipboard,
  DetailRow
}: {
  transaction: any;
  copiedFields: Record<string, boolean>;
  handleCopyToClipboard: (text: string, field: string) => void;
  DetailRow: any;
}) => {
  const [assetDetails, setAssetDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      try {
        const id = transaction.assetId || transaction.id;
        if (!id) {
          setLoading(false);
          return;
        }
        const data = await fetchAssetDetails(id);
        if (isMounted) {
          setAssetDetails(data);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load issue asset details:", e);
        if (isMounted) setLoading(false);
      }
    };
    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [transaction.assetId, transaction.id]);

  const id = transaction.assetId || transaction.id;
  const decimals = assetDetails?.decimals ?? transaction.decimals ?? 8;
  const name = assetDetails?.name ?? transaction.name ?? "Token";
  const description = assetDetails?.description ?? transaction.description ?? "Nenhuma descrição fornecida.";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
        <span className="text-xs text-muted-foreground font-semibold">Carregando informações do Token...</span>
      </div>
    );
  }

  return (
    <>
      <DetailRow label="Nome do Ativo" icon={Tag}>
        <div className="flex items-center gap-2.5">
          <TokenImage assetId={id} size="sm" className="border-emerald-500/30" />
          <span className="font-bold text-foreground text-base bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl">
            {name}
          </span>
        </div>
      </DetailRow>
      <DetailRow label="Descrição" icon={Database}>
        <p className="text-muted-foreground italic font-normal max-w-2xl leading-relaxed">
          {description}
        </p>
      </DetailRow>
      <DetailRow label="Quantidade (Total Supply)" icon={Coins}>
        <span className="font-tech text-base font-bold">
          {transaction.quantity ? formatNumber(transaction.quantity / Math.pow(10, decimals)) : 0}
        </span>
      </DetailRow>
      <DetailRow label="Decimais" icon={Hash}>
        <Badge variant="secondary" className="bg-muted text-muted-foreground border border-border">
          {decimals}
        </Badge>
      </DetailRow>
      <DetailRow label="Reemitível" icon={ShieldAlert}>
        <Badge variant="outline" className={transaction.reissuable ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold" : "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400 font-semibold"}>
          {transaction.reissuable ? 'Sim' : 'Não'}
        </Badge>
      </DetailRow>
      {id && (
        <DetailRow label="ID do Ativo" icon={LinkIcon}>
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
            <Link to={`/asset/${id}`} className="text-primary hover:underline flex-1 font-semibold">
              {id}
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
              onClick={() => handleCopyToClipboard(id, "Asset ID")}
            >
              {copiedFields["Asset ID"] ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Clipboard className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </DetailRow>
      )}
    </>
  );
};

export const maskedAssetId = (id: string) => {
  if (!id) return "";
  if (id.length <= 10) return id;
  return `${id.slice(0, 5)}...${id.slice(-5)}`;
};

const TransactionTypeDetails = ({ 
  transaction, 
  copiedFields, 
  handleCopyToClipboard 
}: TransactionTypeDetailsProps) => {
  const coinName = getCoinName();

  // Helper component to render a consistent row
  const DetailRow = ({ label, children, icon: Icon }: { label: string; children: React.ReactNode; icon?: any }) => (
    <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 hover:bg-muted/20 transition-all duration-200">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/60" />}
        <span>{label}</span>
      </div>
      <div className="md:col-span-2 text-foreground font-medium text-sm">
        {children}
      </div>
    </div>
  );

  switch (transaction.type) {
    case 1: // Genesis Transaction
      return (
        <>
          <DetailRow label="Destinatário" icon={Key}>
            <Link to={`/address/${transaction.recipient}`} className="text-primary hover:underline font-mono">
              {transaction.recipient}
            </Link>
          </DetailRow>
          <DetailRow label="Quantidade Inicial" icon={Coins}>
            <span className="font-tech text-base font-bold">
              {transaction.amount ? formatNumber(transaction.amount / 1e8) : 0} <span className="text-emerald-500">{coinName}</span>
            </span>
          </DetailRow>
        </>
      );

    case 3: // Issue
      return (
        <IssueDetails 
          transaction={transaction} 
          copiedFields={copiedFields} 
          handleCopyToClipboard={handleCopyToClipboard} 
          DetailRow={DetailRow} 
        />
      );

    case 4: // Transfer Asset ID display helper
      return transaction.assetId ? (
        <DetailRow label="Token Transferido (Asset ID)" icon={LinkIcon}>
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
            <Link to={`/asset/${transaction.assetId}`} className="text-primary hover:underline flex-1 font-semibold">
              {transaction.assetId}
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
              onClick={() => handleCopyToClipboard(transaction.assetId || '', "Asset ID")}
            >
              {copiedFields["Asset ID"] ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Clipboard className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </DetailRow>
      ) : null;

    case 5: // Reissue
      return (
        <>
          {transaction.assetId && (
            <DetailRow label="ID do Ativo" icon={LinkIcon}>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
                <Link to={`/asset/${transaction.assetId}`} className="text-primary hover:underline flex-1 font-semibold">
                  {transaction.assetId}
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
                  onClick={() => handleCopyToClipboard(transaction.assetId || '', "Asset ID")}
                >
                  {copiedFields["Asset ID"] ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </DetailRow>
          )}
          <DetailRow label="Quantidade Reemitida" icon={Coins}>
            <span className="font-tech text-base font-bold text-emerald-600 dark:text-emerald-400">
              +{transaction.quantity ? formatNumber(transaction.quantity) : 0}
            </span>
          </DetailRow>
          <DetailRow label="Mantém Reemitível" icon={ShieldAlert}>
            <Badge variant="outline" className={transaction.reissuable ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold" : "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400 font-semibold"}>
              {transaction.reissuable ? 'Sim' : 'Não'}
            </Badge>
          </DetailRow>
        </>
      );

    case 6: // Burn
      return (
        <>
          {transaction.assetId && (
            <DetailRow label="ID do Ativo Queimado" icon={LinkIcon}>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
                <Link to={`/asset/${transaction.assetId}`} className="text-primary hover:underline flex-1 font-semibold">
                  {transaction.assetId}
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
                  onClick={() => handleCopyToClipboard(transaction.assetId || '', "Asset ID")}
                >
                  {copiedFields["Asset ID"] ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </DetailRow>
          )}
          <DetailRow label="Quantidade Queimada" icon={Coins}>
            <span className="font-tech text-base font-bold text-red-500">
              -{transaction.amount ? formatNumber(transaction.amount) : 0}
            </span>
          </DetailRow>
        </>
      );

    case 7: // Exchange
      return (
        <ExchangeDetails 
          transaction={transaction}
          copiedFields={copiedFields}
          handleCopyToClipboard={handleCopyToClipboard}
        />
      );

    case 8: // Lease
      return (
        <>
          <DetailRow label="Destinatário do Arrendamento" icon={Key}>
            <Link to={`/address/${transaction.recipient}`} className="text-primary hover:underline font-mono">
              {transaction.recipient}
            </Link>
          </DetailRow>
          <DetailRow label="Valor Arrendado" icon={Coins}>
            <span className="font-tech text-base font-bold">
              {transaction.amount ? formatNumber(transaction.amount / 1e8) : 0} <span className="text-emerald-500">{coinName}</span>
            </span>
          </DetailRow>
        </>
      );

    case 9: // Lease Cancel
      return (
        <DetailRow label="ID do Arrendamento Cancelado" icon={LinkIcon}>
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
            <span className="flex-1 font-semibold text-foreground/90">{transaction.leaseId}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
              onClick={() => handleCopyToClipboard(transaction.leaseId || '', "Lease ID")}
            >
              {copiedFields["Lease ID"] ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Clipboard className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </DetailRow>
      );

    case 10: // Create Alias
      return (
        <DetailRow label="Alias Criado" icon={Tag}>
          <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm px-3 py-1 rounded-full">
            alias:P:{transaction.alias}
          </Badge>
        </DetailRow>
      );

    case 11: // Mass Transfer
      return (
        <>
          <DetailRow label="Total de Destinatários" icon={Hash}>
            <Badge className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-0.5 text-xs rounded-full">
              {transaction.transferCount || 0} Endereços
            </Badge>
          </DetailRow>
          <DetailRow label="Volume Total Transferido" icon={Coins}>
            <span className="font-tech text-base font-bold text-foreground">
              {transaction.totalAmount ? formatNumber(transaction.totalAmount / 1e8) : 0} 
              <span className="text-emerald-500 dark:text-emerald-400 ml-1 font-semibold">{coinName}</span>
            </span>
          </DetailRow>
          {transaction.assetId && (
            <DetailRow label="ID do Ativo" icon={LinkIcon}>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
                <Link to={`/asset/${transaction.assetId}`} className="text-primary hover:underline flex-1 font-semibold">
                  {transaction.assetId}
                </Link>
              </div>
            </DetailRow>
          )}
          {transaction.transfers && transaction.transfers.length > 0 && (
            <DetailRow label="Lista de Transferências (Destinatários)" icon={Database}>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-card/40 shadow-sm mt-1">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Destinatário</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Montante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.transfers.map((transfer: any, index: number) => (
                      <TableRow key={`${transfer.recipient}-${index}`} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-mono text-xs">
                          <Link to={`/address/${transfer.recipient}`} className="text-primary hover:underline truncate block max-w-64">
                            {transfer.recipient}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-right font-bold text-foreground">
                          {formatNumber(transfer.amount / 1e8)} <span className="text-muted-foreground text-[10px] ml-1">{maskedAssetId(transaction.assetId) || coinName}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DetailRow>
          )}
        </>
      );

    case 12: // Data Transaction
      return (
        <>
          {transaction.data && transaction.data.length > 0 && (
            <DetailRow label="Dados Armazenados (State Key/Value)" icon={Database}>
              <div className="overflow-x-auto rounded-xl border border-border bg-card/40 shadow-sm mt-1">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Chave (Key)</TableHead>
                      <TableHead className="text-xs font-semibold">Tipo (Type)</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Valor (Value)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.data.map((item: any, index: number) => (
                      <TableRow key={index} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-mono text-xs break-all select-all font-semibold max-w-xs">{item.key}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] bg-muted py-0 px-2 rounded-md">
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-right break-all select-all font-bold text-foreground max-w-md">
                          {JSON.stringify(item.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DetailRow>
          )}
        </>
      );

    case 13: // Set Script
      return (
        <DetailRow label="Script dApp Configurado" icon={FileCode}>
          <div className="flex flex-col gap-2 mt-1">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-bold w-fit px-3 py-1">
              Script Ativo e Operacional 🟢
            </Badge>
            {transaction.script && (
              <div className="bg-muted/30 dark:bg-black/30 border border-border/50 rounded-xl p-3 max-h-60 overflow-y-auto mt-2">
                <pre className="text-xs text-foreground/80 dark:text-gray-300 font-mono whitespace-pre-wrap break-all leading-relaxed select-all">
                  {transaction.script}
                </pre>
              </div>
            )}
          </div>
        </DetailRow>
      );

    case 14: // Sponsor Fee
      return (
        <>
          {transaction.assetId && (
            <DetailRow label="Ativo Patrocinado (Asset ID)" icon={LinkIcon}>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
                <Link to={`/asset/${transaction.assetId}`} className="text-primary hover:underline flex-1 font-semibold">
                  {transaction.assetId}
                </Link>
              </div>
            </DetailRow>
          )}
          <DetailRow label="Tarifa de Patrocínio Mínima" icon={Coins}>
            <span className="font-tech text-base font-bold text-emerald-600 dark:text-emerald-400">
              {transaction.minSponsoredAssetFee ? formatNumber(transaction.minSponsoredAssetFee) : 0}
            </span>
          </DetailRow>
        </>
      );

    case 15: // Set Asset Script
      return (
        <>
          {transaction.assetId && (
            <DetailRow label="ID do Ativo" icon={LinkIcon}>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
                <Link to={`/asset/${transaction.assetId}`} className="text-primary hover:underline flex-1 font-semibold">
                  {transaction.assetId}
                </Link>
              </div>
            </DetailRow>
          )}
          {transaction.script && (
            <DetailRow label="Script do Ativo" icon={FileCode}>
              <div className="bg-muted/30 dark:bg-black/30 border border-border/50 rounded-xl p-3 max-h-48 overflow-y-auto">
                <pre className="text-xs text-foreground/80 dark:text-gray-300 font-mono whitespace-pre-wrap break-all leading-relaxed select-all">
                  {transaction.script}
                </pre>
              </div>
            </DetailRow>
          )}
        </>
      );

    case 16: // Invoke Script
      return (
        <>
          {transaction.dApp && (
            <DetailRow label="Contrato dApp Executado" icon={Code}>
              <div className="flex items-start gap-2 break-all text-foreground bg-muted/10 hover:bg-muted/25 border border-border/30 rounded-xl p-2.5 transition-colors">
                <Link 
                  to={`/address/${transaction.dApp}`}
                  className="flex-1 font-mono text-xs sm:text-sm text-primary hover:underline font-bold"
                >
                  {transaction.dApp}
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
                  onClick={() => handleCopyToClipboard(transaction.dApp || '', "dApp Address")}
                >
                  {copiedFields["dApp Address"] ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </DetailRow>
          )}
          
          {transaction.call && (
            <DetailRow label="Função Invocada" icon={FileCode}>
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm px-3 py-1 rounded-lg w-fit">
                  {transaction.call.function}()
                </Badge>
                {transaction.call.args && transaction.call.args.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-border bg-card/40 shadow-sm mt-1">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="text-xs font-semibold">Parâmetro (Index)</TableHead>
                          <TableHead className="text-xs font-semibold">Tipo (Type)</TableHead>
                          <TableHead className="text-xs font-semibold text-right">Valor (Value)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transaction.call.args.map((arg: any, index: number) => (
                          <TableRow key={index} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="font-mono text-xs font-semibold"># {index}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] bg-muted py-0 px-2 rounded-md">
                                {arg.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-right break-all select-all font-bold text-foreground">
                              {JSON.stringify(arg.value)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </DetailRow>
          )}

          {/* Payments Attached to Invoke Script */}
          {transaction.payment && transaction.payment.length > 0 && (
            <DetailRow label="Pagamentos Anexados (Payments)" icon={Coins}>
              <div className="flex flex-col gap-2 mt-1">
                {transaction.payment.map((payment: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-xl w-fit">
                    <span className="font-tech font-bold text-foreground">
                      {formatNumber(payment.amount / 1e8)}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">
                      {payment.assetId ? maskedAssetId(payment.assetId) : coinName}
                    </span>
                    {payment.assetId && (
                      <Link to={`/asset/${payment.assetId}`} className="text-primary hover:underline text-xs">
                        (detalhes)
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </DetailRow>
          )}

          {/* State changes list */}
          {transaction.stateChanges && transaction.stateChanges.data && transaction.stateChanges.data.length > 0 && (
            <DetailRow label="Mudanças de Estado (State Changes)" icon={Database}>
              <div className="overflow-x-auto rounded-xl border border-border bg-card/40 shadow-sm mt-1 max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Chave (Key)</TableHead>
                      <TableHead className="text-xs font-semibold">Tipo (Type)</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Novo Valor (Value)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.stateChanges.data.map((change: any, index: number) => (
                      <TableRow key={index} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-mono text-xs break-all select-all font-semibold max-w-xs">{change.key}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] bg-muted py-0 px-2 rounded-md">
                            {change.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-right break-all select-all font-bold text-foreground max-w-sm">
                          {JSON.stringify(change.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DetailRow>
          )}
        </>
      );

    case 17: // Update Asset Info
      return (
        <>
          {transaction.assetId && (
            <DetailRow label="ID do Ativo Atualizado" icon={LinkIcon}>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
                <Link to={`/asset/${transaction.assetId}`} className="text-primary hover:underline flex-1 font-semibold">
                  {transaction.assetId}
                </Link>
              </div>
            </DetailRow>
          )}
          <DetailRow label="Novo Nome" icon={Tag}>
            <span className="font-bold text-foreground text-base bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl">
              {transaction.name}
            </span>
          </DetailRow>
          <DetailRow label="Nova Descrição" icon={Database}>
            <p className="text-muted-foreground italic font-normal max-w-2xl leading-relaxed">
              {transaction.description || "Nenhuma descrição fornecida."}
            </p>
          </DetailRow>
        </>
      );

    case 18: // Ethereum Transaction
      return (
        <>
          {transaction.payload && (
            <DetailRow label="Tipo de Payload Ethereum" icon={Code}>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-0.5 text-xs rounded-full">
                {transaction.payload.type}
              </Badge>
            </DetailRow>
          )}
          {transaction.payload?.dApp && (
            <DetailRow label="Contrato dApp Ethereum" icon={Code}>
              <div className="flex items-start gap-2 break-all text-foreground bg-muted/10 hover:bg-muted/25 border border-border/30 rounded-xl p-2.5 transition-colors">
                <Link 
                  to={`/address/${transaction.payload.dApp}`}
                  className="flex-1 font-mono text-xs sm:text-sm text-primary hover:underline font-bold"
                >
                  {transaction.payload.dApp}
                </Link>
              </div>
            </DetailRow>
          )}
          {transaction.payload?.call?.function && (
            <DetailRow label="Função Invocada Ethereum" icon={FileCode}>
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm px-3 py-1 rounded-lg w-fit">
                  {transaction.payload.call.function}()
                </Badge>
                {transaction.payload.call.args && transaction.payload.call.args.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-border bg-card/40 shadow-sm mt-1">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="text-xs font-semibold">Parâmetro (Index)</TableHead>
                          <TableHead className="text-xs font-semibold">Tipo (Type)</TableHead>
                          <TableHead className="text-xs font-semibold text-right">Valor (Value)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transaction.payload.call.args.map((arg: any, index: number) => (
                          <TableRow key={index} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="font-mono text-xs font-semibold"># {index}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] bg-muted py-0 px-2 rounded-md">
                                {arg.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-right break-all select-all font-bold text-foreground">
                              {JSON.stringify(arg.value)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </DetailRow>
          )}
          {transaction.payload?.amount && (
            <DetailRow label="Valor Transferido Ethereum" icon={Coins}>
              <span className="font-tech text-base font-bold text-foreground">
                {formatNumber(transaction.payload.amount / 1e8)} 
                <span className="text-emerald-500 dark:text-emerald-400 ml-1 font-semibold">
                  {transaction.payload?.asset ? maskedAssetId(transaction.payload.asset) : coinName}
                </span>
              </span>
            </DetailRow>
          )}
          {transaction.payload?.recipient && (
            <DetailRow label="Destinatário Ethereum" icon={Key}>
              <Link 
                to={`/address/${transaction.payload.recipient}`}
                className="font-mono text-sm text-primary hover:underline break-all"
              >
                {transaction.payload.recipient}
              </Link>
            </DetailRow>
          )}
          {transaction.bytes && (
            <DetailRow label="Dados Brutos Ethereum (Bytes)" icon={Database}>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-muted/30 p-2 rounded-xl border border-border/40 break-all select-all">
                <span className="flex-1 text-muted-foreground truncate">{transaction.bytes}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 flex-shrink-0"
                  onClick={() => handleCopyToClipboard(transaction.bytes || '', "Raw Bytes")}
                >
                  {copiedFields["Raw Bytes"] ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </DetailRow>
          )}
        </>
      );

    default:
      return null;
  }
};

export default TransactionTypeDetails;
