
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Copy, Check, ArrowDownUp } from 'lucide-react';
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getCoinName } from "@/lib/utils";
// Original props for the full converter
interface ConverterItemFullProps {
  title: string;
  convertW2E: (value: string) => string | Promise<string>;
  convertE2W: (value: string) => string | Promise<string>;
}

// New simplified props for the address display component
interface ConverterItemSimpleProps {
  title: string;
  address: string;
  isCopied: boolean;
  onCopy: () => void;
}

// Export type that includes both possible prop types using discriminated union
export type ConverterItemProps = ConverterItemFullProps | ConverterItemSimpleProps;

// Helper type guard to determine which prop type we're dealing with
function isSimpleProps(props: ConverterItemProps): props is ConverterItemSimpleProps {
  return 'address' in props;
}

export const ConverterItem = (props: ConverterItemProps) => {
  // If we're using the simple props version (for address display)
  if (isSimpleProps(props)) {
    const { title, address, isCopied, onCopy } = props;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <div className="text-sm sm:text-base font-medium break-words">{title}</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={address}
            readOnly
            className="font-mono text-xs sm:text-sm break-all"
          />
          <Button 
            onClick={onCopy} 
            variant="outline"
            size="sm"
            className="h-10 px-4 whitespace-nowrap"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            <span className="ml-2 hidden sm:inline">Copy</span>
          </Button>
        </div>
      </motion.div>
    );
  }

  // Original full converter implementation
  const { title, convertW2E, convertE2W } = props;
  const [wavesValue, setWavesValue] = useState('');
  const [ethValue, setEthValue] = useState('');
  const [isLoadingW2E, setIsLoadingW2E] = useState(false);
  const [isLoadingE2W, setIsLoadingE2W] = useState(false);
  const [lastConverted, setLastConverted] = useState<'waves' | 'eth' | null>(null);
  const [conversionResult, setConversionResult] = useState<string | null>(null);

  const handleWavesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWavesValue(e.target.value);
    setLastConverted('waves');
  };

  const handleEthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEthValue(e.target.value);
    setLastConverted('eth');
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`${type} copied to clipboard`);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast.error("Failed to copy to clipboard");
      }
    );
  };

  const handleWavesToEth = async () => {
    if (!wavesValue) {
      toast.error(`Please enter a ${getCoinName()} value to convert`);
      return;
    }
    
    setIsLoadingW2E(true);
    setConversionResult(null);
    
    try {
      const result = await Promise.resolve(convertW2E(wavesValue));
      setEthValue(result);
      
      // Set conversion result to display
      setConversionResult(`${getCoinName()} ${title} "${wavesValue}" converted to ETH: ${result}`);
      
      // Feedback animation
      setLastConverted('eth');
    } catch (error) {
      console.error(`Error converting ${title}:`, error);
      toast.error(`Failed to convert ${title}`);
      setConversionResult(`Error converting ${getCoinName()} ${title} "${wavesValue}" to ETH`);
    } finally {
      setIsLoadingW2E(false);
    }
  };

  const handleEthToWaves = async () => {
    if (!ethValue) {
      toast.error("Please enter an Ethereum value to convert");
      return;
    }
    
    setIsLoadingE2W(true);
    setConversionResult(null);
    
    try {
      const result = await Promise.resolve(convertE2W(ethValue));
      setWavesValue(result);
      
      // Set conversion result to display
      setConversionResult(`ETH ${title} "${ethValue}" converted to ${getCoinName()}: ${result}`);
      
      // Feedback animation
      setLastConverted('waves');
    } catch (error) {
      console.error(`Error converting ${title}:`, error);
      toast.error(`Failed to convert ${title}`);
      setConversionResult(`Error converting ETH ${title} "${ethValue}" to ${getCoinName()}`);
    } finally {
      setIsLoadingE2W(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-lg sm:text-xl font-semibold break-words">{title} Converter</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <Card className={`border ${lastConverted === 'waves' ? 'border-primary' : 'border-primary/10'} bg-primary/5 transition-all duration-300`}>
          <CardContent className="pt-4 px-4 pb-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground break-words">{getCoinName()} {title}</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={wavesValue}
                    onChange={handleWavesInputChange}
                    placeholder={`Enter ${getCoinName()} ${title} (starts with 3)`}
                    className={`text-sm break-all ${lastConverted === 'waves' ? 'ring-1 ring-primary' : ''}`}
                  />
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyToClipboard(wavesValue, `${getCoinName()} address`)}
                      disabled={!wavesValue}
                      className="h-10 px-4 whitespace-nowrap"
                    >
                      <Copy size={16} />
                      <span className="ml-2 hidden sm:inline">Copy</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleWavesToEth} 
                  className="w-full text-sm"
                  disabled={isLoadingW2E}
                >
                  {isLoadingW2E ? (
                    <div className="w-4 h-4 border-2 border-background border-r-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <ArrowRight size={16} className="mr-2" />
                  )}
                  Convert to ETH
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border ${lastConverted === 'eth' ? 'border-primary' : 'border-primary/10'} bg-primary/5 transition-all duration-300`}>
          <CardContent className="pt-4 px-4 pb-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground break-words">Ethereum {title}</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={ethValue}
                    onChange={handleEthInputChange}
                    placeholder={`Enter ETH ${title} (starts with 0x)`}
                    className={`text-sm break-all ${lastConverted === 'eth' ? 'ring-1 ring-primary' : ''}`}
                  />
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyToClipboard(ethValue, 'ETH address')}
                      disabled={!ethValue}
                      className="h-10 px-4 whitespace-nowrap"
                    >
                      <Copy size={16} />
                      <span className="ml-2 hidden sm:inline">Copy</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleEthToWaves} 
                  className="w-full text-sm"
                  disabled={isLoadingE2W}
                >
                  {isLoadingE2W ? (
                    <div className="w-4 h-4 border-2 border-background border-r-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <ArrowRight size={16} className="mr-2" />
                  )}
                  Convert to {getCoinName()}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile quick swap button */}
        <div className="flex justify-center items-center">
          <motion.div 
            whileTap={{ rotate: 180, scale: 0.9 }} 
            className="rounded-full bg-primary/10 p-3"
          >
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => {
                if (wavesValue && !ethValue) {
                  handleWavesToEth();
                } else if (!wavesValue && ethValue) {
                  handleEthToWaves();
                } else if (wavesValue && ethValue) {
                  // Swap values
                  const temp = wavesValue;
                  setWavesValue(ethValue);
                  setEthValue(temp);
                }
              }}
            >
              <ArrowDownUp className="h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Conversion result display */}
      {conversionResult && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20 break-all"
        >
          <p className="text-sm break-words">{conversionResult}</p>
        </motion.div>
      )}
    </motion.div>
  );
};
