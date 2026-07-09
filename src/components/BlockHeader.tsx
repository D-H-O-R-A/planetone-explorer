import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatBlockTime } from "@/utils/formatter";
import { formatDistance } from "date-fns";
import { Block } from "@/services/api";
import { Blocks, Clock } from "lucide-react";

interface BlockHeaderProps {
  block: Block;
}

const BlockHeader = ({ block }: BlockHeaderProps) => {
  return (
    <div className="mb-6 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Blocks className="w-6 h-6 text-emerald-500" />
          <span>Bloco</span>
          <Link to={`/block/${block.height}`} className="font-mono text-emerald-500 hover:text-emerald-600 transition-colors">
            #{block.height}
          </Link>
        </h2>
        
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono font-bold text-xs py-0.5">
          {formatBlockTime(new Date(block.timestamp))}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        <Clock className="w-4 h-4 shrink-0" />
        Emitido e validado {formatDistance(new Date(block.timestamp), new Date(), { addSuffix: true })}
      </p>
    </div>
  );
};

export default BlockHeader;
