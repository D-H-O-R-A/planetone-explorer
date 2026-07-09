
import { useState, useEffect } from "react";
import TransactionView from "@/components/TransactionView";
import { 
  ArrowLeft, Clock, Database, Copy, ExternalLink, 
  MoreHorizontal, Shield, Globe
} from "lucide-react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { ethTxId2waves } from "@better2better/waves-node-api-js";
import { getFullExplorerUiUrl } from "@/lib/utils";

const TransactionPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showRawData, setShowRawData] = useState(false);
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if(id.substr(0,2) === "0x") {
      // Convert Ethereum transaction ID to Waves format
      const wavesId = ethTxId2waves(id);
      if (wavesId) {
        window.location.href = window.location.origin+ `/tx/${wavesId}`;
      }
    }
    setMounted(true);
    
    setTimeout(() => {
      window.scrollTo(0, 0);
      
      const animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-children');
      animatedElements.forEach(el => {
        el.classList.add('in-view');
      });
    }, 100);
    
    return () => {
      setMounted(false);
    };
  }, [location.pathname]);
  
  const handleCopy = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      toast({
        title: "Copied",
        description: "Transaction ID copied to clipboard",
        duration: 2000,
      });
    }
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`tx-${id}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-transparent text-foreground"
      >
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Mobile-first sticky header */}
          <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-md border-b border-primary/20 py-3 mb-4">
            <div className="flex flex-col gap-3">
              {/* Breadcrumb - hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <Link to="/transactions" className="hover:text-primary transition-colors">Transactions</Link>
                <span>/</span>
                <span className="text-primary">Details</span>
              </div>
              
              {/* Header actions */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Button variant="outline" size="sm" className="h-8 px-2 flex-shrink-0" asChild>
                    <Link to="/transactions">
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Back</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 px-2 flex-shrink-0 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" asChild>
                    <a href={getFullExplorerUiUrl(id)} target="_blank" rel="noopener noreferrer">
                      <Database className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Full Explorer</span>
                    </a>
                  </Button>
                  <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gradient truncate">
                    TX DETAILS
                  </h1>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-panel border border-primary/20">
                    <DropdownMenuLabel className="text-tech text-xs">ACTIONS</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/10" />
                    <DropdownMenuItem onClick={handleCopy} className="group flex cursor-pointer items-center hover:bg-primary/10 text-xs">
                      <Copy className="mr-2 h-3 w-3 group-hover:text-primary" /> 
                      <span className="group-hover:text-primary">Copy TX ID</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowRawData(!showRawData)} className="group flex cursor-pointer items-center hover:bg-primary/10 text-xs">
                      <Database className="mr-2 h-3 w-3 group-hover:text-primary" /> 
                      <span className="group-hover:text-primary">{showRawData ? "Hide" : "View"} Raw Data</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="group flex cursor-pointer items-center hover:bg-primary/10 text-xs" asChild>
                      <a href={getFullExplorerUiUrl(id)} target="_blank" rel="noopener noreferrer">
                        <Database className="mr-2 h-3 w-3 group-hover:text-primary" /> 
                        <span className="group-hover:text-primary">View in Full Explorer</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="group flex cursor-pointer items-center hover:bg-primary/10 text-xs" asChild>
                      <a href={`https://nodes.planetone.io/transactions/info/${id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3 w-3 group-hover:text-primary" /> 
                        <span className="group-hover:text-primary">View in API</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Status badges - responsive layout */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <Badge className="cyber-badge flex items-center gap-1 text-xs h-6">
                  <Clock className="h-2.5 w-2.5" />
                  <span className="hidden xs:inline">Confirmed</span>
                  <span className="xs:hidden">✓</span>
                </Badge>
                <Badge className="cyber-badge flex items-center gap-1 text-xs h-6">
                  <Shield className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">Max Security</span>
                  <span className="sm:hidden">Secure</span>
                </Badge>
                <Badge className="cyber-badge flex items-center gap-1 text-xs h-6">
                  <Globe className="h-2.5 w-2.5" />
                  <span>Chain 80</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Main content */}
          <motion.div variants={itemVariants} className="pb-20 md:pb-8">
            <TransactionView />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TransactionPage;
