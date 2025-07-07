"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { depositNaira } from '@/app/actions/deposit-actions';


export default function DepositNairaView() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [nairaAmount, setNairaAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  

  const handleDeposit = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    const nairaAmountNum = parseFloat(nairaAmount);

    if (isNaN(nairaAmountNum) || nairaAmountNum <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    setIsDepositing(true);
    try {
      // This simulates a successful payment from a gateway like Flutterwave
      const result = await depositNaira({
        userId: user.uid,
        amount: nairaAmountNum,
      });

      if (result.success) {
        toast({ title: "Success", description: result.message });
        setNairaAmount('');
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <main className="flex-1 space-y-6 p-4 lg:p-6 animate-in fade-in-up-4 duration-500">
      <Card className="shadow-lg max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Deposit Naira</CardTitle>
          <CardDescription>Fund your wallet easily. In a real app, this would use Flutterwave or Paystack.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is a simulation. No real money will be transferred. Your Naira wallet will be credited with the amount you enter.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="naira-amount">Amount to Deposit (NGN)</Label>
            <Input id="naira-amount" placeholder="e.g., 100,000" type="number" value={nairaAmount} onChange={(e) => setNairaAmount(e.target.value)} disabled={isDepositing} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleDeposit} disabled={isDepositing || !nairaAmount}>
            {isDepositing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isDepositing ? "Processing..." : "Deposit Naira"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
