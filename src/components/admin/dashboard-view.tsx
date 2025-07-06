"use client"

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, Users, CreditCard } from "lucide-react"
import { db } from "@/lib/firebase/client";
import { collection, query, onSnapshot, orderBy, limit, collectionGroup } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../ui/badge";

export default function DashboardView() {
  const [stats, setStats] = useState({ totalUsers: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch total users
    const usersQuery = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
      if(loading) setLoading(false);
    });

    // Fetch recent transactions across all users using a collection group query
    const txQuery = query(collectionGroup(db, 'transactions'), orderBy('timestamp', 'desc'), limit(5));
    const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
      const transactions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              ...data,
              // Extract user ID from the document's path
              userId: doc.ref.parent.parent?.id 
          };
      });
      setRecentTransactions(transactions);
      if(loading) setLoading(false);
    }, (error) => {
      console.error("Error fetching recent transactions: ", error);
      // You might need to set up Firestore indexes for this query.
      // The console error will provide a link to create it.
    });

    return () => {
      unsubscribeUsers();
      unsubscribeTx();
    };
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">A quick overview of your application.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <div className="text-2xl font-bold">{stats.totalUsers}</div>}
            <p className="text-xs text-muted-foreground">
              Live user count from Firestore.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Volume (USD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">
              Calculation coming soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">
              Calculation coming soon
            </p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-6">
        <Card>
            <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>The last 5 transactions across all users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {!loading && recentTransactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">{tx.userId}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{tx.type}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{tx.amount}</TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                    {tx.timestamp?.toDate().toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
       </div>
    </>
  )
}
