"use client";

import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  ArrowRightLeft,
  History,
  Settings,
  Bell,
  Download,
  Upload,
} from "lucide-react";
import { AppLogo } from "@/components/icons/logo";
import { BtcIcon } from "@/components/icons/btc-icon";
import { EthIcon } from "@/components/icons/eth-icon";

const assets = [
  { icon: BtcIcon, name: "Bitcoin", symbol: "BTC", balance: "2.543", value: "165,342.78" },
  { icon: EthIcon, name: "Ethereum", symbol: "ETH", balance: "42.81", value: "148,871.20" },
  { icon: () => <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">N</div>, name: "Cool Ape NFT", symbol: "#2345", balance: "1", value: "2,400.00" },
];

const transactions = [
  { id: "txn_1", type: "Deposit", status: "Completed", date: "2024-05-20", amount: "+0.5 BTC" },
  { id: "txn_2", type: "Withdrawal", status: "Pending", date: "2024-05-19", amount: "-10.2 ETH" },
  { id: "txn_3", type: "Swap", status: "Failed", date: "2024-05-18", amount: "BTC > ETH" },
  { id: "txn_4", type: "Deposit", status: "Completed", date: "2024-05-17", amount: "+15.0 ETH" },
];

function DashboardHeader() {
  const { isMobile } = useSidebar();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {isMobile && <SidebarTrigger />}
        <h1 className="font-headline text-xl font-semibold">Wallet</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}

function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src="https://placehold.co/100x100" alt="@username" data-ai-hint="profile picture" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">John Doe</p>
            <p className="text-xs leading-none text-muted-foreground">
              john.doe@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link href="/login">
            <DropdownMenuItem className="cursor-pointer">
                Log out
            </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Dashboard() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-16 items-center px-4">
            <AppLogo className="h-8 w-8" />
            <span className="ml-3 font-headline text-xl font-bold group-data-[collapsible=icon]:hidden">
              Baltom Exchange
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <Wallet />
                Wallet
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <ArrowRightLeft />
                Trade
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <History />
                History
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-6 p-4 lg:p-6">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="font-headline text-sm font-medium">Total Balance</CardTitle>
                <CardDescription>All your assets combined</CardDescription>
              </div>
              <span className="text-sm text-muted-foreground">USD</span>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-headline">$316,613.98</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              <div className="mt-6 flex space-x-4">
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Deposit
                </Button>
                <Button variant="secondary">
                  <Download className="mr-2 h-4 w-4" /> Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="assets">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Your Assets</CardTitle>
                  <CardDescription>An overview of your cryptocurrency holdings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="hidden sm:table-cell text-right">Value (USD)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.symbol}>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <asset.icon className="h-8 w-8" />
                              <div>
                                <div className="font-medium">{asset.name}</div>
                                <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">{asset.balance}</TableCell>
                          <TableCell className="hidden sm:table-cell text-right font-mono">${asset.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Transaction History</CardTitle>
                  <CardDescription>Your recent deposits, withdrawals, and trades.</CardDescription>
                </CardHeader>
                <CardContent>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
