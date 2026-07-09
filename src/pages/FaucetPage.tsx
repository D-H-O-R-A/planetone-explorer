import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Droplets, Loader2, KeyRound, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getCoinName, isTestnet } from '@/lib/utils';

const FaucetPage = () => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txId, setTxId] = useState('');
  const [amountSent, setAmountAmountSent] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isDragging, setIsVerifiedDragging] = useState(false);

  const dragX = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(250);

  // Recalculate track width for the drag constraint
  useEffect(() => {
    if (trackRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      // Handle width is 56px (w-14)
      setMaxDrag(trackWidth - 56 - 8); // subtracting padding/border spacing
    }
  }, []);

  // Map dragX to progress percentage and background gradients
  const progress = useTransform(dragX, [0, maxDrag], [0, 100]);
  const handleBg = useTransform(
    dragX,
    [0, maxDrag],
    ['rgba(0, 102, 255, 0.2)', 'rgba(0, 224, 84, 0.4)']
  );

  // Validate waves address: usually length is 35 and starts with 3 (3P or 3S etc)
  const isValidAddress = (addr: string) => {
    const trimmed = addr.trim();
    const isBase58 = /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed);
    return isBase58 && trimmed.length >= 34 && trimmed.length <= 36;
  };

  const handleDragEnd = () => {
    const currentX = dragX.get();
    if (currentX >= maxDrag - 10) {
      setIsVerified(true);
      toast.success('Security check completed successfully!');
    } else {
      // Snap back to start
      dragX.set(0);
      setIsVerified(false);
    }
  };

  const resetFaucet = () => {
    setAddress('');
    setIsVerified(false);
    setIsSuccess(false);
    setTxId('');
    setAmountAmountSent('');
    dragX.set(0);
  };

  const handleFaucetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    if (!isValidAddress(address)) {
      toast.error('Invalid Planet One address format. Addresses must be 35 characters long and start with "3".');
      return;
    }

    if (!isVerified) {
      toast.error('Please slide the planet key to unlock faucet verification.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://faucet-j7f7udyx3a-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: address.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTxId(data.txId || 'N/A');
        setAmountAmountSent(data.amount || `10 ${getCoinName()}`);
        toast.success('Tokens requested successfully!');
      } else {
        toast.error(data.error || 'Failed to request tokens. Please try again.');
        // Reset slider so they have to solve it again on failure
        setIsVerified(false);
        dragX.set(0);
      }
    } catch (error) {
      console.error('Faucet request error:', error);
      toast.error('Connection error. Please try again.');
      setIsVerified(false);
      dragX.set(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 md:px-8 relative overflow-hidden">
      {/* Dynamic Glowing background nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[100px] animate-pulse delay-2000"></div>

      <div className="container max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="glass-card p-6 md:p-10 border border-primary/15 rounded-2xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            {/* Glowing top line accent */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-emerald-500 to-primary"></div>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full border border-primary/25 mb-4 shadow-glow-sm">
                <Droplets className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-mono tracking-wider text-gradient mb-3">
                TESTNET FAUCET
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
                Receive free <span className="text-primary font-bold">{getCoinName()}</span> tokens to deploy, execute, and test dApps on the Planet One Testnet network.
              </p>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div className="inline-flex items-center justify-center p-2 bg-emerald-500/15 rounded-full border border-emerald-500/30 mb-2">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>
                
                <h3 className="text-2xl font-bold font-mono text-emerald-400">Request Successful!</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Your test tokens are on the way. Below are the details of your faucet distribution:
                </p>

                <div className="bg-black/40 rounded-xl p-5 border border-emerald-500/20 max-w-lg mx-auto text-left font-mono text-sm space-y-3">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground text-xs uppercase">Target Address:</span>
                    <span className="text-white font-semibold break-all text-xs md:text-sm">{address}</span>
                  </div>
                  <div className="h-[1px] bg-white/5"></div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground text-xs uppercase">Amount Distributed:</span>
                    <span className="text-emerald-400 font-bold">{amountSent}</span>
                  </div>
                  <div className="h-[1px] bg-white/5"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs uppercase">Transaction Hash (TxID):</span>
                    <span className="text-primary hover:underline break-all text-xs cursor-pointer select-all mt-1" onClick={() => {
                      navigator.clipboard.writeText(txId);
                      toast.success('TxID copied to clipboard!');
                    }}>
                      {txId}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={resetFaucet}
                    className="bg-primary hover:bg-primary/90 text-white font-mono px-8 py-6 rounded-xl border border-primary/20 hover:shadow-glow transition-all"
                  >
                    Request Again
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleFaucetRequest} className="space-y-6 md:space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="address" className="text-sm font-mono text-gray-300 flex items-center">
                      <KeyRound className="h-4 w-4 mr-2 text-primary" /> Wallet Address
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      35 CHARS (Prefix '3')
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="address"
                      type="text"
                      placeholder="3M... or 3S... address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isLoading}
                      className="bg-black/50 border-primary/20 text-white placeholder-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary py-6 pl-5 pr-12 rounded-xl text-sm md:text-base font-mono transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40">
                      <Globe className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Micro-Interaction Verification Slider */}
                <div className="space-y-3">
                  <Label className="text-sm font-mono text-gray-300 flex justify-between items-center">
                    <span>Security Verification</span>
                    <span className="text-[11px] text-primary font-semibold">
                      {isVerified ? '✓ VERIFIED' : 'SLIDE TO VERIFY'}
                    </span>
                  </Label>

                  <div 
                    ref={trackRef}
                    className={`h-16 w-full rounded-2xl relative flex items-center p-1 border transition-colors ${
                      isVerified 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-black/50 border-primary/25'
                    }`}
                  >
                    {/* Progress Fill bar */}
                    <motion.div 
                      className="absolute left-1 top-1 bottom-1 rounded-xl bg-gradient-to-r from-primary/30 to-emerald-500/20 z-0"
                      style={{ width: progress }}
                    />

                    {/* Placeholder text in track */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                      <span className={`text-xs md:text-sm font-mono tracking-widest font-semibold transition-all duration-300 ${
                        isVerified 
                          ? 'text-emerald-400 font-bold' 
                          : 'text-muted-foreground/60'
                      }`}>
                        {isVerified ? '✓ SECURITY VERIFIED' : 'SLIDE KEY TO THE RIGHT'}
                      </span>
                    </div>

                    {/* Draggable Handle representing a planet */}
                    <motion.div
                      drag={isVerified ? false : "x"}
                      dragConstraints={{ left: 0, right: maxDrag }}
                      dragElastic={0.1}
                      dragMomentum={false}
                      style={{ x: dragX, backgroundColor: handleBg }}
                      onDragStart={() => setIsVerifiedDragging(true)}
                      onDragEnd={handleDragEnd}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing border relative z-20 transition-all ${
                        isVerified 
                          ? 'border-emerald-500 text-emerald-400' 
                          : 'border-primary/40 text-primary hover:border-primary'
                      }`}
                    >
                      <motion.div
                        animate={isDragging && !isVerified ? { rotate: 360 } : {}}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      >
                        <Droplets className="h-6 w-6" />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={!address.trim() || !isVerified || isLoading}
                  className={`w-full py-7 rounded-xl font-mono text-base font-bold transition-all border duration-300 ${
                    isVerified && !isLoading
                      ? 'bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-white border-primary/10 shadow-glow'
                      : 'bg-white/5 text-muted-foreground border-white/5 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      PROCESSING DISPENSATION...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center tracking-wider">
                      REQUEST 10 {getCoinName()}
                    </span>
                  )}
                </Button>
                
                <p className="text-center font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest leading-relaxed">
                  Faucet limit is 1 request per address and IP every 24 hours.
                </p>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FaucetPage;
