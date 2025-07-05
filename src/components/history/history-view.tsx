"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const transactions = [
    { id: "txn_1", type: "Deposit", status: "Completed", date: "2024-05-20", amount: "+0.5 BTC", details: "From external wallet" },
    { id: "txn_2", type: "Withdrawal", status: "Pending", date: "2024-05-19", amount: "-10.2 ETH", details: "To Binance" },
    { id: "txn_3", type: "Swap", status: "Failed", date: "2024-05-18", amount: "1 BTC > 15 ETH", details: "Insufficient funds" },
    { id: "txn_4", type: "Deposit", status: "Completed", date: "2024-05-17", amount: "+15.0 ETH", details: "From Coinbase" },
    { id: "txn_5", type: "Swap", status: "Completed", date: "2024-05-16", amount: "0.2 BTC > 3 ETH", details: "Market order" },
    { id: "txn_6", type: "Deposit", status: "Completed", date: "2024-05-15", amount: "+1000 USDC", details: "From Circle" },
];

export default function HistoryView() {
    return (
        <main className="flex-1 space-y-6 p-4 lg:p-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline">Full Transaction History</CardTitle>
                    <CardDescription>A complete record of your deposits, withdrawals, and trades.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="hidden sm:table-cell">Details</TableHead>
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
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell className="font-mono">{tx.amount}</TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground">{tx.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
