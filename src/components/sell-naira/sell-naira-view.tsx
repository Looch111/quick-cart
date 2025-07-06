"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BtcIcon } from '@/components/icons/btc-icon';
import { EthIcon } from '@/components/icons/eth-icon';
import { UsdcIcon } from '@/components/icons/usdc-icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const assets = [
  { icon: BtcIcon, name: 'Bitcoin', symbol: 'BTC', priceUsd: 65000 },
  { icon: EthIcon, name: 'Ethereum', symbol: 'ETH', priceUsd: 3500 },
  { icon: UsdcIcon, name: 'USD Coin', symbol: 'USDC', priceUsd: 1 },
];

const NGN_RATE = 1450; // Dummy rate: 1 USD = 1450 NGN

export default function SellNairaView() {
  const { toast } = useToast();
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [nairaAmount, setNairaAmount] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol);
    if (value && !isNaN(parseFloat(value)) && selectedAsset) {
      const calculatedNaira = parseFloat(value) * selectedAsset.priceUsd * NGN_RATE;
      setNairaAmount(calculatedNaira.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }));
    } else {
      setNairaAmount('');
    }
  };

  const handleAssetChange = (symbol: string) => {
    setSelectedAssetSymbol(symbol);
    const selectedAsset = assets.find(a => a.symbol === symbol);
     if (amount && !isNaN(parseFloat(amount)) && selectedAsset) {
      const calculatedNaira = parseFloat(amount) * selectedAsset.priceUsd * NGN_RATE;
      setNairaAmount(calculatedNaira.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }));
    } else {
      setNairaAmount('');
    }
  }

  const handleSell = () => {
    toast({
      title: "Sale Submitted",
      description: "Your request to sell crypto for Naira is being processed.",
    });
  };

  return (
    <main className="flex-1 space-y-6 p-4 lg:p-6 animate-in fade-in-up-4 duration-500">
      <Card className="shadow-lg max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Sell Crypto for Naira</CardTitle>
          <CardDescription>Get Naira directly to your bank account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Payouts will be sent to the bank account specified in your <a href="/settings" className="font-bold underline hover:text-primary">Settings</a>.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="crypto-asset">You Sell</Label>
            <Select value={selectedAssetSymbol} onValueChange={handleAssetChange}>
              <SelectTrigger id="crypto-asset">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map(asset => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    <div className="flex items-center gap-2">
                      <asset.icon className="w-5 h-5" />
                      <span>{asset.name} ({asset.symbol})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="crypto-amount">Amount</Label>
            <Input id="crypto-amount" placeholder="0.00" type="number" value={amount} onChange={handleAmountChange} />
          </div>
          <div className="h-16 flex items-center justify-center rounded-lg bg-muted text-center p-2">
            {nairaAmount ? (
                <div>
                  <p className="text-sm text-muted-foreground">You will receive approximately</p>
                  <p className="font-bold text-primary text-2xl">{nairaAmount}</p>
                </div>
            ) : (
                <p className="text-muted-foreground">Enter an amount to see the conversion</p>
            )}
           </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSell}>Sell for Naira</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
