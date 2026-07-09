
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Droplets, Loader2 } from 'lucide-react';
import { getCoinName } from '@/lib/utils';

const Faucet = () => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaCompleted, setCaptchaCompleted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Simple captcha simulation - replace with real captcha
  const [captchaQuestion, setCaptchaQuestion] = useState(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { question: `${num1} + ${num2} = ?`, answer: num1 + num2 };
  });
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const handleCaptchaSubmit = () => {
    if (parseInt(captchaAnswer) === captchaQuestion.answer) {
      setCaptchaCompleted(true);
      toast.success('Captcha verified successfully!');
    } else {
      toast.error('Incorrect captcha answer. Please try again.');
      // Generate new question
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptchaQuestion({ question: `${num1} + ${num2} = ?`, answer: num1 + num2 });
      setCaptchaAnswer('');
    }
  };

const handleFaucetRequest = async () => {
  if (!address.trim()) {
    toast.error('Please enter a valid address');
    return;
  }

  if (!captchaCompleted) {
    toast.error('Please complete the captcha first');
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch('https://faucet-j7f7udyx3a-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address })
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(
        <>
          ✅ Tokens enviados com sucesso! <br />
          <span className="text-sm">Para: {data.to}</span><br />
          <span className="text-sm">TxID: {data.txId}</span><br />
          <span className="text-sm">Valor: {data.amount}</span>
        </>
      );

      setAddress('');
      setCaptchaCompleted(false);
      setCaptchaAnswer('');
      setIsOpen(false);

      // Nova pergunta do captcha
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptchaQuestion({ question: `${num1} + ${num2} = ?`, answer: num1 + num2 });

    } else {
      toast.error(data.error || 'Erro ao solicitar tokens. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    toast.error('Erro de conexão. Tente novamente.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-orange-500/10 border-orange-500/40 hover:border-orange-500 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 transition-all duration-200"
        >
          <Droplets className="h-4 w-4 mr-2" />
          Faucet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-orange-400 flex items-center">
            <Droplets className="h-5 w-5 mr-2" />
            Testnet Faucet
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Receive free {getCoinName()} to test on the testnet. Limit of one request per address every 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-300">
              Wallet Address
            </Label>
            <Input
              id="address"
              placeholder="3M..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
            />
          </div>
          
          {!captchaCompleted ? (
            <div className="space-y-2">
              <Label className="text-gray-300">Captcha</Label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-800 rounded p-3 text-center text-white font-mono">
                  {captchaQuestion.question}
                </div>
                <Input
                  placeholder="Answer"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-24 bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                />
                <Button 
                  onClick={handleCaptchaSubmit}
                  variant="outline"
                  size="sm"
                  className="border-orange-500/40 text-orange-400 hover:bg-orange-500/20"
                >
                  Verify
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-green-400 text-sm flex items-center">
              ✓ Captcha verified
            </div>
          )}
          
          <Button 
            onClick={handleFaucetRequest}
            disabled={!address.trim() || !captchaCompleted || isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Droplets className="h-4 w-4 mr-2" />
                Request {getCoinName()}
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-400 text-center">
            You will receive 10 test {getCoinName()} to perform transactions on the testnet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Faucet;
