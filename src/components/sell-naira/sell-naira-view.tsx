"use client";

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
  { icon: BtcIcon, name: 'Bitcoin', symbol: 'BTC' },
  { icon: EthIcon, name: 'Ethereum', symbol: 'ETH' },
  { icon: UsdcIcon, name: 'USD Coin', symbol: 'USDC' },
];

export default function SellNairaView() {
  const { toast } = useToast();

  const handleSell = () => {
    toast({
      title: "Success",
      description: "Your sell order has been submitted. Your Naira wallet will be credited upon confirmation.",
    });
  };

  return (
    <main className="flex-1 space-y-6 animate-in fade-in-up-4 duration-500">
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
            <Select>
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
            <Input id="crypto-amount" placeholder="0.00" type="number" />
          </div>
           <div className="h-16 flex items-center justify-center rounded-lg bg-muted text-center">
            <p className="text-muted-foreground">You will receive approximately <span className="font-bold text-primary">₦7,250,000</span></p>
           </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSell}>Sell for Naira</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
