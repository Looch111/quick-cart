"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { BtcIcon } from '@/components/icons/btc-icon';
import { EthIcon } from '@/components/icons/eth-icon';
import { UsdcIcon } from '@/components/icons/usdc-icon';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const assets = [
  { icon: BtcIcon, name: 'Bitcoin', symbol: 'BTC' },
  { icon: EthIcon, name: 'Ethereum', symbol: 'ETH' },
  { icon: UsdcIcon, name: 'USD Coin', symbol: 'USDC' },
];

const chartData = [
  { month: "Jan", price: 186 },
  { month: "Feb", price: 305 },
  { month: "Mar", price: 237 },
  { month: "Apr", price: 273 },
  { month: "May", price: 209 },
  { month: "Jun", price: 214 },
];

const chartConfig: ChartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
};

export default function SwapView() {
  const { toast } = useToast();
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('ETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);

    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setFromAmount(amount);
    const rate = 15.3;
    if (amount && !isNaN(parseFloat(amount))) {
      setToAmount((parseFloat(amount) * rate).toFixed(5));
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setToAmount(amount);
    const rate = 15.3;
    if (amount && !isNaN(parseFloat(amount))) {
      setFromAmount((parseFloat(amount) / rate).toFixed(5));
    } else {
      setFromAmount('');
    }
  };

  const handleSwap = () => {
    if (!fromAmount || !toAmount) {
        toast({
            title: "Error",
            description: "Please enter an amount to swap.",
            variant: "destructive",
        });
        return;
    }
    toast({
        title: "Swap Successful",
        description: `You have successfully swapped ${fromAmount} ${fromCurrency} for ${toAmount} ${toCurrency}.`,
    });
  };

  return (
    <main className="flex-1 space-y-6 p-4 lg:p-6 animate-in fade-in-up-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Swap Crypto</CardTitle>
              <CardDescription>Fast and secure swaps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-amount">You pay</Label>
                <div className="flex gap-2">
                  <Input 
                    id="from-amount" 
                    placeholder="0.0" 
                    type="number"
                    value={fromAmount}
                    onChange={handleFromAmountChange} 
                  />
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.symbol} value={asset.symbol}>
                           <div className="flex items-center gap-2">
                            <asset.icon className="w-5 h-5" />
                            <span>{asset.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center items-center my-[-8px]">
                <Button variant="ghost" size="icon" onClick={handleSwapCurrencies} className="h-10 w-10 border rounded-full">
                  <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-amount">You receive</Label>
                <div className="flex gap-2">
                  <Input id="to-amount" placeholder="0.0" type="number" value={toAmount} onChange={handleToAmountChange} />
                   <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select asset" />
                    </Trigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.symbol} value={asset.symbol}>
                          <div className="flex items-center gap-2">
                            <asset.icon className="w-5 h-5" />
                            <span>{asset.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground pt-2">
                1 {fromCurrency} ≈ 15.3 {toCurrency}
              </div>

            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSwap}>Swap</Button>
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-headline">{fromCurrency}/{toCurrency} Price Chart</CardTitle>
              <CardDescription>Last 6 months price history.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 0, right: 12, top: 10, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value}`}
                         />
                        <ChartTooltip
                            cursor={true}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="price"
                            type="natural"
                            fill="var(--color-price)"
                            fillOpacity={0.4}
                            stroke="var(--color-price)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
