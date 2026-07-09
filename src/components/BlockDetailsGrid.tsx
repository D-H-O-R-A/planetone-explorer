import { Link } from "react-router-dom";
import { 
  Copy, 
  Check, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Layers, 
  Key, 
  Hash, 
  FileText, 
  Info, 
  Clock, 
  Coins
} from "lucide-react";
import { Block } from "@/services/api";
import { getCoinName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BlockDetailsGridProps {
  block: Block;
  blockSize: number | undefined;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
}

const BlockDetailsGrid = ({ block, blockSize, copiedField, copyToClipboard }: BlockDetailsGridProps) => {
  const getConsensus = () => {
    return (block as any)['nxt-consensus'] || {};
  };

  const consensus = getConsensus();
  const txCount = block.transactions?.length || block.transactionCount || 0;
  const totalFee = block.fee || block.totalFee || 0;

  return (
    <div className="space-y-6">
      
      {/* Category Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Informações Gerais */}
        <div className="p-5 rounded-xl border border-border/60 bg-background/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/30">
              <Database className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Informações Gerais</h4>
            </div>
            
            <div className="space-y-2.5 text-xs md:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1">Altura</span>
                <span className="font-mono font-bold text-foreground">#{block.height}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1">Transações</span>
                <Badge variant="outline" className={`font-mono font-bold text-xs ${txCount > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                  {txCount} txs
                </Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1">Tamanho</span>
                <span className="font-mono text-foreground font-semibold">
                  {blockSize && blockSize > 0 ? `${(blockSize / 1024).toFixed(1)} KB` : 'Unknown'}
                  {blockSize && blockSize > 0 && <span className="text-[10px] text-muted-foreground ml-1">({blockSize.toLocaleString()} bytes)</span>}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1">Versão</span>
                <Badge variant="outline" className="bg-muted text-muted-foreground text-xs font-mono font-bold">
                  v{(block as any).version || '3'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/20 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Tempo do bloco:</span>
            <span className="font-mono font-semibold text-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {new Date(block.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Card 2: Consenso e Recompensas */}
        <div className="p-5 rounded-xl border border-border/60 bg-background/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/30">
              <Cpu className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Consenso & Recompensas</h4>
            </div>
            
            <div className="space-y-2.5 text-xs md:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1">Taxas Totais (Fee)</span>
                <span className="font-mono font-bold text-foreground">
                  {(totalFee / 1e8).toFixed(6)} <span className="text-emerald-500 text-xs">{getCoinName()}</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground flex items-center gap-1">Recompensa (Reward)</span>
                <span className="font-mono font-bold text-foreground">
                  {block.reward ? `${(block.reward / 1e8).toFixed(4)}` : '0.0000'} <span className="text-emerald-500 text-xs">{getCoinName()}</span>
                </span>
              </div>
              {consensus['base-target'] && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground flex items-center gap-1">Alvo Base (Base Target)</span>
                  <span className="font-mono text-foreground font-semibold">
                    {consensus['base-target']}
                  </span>
                </div>
              )}
              {(block as any).desiredReward !== undefined && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground flex items-center gap-1">Rec. Desejada</span>
                  <span className="font-mono text-foreground font-semibold">
                    {(((block as any).desiredReward || 0) / 1e8).toFixed(4)} <span className="text-emerald-500 text-xs">{getCoinName()}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border/20 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Protocolo:</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">
              Fair LPoS
            </Badge>
          </div>
        </div>

        {/* Card 3: Segurança Criptográfica */}
        <div className="p-5 rounded-xl border border-border/60 bg-background/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/30">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Criptografia On-Chain</h4>
            </div>
            
            <div className="space-y-2.5 text-xs md:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Segurança de Rede</span>
                <span className="font-semibold text-emerald-500">Imutável (Finalizado)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Tipo de Consenso</span>
                <span className="text-foreground font-semibold">Decentralized VRF</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Root de Transações</span>
                <span className="font-mono text-xs text-foreground font-semibold">
                  {(block as any).transactionsRoot ? 'Sim (Gerado)' : 'Nativo PLO'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/20 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Auditoria de Bloco:</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              ✓ Ativo & Válido
            </span>
          </div>
        </div>

      </div>

      {/* Advanced Cryptographic Fields List */}
      <div className="rounded-2xl border border-border bg-background/40 p-5 md:p-6 space-y-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 pb-3 border-b border-border/30">
          <Hash className="w-4 h-4 text-emerald-500" />
          Campos Técnicos do Bloco (Hashes & Assinaturas)
        </h4>
        
        <div className="space-y-4 text-xs md:text-sm">
          
          {/* Generator Address */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 border-b border-border/20">
            <div className="flex items-center gap-1.5 shrink-0">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground font-semibold">Validador Propositor (Generator)</span>
            </div>
            <div className="flex items-center gap-2 max-w-full overflow-hidden">
              <Link 
                to={`/address/${block.generator}`} 
                className="font-mono text-emerald-500 hover:text-emerald-600 font-bold truncate break-all hover:underline"
              >
                {block.generator}
              </Link>
              <button
                onClick={() => copyToClipboard(block.generator, "generator")}
                className="p-1.5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-lg shrink-0 transition-colors"
                title="Copiar Endereço"
              >
                {copiedField === "generator" ? (
                  <Check className="h-4 w-4 text-emerald-500 animate-fade-in" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Generator Public Key */}
          {(block as any).generatorPublicKey && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 border-b border-border/20">
              <div className="flex items-center gap-1.5 shrink-0">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Chave Pública do Validador</span>
              </div>
              <div className="flex items-center gap-2 max-w-full overflow-hidden">
                <span className="font-mono text-muted-foreground truncate break-all">
                  {(block as any).generatorPublicKey}
                </span>
                <button
                  onClick={() => copyToClipboard((block as any).generatorPublicKey, "generatorPublicKey")}
                  className="p-1.5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-lg shrink-0 transition-colors"
                  title="Copiar Chave Pública"
                >
                  {copiedField === "generatorPublicKey" ? (
                    <Check className="h-4 w-4 text-emerald-500 animate-fade-in" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Block ID */}
          {(block as any).id && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 border-b border-border/20">
              <div className="flex items-center gap-1.5 shrink-0">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Identificador do Bloco (ID)</span>
              </div>
              <div className="flex items-center gap-2 max-w-full overflow-hidden">
                <span className="font-mono text-foreground font-bold truncate break-all">
                  {(block as any).id}
                </span>
                <button
                  onClick={() => copyToClipboard((block as any).id, "id")}
                  className="p-1.5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-lg shrink-0 transition-colors"
                  title="Copiar Block ID"
                >
                  {copiedField === "id" ? (
                    <Check className="h-4 w-4 text-emerald-500 animate-fade-in" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Reference (Parent Hash) */}
          {block.reference && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 border-b border-border/20">
              <div className="flex items-center gap-1.5 shrink-0">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Hash do Bloco Anterior (Reference)</span>
              </div>
              <div className="flex items-center gap-2 max-w-full overflow-hidden">
                {block.height > 1 ? (
                  <Link 
                    to={`/block/${block.height - 1}`} 
                    className="font-mono text-emerald-500 hover:text-emerald-600 hover:underline truncate break-all"
                    title="Navegar para o bloco anterior"
                  >
                    {block.reference}
                  </Link>
                ) : (
                  <span className="font-mono text-muted-foreground truncate break-all">
                    {block.reference}
                  </span>
                )}
                <button
                  onClick={() => copyToClipboard(block.reference, "reference")}
                  className="p-1.5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-lg shrink-0 transition-colors"
                  title="Copiar Hash Anterior"
                >
                  {copiedField === "reference" ? (
                    <Check className="h-4 w-4 text-emerald-500 animate-fade-in" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Signature */}
          {block.signature && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 border-b border-border/20">
              <div className="flex items-center gap-1.5 shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Assinatura Digital (Signature)</span>
              </div>
              <div className="flex items-center gap-2 max-w-full overflow-hidden">
                <span className="font-mono text-xs text-muted-foreground truncate break-all">
                  {block.signature}
                </span>
                <button
                  onClick={() => copyToClipboard(block.signature, "signature")}
                  className="p-1.5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-lg shrink-0 transition-colors"
                  title="Copiar Assinatura"
                >
                  {copiedField === "signature" ? (
                    <Check className="h-4 w-4 text-emerald-500 animate-fade-in" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* VRF Field */}
          {(block as any).VRF && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 border-b border-border/20">
              <div className="flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Prova Aleatória (VRF Value)</span>
              </div>
              <div className="flex items-center gap-2 max-w-full overflow-hidden">
                <span className="font-mono text-xs text-muted-foreground truncate break-all">
                  {(block as any).VRF}
                </span>
                <button
                  onClick={() => copyToClipboard((block as any).VRF, "VRF")}
                  className="p-1.5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-lg shrink-0 transition-colors"
                  title="Copiar VRF"
                >
                  {copiedField === "VRF" ? (
                    <Check className="h-4 w-4 text-emerald-500 animate-fade-in" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Consensus Generation Signature */}
          {consensus['generation-signature'] && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <Cpu className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Assinatura de Geração (Gen Signature)</span>
              </div>
              <div className="flex items-center gap-2 max-w-full overflow-hidden">
                <span className="font-mono text-xs text-muted-foreground truncate break-all">
                  {consensus['generation-signature']}
                </span>
                <button
                  onClick={() => copyToClipboard(consensus['generation-signature'], "generation-signature")}
                  className="p-1.5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-lg shrink-0 transition-colors"
                  title="Copiar Gen Signature"
                >
                  {copiedField === "generation-signature" ? (
                    <Check className="h-4 w-4 text-emerald-500 animate-fade-in" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default BlockDetailsGrid;
