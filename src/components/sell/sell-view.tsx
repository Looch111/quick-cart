"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift } from 'lucide-react';
import { TelegramIcon } from '@/components/icons/telegram-icon';

export default function SellView() {
  return (
    <main className="flex-1 space-y-6 p-4 lg:p-6">
      <Tabs defaultValue="gift-cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gift-cards">
            <Gift className="mr-2 h-4 w-4" />
            Sell Gift Cards
          </TabsTrigger>
          <TabsTrigger value="telegram-stars">
             <TelegramIcon className="mr-2 h-4 w-4" />
            Sell Telegram Stars
          </TabsTrigger>
        </TabsList>
        <TabsContent value="gift-cards">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Sell Gift Cards</CardTitle>
              <CardDescription>Get instant cash for your gift cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-type">Gift Card Type</Label>
                <Select>
                  <SelectTrigger id="card-type">
                    <SelectValue placeholder="Select a gift card" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="itunes">iTunes</SelectItem>
                    <SelectItem value="google-play">Google Play</SelectItem>
                    <SelectItem value="steam">Steam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-amount">Amount (USD)</Label>
                <Input id="card-amount" placeholder="e.g., 100" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-code">Gift Card Code</Label>
                <Input id="card-code" placeholder="Enter code" />
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                <p>Estimated Payout: <span className="font-bold text-primary">$85.00</span></p>
                <p>Rate: 85%</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sell Gift Card</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="telegram-stars">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Sell Telegram Stars</CardTitle>
              <CardDescription>Convert your Telegram Stars to cash.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="star-amount">Number of Stars</Label>
                <Input id="star-amount" placeholder="e.g., 500" type="number" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="telegram-username">Your Telegram Username</Label>
                <Input id="telegram-username" placeholder="@username" />
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                <p>Current Rate: <span className="font-bold text-primary">$0.15 per star</span></p>
                <p>Estimated Payout: <span className="font-bold text-primary">$75.00</span></p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sell Stars</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
