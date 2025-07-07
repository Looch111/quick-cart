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
import { Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { sellCryptoForNaira } from '@/app/actions/sell-actions';
import { getPrices } from '@/app/actions/pricing-actions';
import type { AssetPrice } from '@/services/market-data-service';

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

export default function SellNairaView() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [nairaAmount, setNairaAmount] = useState('');
  const [nairaAmountNumber, setNairaAmountNumber] = useState(0);
  const [isSelling, setIsSelling] = useState(false);
  const [prices, setPrices] = useState<AssetPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

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

  const updateNairaAmount = useCallback((cryptoValue: string, assetSymbol: string) => {
    const selectedAssetPrice = prices.find(p => p.symbol === assetSymbol)?.priceUsd;
    if (cryptoValue && !isNaN(parseFloat(cryptoValue)) && selectedAssetPrice) {
      const calculatedNaira = parseFloat(cryptoValue) * selectedAssetPrice * NGN_RATE;
      setNairaAmount(calculatedNaira.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }));
      setNairaAmountNumber(calculatedNaira);
    } else {
      setNairaAmount('');
      setNairaAmountNumber(0);
    }
  }, [prices]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    updateNairaAmount(value, selectedAssetSymbol);
  };

  const handleAssetChange = (symbol: string) => {
    setSelectedAssetSymbol(symbol);
    updateNairaAmount(amount, symbol);
  }

  const handleSell = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    const cryptoAmountNum = parseFloat(amount);

    if (isNaN(cryptoAmountNum) || cryptoAmountNum <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    setIsSelling(true);
    try {
      const result = await sellCryptoForNaira({
        userId: user.uid,
        assetSymbol: selectedAssetSymbol,
        cryptoAmount: cryptoAmountNum,
        nairaAmount: nairaAmountNumber,
      });

      if (result.success) {
        toast({ title: "Success", description: result.message });
        setAmount('');
        setNairaAmount('');
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <main className="flex-1 space-y-6 p-4 lg:p-6 animate-in fade-in-up-4 duration-500">
      <Card className="shadow-lg max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Sell Crypto for Naira</CardTitle>
          <CardDescription>Your Naira wallet will be credited instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The credited amount can be withdrawn to your bank account by an admin. This is a manual process for now.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="crypto-asset">You Sell</Label>
            <Select value={selectedAssetSymbol} onValueChange={handleAssetChange} disabled={isSelling || isLoadingPrices}>
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
          <div className="space-y-2">
            <Label htmlFor="crypto-amount">Amount</Label>
            <Input id="crypto-amount" placeholder="0.00" type="number" value={amount} onChange={handleAmountChange} disabled={isSelling || isLoadingPrices} />
          </div>
          <div className="h-16 flex items-center justify-center rounded-lg bg-muted text-center p-2">
            {isLoadingPrices ? (
                <div className="flex items-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading prices...</span>
                </div>
            ) : nairaAmount ? (
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
          <Button className="w-full" onClick={handleSell} disabled={isSelling || isLoadingPrices || !amount}>
            {isSelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSelling ? 'Processing...' : 'Sell for Naira'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
