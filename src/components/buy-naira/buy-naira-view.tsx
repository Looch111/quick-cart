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
import { useAuth } from '@/hooks/use-auth';
import { buyCryptoWithNaira } from '@/app/actions/buy-actions';

const assets = [
  { icon: BtcIcon, name: 'Bitcoin', symbol: 'BTC', priceUsd: 65000 },
  { icon: EthIcon, name: 'Ethereum', symbol: 'ETH', priceUsd: 3500 },
  { icon: UsdcIcon, name: 'USD Coin', symbol: 'USDC', priceUsd: 1 },
];

const NGN_RATE = 1450; // Dummy rate: 1 USD = 1450 NGN

export default function BuyNairaView() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState('BTC');
  const [nairaAmount, setNairaAmount] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [isBuying, setIsBuying] = useState(false);

  const handleNairaAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNairaAmount(value);
    const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol);
    if (value && !isNaN(parseFloat(value)) && selectedAsset) {
      const calculatedCrypto = parseFloat(value) / (selectedAsset.priceUsd * NGN_RATE);
      setCryptoAmount(calculatedCrypto.toFixed(8));
    } else {
      setCryptoAmount('');
    }
  };

  const handleAssetChange = (symbol: string) => {
    setSelectedAssetSymbol(symbol);
    const selectedAsset = assets.find(a => a.symbol === symbol);
     if (nairaAmount && !isNaN(parseFloat(nairaAmount)) && selectedAsset) {
      const calculatedCrypto = parseFloat(nairaAmount) / (selectedAsset.priceUsd * NGN_RATE);
      setCryptoAmount(calculatedCrypto.toFixed(8));
    } else {
      setCryptoAmount('');
    }
  }

  const handleBuy = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    const nairaAmountNum = parseFloat(nairaAmount);
    const cryptoAmountNum = parseFloat(cryptoAmount);
    const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol);

    if (!selectedAsset || isNaN(nairaAmountNum) || nairaAmountNum <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    setIsBuying(true);
    try {
      const result = await buyCryptoWithNaira({
        userId: user.uid,
        assetSymbol: selectedAsset.symbol,
        assetName: selectedAsset.name,
        cryptoAmount: cryptoAmountNum,
        nairaAmount: nairaAmountNum,
      });

      if (result.success) {
        toast({ title: "Success", description: result.message });
        setNairaAmount('');
        setCryptoAmount('');
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <main className="flex-1 space-y-6 p-4 lg:p-6 animate-in fade-in-up-4 duration-500">
      <Card className="shadow-lg max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Buy Crypto with Naira</CardTitle>
          <CardDescription>Fund your wallet easily with a bank transfer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is a simulation. No real money will be transferred. Purchased crypto will be added to your wallet.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="naira-amount">You Spend</Label>
            <Input id="naira-amount" placeholder="e.g., 100,000 NGN" type="number" value={nairaAmount} onChange={handleNairaAmountChange} disabled={isBuying} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="crypto-asset">You Get</Label>
            <Select value={selectedAssetSymbol} onValueChange={handleAssetChange} disabled={isBuying}>
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
          <div className="h-16 flex items-center justify-center rounded-lg bg-muted text-center p-2">
            {cryptoAmount ? (
                <div>
                  <p className="text-sm text-muted-foreground">You will receive approximately</p>
                  <p className="font-bold text-primary text-2xl">{cryptoAmount} {selectedAssetSymbol}</p>
                </div>
            ) : (
                <p className="text-muted-foreground">Enter an amount to see the conversion</p>
            )}
           </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleBuy} disabled={isBuying}>
            {isBuying ? "Processing..." : "Buy with Naira"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
