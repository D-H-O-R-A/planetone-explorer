import BlockView from "@/components/BlockView";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";

const BlockPage = () => {
  const { height } = useParams();

  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto animate-fade-in space-y-6 pb-20"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Breadcrumb Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-semibold">
          <Link to="/blocks" className="hover:text-emerald-500 transition-colors">
            Blocos
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-mono">
            #{height}
          </span>
        </div>

        <Button variant="ghost" size="sm" asChild className="hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl">
          <Link to="/blocks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Lista
          </Link>
        </Button>
      </div>

      {/* Main High-Fidelity Block Explorer Container */}
      <div className="pb-10">
        <BlockView />
      </div>

    </motion.div>
  );
};

export default BlockPage;
