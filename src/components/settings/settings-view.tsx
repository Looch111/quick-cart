"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Banknote, User, Hash, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { updateBankDetails } from '@/app/actions/settings-actions';
import { Skeleton } from '../ui/skeleton';

export default function SettingsView() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    };

    const fetchBankDetails = async () => {
      setIsLoading(true);
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bankDetails) {
          setBankName(data.bankDetails.bankName || '');
          setAccountNumber(data.bankDetails.accountNumber || '');
          setAccountName(data.bankDetails.accountName || '');
        }
      }
      setIsLoading(false);
    };

    fetchBankDetails();
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await updateBankDetails({
        userId: user.uid,
        bankName,
        accountNumber,
        accountName,
      });

      if (result.success) {
        toast({ title: "Success", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 space-y-6 p-4 lg:p-6 animate-in fade-in-up-4 duration-500">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-headline mb-6">Settings</h1>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Bank Account Details</CardTitle>
            <CardDescription>This is the account where you will receive Naira for your sold crypto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <div className="relative flex items-center">
                    <Banknote className="absolute left-3 h-5 w-5 text-muted-foreground" />
                    <Input id="bank-name" placeholder="e.g., Guaranty Trust Bank" className="pl-10" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isSaving} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                   <div className="relative flex items-center">
                    <Hash className="absolute left-3 h-5 w-5 text-muted-foreground" />
                    <Input id="account-number" placeholder="0123456789" className="pl-10" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} disabled={isSaving} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 h-5 w-5 text-muted-foreground" />
                    <Input id="account-name" placeholder="John Doe" className="pl-10" value={accountName} onChange={(e) => setAccountName(e.target.value)} disabled={isSaving} />
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full sm:w-auto" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
