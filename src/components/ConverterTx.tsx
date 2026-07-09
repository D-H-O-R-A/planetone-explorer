import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ethTxId2waves } from "@waves/node-api-js";
import { CHAIN_ID, getCoinName } from '@/lib/utils';

// Simple props for display mode
interface ConverterItemSimpleProps {
  title: string;
  address: string;
  isCopied: boolean;
  onCopy: () => void;
}

export type ConverterItemProps = Partial<ConverterItemSimpleProps>;


export const ConverterTx = (props: ConverterItemProps) => {
  const { title, address, isCopied, onCopy } = props;

  // Converter states
  const [ethValue, setEthValue] = useState('');
  const [wavesValue, setWavesValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState<string | null>(null);

  const handleEthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEthValue(e.target.value);
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    if (!text) return;

    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`${type} copied to clipboard`);
      },
      (err) => {
        console.error('Copy error:', err);
        toast.error("Failed to copy");
      }
    );
  };

  const handleEthToWaves = async () => {
    if (!ethValue) {
      toast.error("Enter the ETH Tx to convert");
      return;
    }

    setIsLoading(true);
    setConversionResult(null);

    try {
      const result = ethTxId2waves(ethValue);
      setWavesValue(result);

      setConversionResult(
        `ETH ${title}: "${ethValue}" converted to ${getCoinName()}: ${result}`
      );
    } catch (error) {
      console.error(`Error converting ${title}:`, error);
      toast.error(`Failed to convert ${title}`);
      setConversionResult(
        `Error converting ETH ${title} "${ethValue}" to ${getCoinName()}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-lg sm:text-xl font-semibold break-words">
        {title} — ETH → {getCoinName()}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="pt-4 px-4 pb-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Ethereum {title}
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={ethValue}
                    onChange={handleEthInputChange}
                    placeholder="Enter ETH Tx (starts with 0x...)"
                    className="text-sm break-all"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(ethValue, 'ETH Tx')}
                    disabled={!ethValue}
                    className="h-10 px-4 whitespace-nowrap"
                  >
                    <Copy size={16} />
                    <span className="ml-2 hidden sm:inline">Copy</span>
                  </Button>
                </div>
              </div>

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleEthToWaves}
                  className="w-full text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-background border-r-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <ArrowRight size={16} className="mr-2" />
                  )}
                  Convert to {getCoinName()} Tx
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Output field */}
        {wavesValue && (
          <Card className="border border-primary/20 bg-primary/5">
            <CardContent className="pt-4 px-4 pb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  {getCoinName()} Tx (converted)
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={wavesValue}
                    readOnly
                    className="font-mono text-xs sm:text-sm break-all"
                  />

                  <Button
                    onClick={() =>
                      handleCopyToClipboard(wavesValue, `${getCoinName()} Tx`)
                    }
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 whitespace-nowrap"
                  >
                    <Copy size={16} />
                    <span className="ml-2 hidden sm:inline">Copy</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Conversion result */}
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
