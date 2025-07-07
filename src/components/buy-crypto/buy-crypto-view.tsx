"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { Info, Loader2, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getPrices } from '@/app/actions/pricing-actions';
import type { AssetPrice } from '@/services/market-data-service';
import { buyCrypto } from '@/ai/flows/buy-crypto-flow';

const assetIcons: { [key: string]: React.ElementType } = {
  BTC: BtcIcon,
  ETH: EthIcon,
  USDC: UsdcIcon,
};

const assetList = [
  { name: 'Bitcoin', symbol: 'BTC' },
  { name: 'Ethereum', symbol: 'ETH' },
  { name: 'USD Coin', symbol: 'USDC' },
];

const NGN_RATE = 1450; // Dummy rate: 1 USD = 1450 NGN

export default function BuyCryptoView() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState('BTC');
  const [nairaAmount, setNairaAmount] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [prices, setPrices] = useState<AssetPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const nairaBalance = profile?.nairaBalance ? parseFloat(profile.nairaBalance) : 0;

  const fetchAssetPrices = useCallback(async () => {
    setIsLoadingPrices(true);
    try {
      const symbols = assetList.map(a => a.symbol);
      const fetchedPrices = await getPrices(symbols);
      setPrices(fetchedPrices);
    } catch (error) {
      toast({ title: "Error", description: "Could not load asset prices.", variant: "destructive" });
    } finally {
      setIsLoadingPrices(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAssetPrices();
  }, [fetchAssetPrices]);

  const updateCryptoAmount = useCallback((nairaValue: string, assetSymbol: string) => {
    const selectedAssetPrice = prices.find(p => p.symbol === assetSymbol)?.priceUsd;
    if (nairaValue && !isNaN(parseFloat(nairaValue)) && selectedAssetPrice) {
      const calculatedCrypto = parseFloat(nairaValue) / (selectedAssetPrice * NGN_RATE);
      setCryptoAmount(calculatedCrypto.toFixed(8));
    } else {
      setCryptoAmount('');
    }
  }, [prices]);

  const handleNairaAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNairaAmount(value);
    updateCryptoAmount(value, selectedAssetSymbol);
  };

  const handleAssetChange = (symbol: string) => {
    setSelectedAssetSymbol(symbol);
    updateCryptoAmount(nairaAmount, symbol);
  }

  const handleBuy = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    const nairaAmountNum = parseFloat(nairaAmount);
    const selectedAsset = assetList.find(a => a.symbol === selectedAssetSymbol);

    if (!selectedAsset || isNaN(nairaAmountNum) || nairaAmountNum <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

     if (nairaAmountNum > nairaBalance) {
      toast({ title: "Error", description: "Insufficient Naira balance.", variant: "destructive" });
      return;
    }

    setIsBuying(true);
    try {
      const result = await buyCrypto({
        userId: user.uid,
        assetSymbol: selectedAsset.symbol,
        assetName: selectedAsset.name,
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
          <CardTitle className="font-headline">Buy Crypto</CardTitle>
          <CardDescription>Use your Naira balance to buy crypto instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Alert variant="default" className="bg-primary/10 border-primary/20">
            <Wallet className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              Available to spend: <span className="font-bold">₦{nairaBalance.toLocaleString()}</span>
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="naira-amount">You Spend (NGN)</Label>
            <Input id="naira-amount" placeholder="e.g., 50,000" type="number" value={nairaAmount} onChange={handleNairaAmountChange} disabled={isBuying || isLoadingPrices} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="crypto-asset">You Get</Label>
            <Select value={selectedAssetSymbol} onValueChange={handleAssetChange} disabled={isBuying || isLoadingPrices}>
              <SelectTrigger id="crypto-asset">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {assetList.map(asset => {
                  const Icon = assetIcons[asset.symbol];
                  return (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span>{asset.name} ({asset.symbol})</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="h-16 flex items-center justify-center rounded-lg bg-muted text-center p-2">
            {isLoadingPrices ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading prices...</span>
              </div>
            ) : cryptoAmount ? (
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
          <Button className="w-full" onClick={handleBuy} disabled={isBuying || isLoadingPrices || !nairaAmount}>
            {isBuying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isBuying ? "Processing..." : "Buy Now"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
