"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Banknote, User, Hash } from 'lucide-react';

export default function SettingsView() {
  const { toast } = useToast();

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Your bank account details have been updated.",
    });
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
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <div className="relative flex items-center">
                <Banknote className="absolute left-3 h-5 w-5 text-muted-foreground" />
                <Input id="bank-name" placeholder="e.g., Guaranty Trust Bank" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
               <div className="relative flex items-center">
                <Hash className="absolute left-3 h-5 w-5 text-muted-foreground" />
                <Input id="account-number" placeholder="0123456789" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-5 w-5 text-muted-foreground" />
                <Input id="account-name" placeholder="John Doe" className="pl-10" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full sm:w-auto" onClick={handleSaveChanges}>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
