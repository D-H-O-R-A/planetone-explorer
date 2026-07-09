import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getChainId, getGCSApiUrl } from '@/lib/utils';
import ethAddress2waves from '@waves/node-api-js/cjs/tools/adresses/ethAddress2waves';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  // Convert Ethereum address to Waves address
  const convertEthToWavesAddress = (ethAddress: string): string => {
    try{
      const address = ethAddress2waves(ethAddress, getChainId());
      return address;
    } catch (error) {
      console.error('Error converting Ethereum address to Waves address:', error);
      return null;
    }
  };

  // Resolve alias to address
  const resolveAlias = async (alias: string): Promise<string | null> => {
    try {
      const apiUrl = getGCSApiUrl();
      const response = await fetch(`${apiUrl}/alias/by-alias/${alias}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.address || null;
    } catch (error) {
      console.error('Error resolving alias:', error);
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a valid search query");
      return;
    }
    
    setIsSearching(true);
    setSearchStatus('searching');
    
    const query = searchQuery.trim();
    
    try {
      // Rule 1: If starts with 0x, convert to valid address
      if (query.startsWith('0x')) {
        toast.info("Searching Ethereum address...");
        const convertedAddress = convertEthToWavesAddress(query);
        if (!convertedAddress) {
          setSearchStatus('error');
          toast.error("Checking if is a valid Ethereum Transaction...");
          navigate(`/tx/${query}`);
          
          return;
        }
        setSearchStatus('success');
        toast.success("Ethereum address found! Converting to native address...");
        navigate(`/address/${convertedAddress}`);
        
        return;
      }
      
      // Rule 2: If doesn't start with 0x but is a valid Base58 address with length 34-36, it's an address
      const isBase58Address = /^[1-9A-HJ-NP-Za-km-z]{34,36}$/.test(query);
      if (isBase58Address) {
        toast.info("Searching address...");
        setSearchStatus('success');
        toast.success("Address found!");
        navigate(`/address/${query}`);
        
        return;
      }
      
      // Rule 3: If doesn't start with 0x but has length of 44, it's a token/asset
      if (query.length === 44) {
        toast.info("Searching asset...");
        setSearchStatus('success');
        toast.success("Asset found!");
        navigate(`/asset/${query}`);
        ;
        
      }
      // If none of the rules match, treat as potential block height or transaction ID
      if (!isNaN(Number(query))) {
        toast.info("Searching block...");
        setSearchStatus('success');
        toast.success("Block found!");
        navigate(`/block/${query}`);
        
        return;
      }
      // Rule 4: If doesn't start with 0x and is not a base58 address, treat as an alias
      if (query.length < 37) {
        toast.info("Searching alias...");
        const resolvedAddress = await resolveAlias(query);
        
        if (resolvedAddress) {
          setSearchStatus('success');
          toast.success("Alias resolved to address!");
          navigate(`/address/${resolvedAddress}`);
          
          return;
        } else {
          setSearchStatus('error');
          toast.error("Alias not found or invalid");
          return;
        }
      }
      
      // Default fallback - treat as transaction ID
      toast.info("Searching transaction...");
      setSearchStatus('success');
      toast.success("Transaction found!");
      navigate(`/tx/${query}`);
      
    } catch (error) {
      console.error("Search error:", error);
      setSearchStatus('error');
      toast.error("An error occurred while searching", {
        description: "Please try again with a different query",
        icon: <AlertCircle className="h-4 w-4" />
      });
    } finally {
      setIsSearching(false);
      // Reset status to idle after a short delay
      setTimeout(() => {
        setSearchStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <AnimatePresence mode="wait">
            {searchStatus === 'searching' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                <Search className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <Input
            type="text"
            placeholder="Search by address (0x... or 35 chars), asset (44 chars), alias (<35 chars), block, or transaction..."
            className={`w-full pl-12 pr-28 py-6 text-lg rounded-full shadow-md input-animated bg-white/40 
              ${searchStatus === 'error' ? 'border-green-500/50 focus:border-green-500' : 
              searchStatus === 'success' ? 'border-green-500/50 focus:border-green-500' : 
              'border-primary/20 focus:border-primary/50'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {searchQuery && (
            <button
              type="button"
              className="absolute right-24 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white p-2 rounded-full"
              onClick={() => setSearchQuery('')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={searchStatus}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              type="submit"
              disabled={isSearching}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 px-6 py-5 h-[100%] rounded-full 
                ${searchStatus === 'searching' ? 'bg-primary/70' : 'bg-primary'} 
                hover:bg-primary/90 btn-animated text-white font-bold`}
            >
              {isSearching ? 
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</> : 
                "Search"
              }
            </Button>
          </motion.div>
        </AnimatePresence>
      </form>
      
      {/* Search status message */}
      <AnimatePresence>
        {searchStatus === 'error' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 text-green-500 text-sm flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            No results found. Try a different search term.
          </motion.div>
        )}
        {searchStatus === 'searching' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 text-primary text-sm flex items-center"
          >
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Searching blockchain data...
          </motion.div>
        )}
        {searchStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 text-green-500 text-sm flex items-center"
          >
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            Found! Redirecting...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
