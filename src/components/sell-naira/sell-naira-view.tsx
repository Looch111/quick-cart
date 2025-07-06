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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crypto-asset">Crypto to Sell</Label>
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
            <Label htmlFor="crypto-amount">Amount to Sell</Label>
            <Input id="crypto-amount" placeholder="0.00" type="number" value={amount} onChange={handleAmountChange} />
          </div>
          {nairaAmount && (
            <div className="pt-2 text-sm text-muted-foreground">
              <p>You will receive approximately: <span className="font-bold text-primary">{nairaAmount}</span></p>
            </div>
          )}
          <div className="space-y-2 pt-4">
            <h3 className="text-lg font-medium font-headline">Bank Details</h3>
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input id="bank-name" placeholder="e.g., Guaranty Trust Bank" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <Input id="account-number" placeholder="0123456789" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input id="account-name" placeholder="John Doe" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSell}>Sell for Naira</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
