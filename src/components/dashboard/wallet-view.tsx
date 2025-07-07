"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BtcIcon } from "@/components/icons/btc-icon";
import { EthIcon } from "@/components/icons/eth-icon";
import { UsdcIcon } from "@/components/icons/usdc-icon";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { collection, query, onSnapshot, doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { DepositDialog } from "../modals/deposit-dialog";
import { WithdrawDialog } from "../modals/withdraw-dialog";

const iconMap: { [key: string]: React.ElementType } = {
  BTC: BtcIcon,
  ETH: EthIcon,
  USDC: UsdcIcon,
  default: () => <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">A</div>
};

export default function WalletView() {
  const { user, profile } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const assetsQuery = query(collection(db, `users/${user.uid}/assets`));
    const assetsUnsubscribe = onSnapshot(assetsQuery, (querySnapshot) => {
      const assetsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssets(assetsData);
      if(loading) setLoading(false);
    }, () => setLoading(false));

    const transactionsQuery = query(collection(db, `users/${user.uid}/transactions`));
    const transactionsUnsubscribe = onSnapshot(transactionsQuery, (querySnapshot) => {
      const transactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(transactionsData);
    });

    return () => {
      assetsUnsubscribe();
      transactionsUnsubscribe();
    };
  }, [user]);

  const totalBalance = profile?.totalBalance || '0.00';

  if (loading) {
    return (
      <main className="flex-1 space-y-6 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </main>
    );
  }
  
  if (!user) {
    return (
       <main className="flex-1 space-y-6 p-4 lg:p-6">
        <p>Please log in to view your wallet.</p>
       </main>
    )
  }

  return (
    <main className="flex-1 space-y-6 animate-in fade-in-up-4 duration-500">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Total Balance</CardTitle>
          <CardDescription>The combined value of all your assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold font-headline">${totalBalance}</div>
          <p className="text-xs text-muted-foreground">+2.1% from last month</p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <DepositDialog />
        <WithdrawDialog />
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Your Assets</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>
        <TabsContent value="assets">
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Value (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => {
                    const IconComponent = iconMap[asset.id] || iconMap.default;
                    return (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <IconComponent className="h-8 w-8" />
                            <div>
                              <div className="font-medium">{asset.name}</div>
                              <div className="text-sm text-muted-foreground">{asset.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{asset.balance}</TableCell>
                        <TableCell className="hidden sm:table-cell text-right font-mono">${asset.value}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.type}</TableCell>
                       <TableCell>
                        <Badge variant={tx.status === 'Completed' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{tx.date}</TableCell>
                      <TableCell className="text-right font-mono">{tx.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
