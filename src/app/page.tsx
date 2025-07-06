"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import WalletView from "@/components/dashboard/wallet-view";
import SellNairaView from "@/components/sell-naira/sell-naira-view";
import { Landmark, Wallet } from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout>
      <Tabs defaultValue="wallet" className="w-full pt-4">
        <div className="px-4 lg:px-6">
           <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet">
              <Wallet className="mr-2 h-4 w-4" />
              My Wallet
            </TabsTrigger>
            <TabsTrigger value="sell-naira">
              <Landmark className="mr-2 h-4 w-4" />
              Sell for Naira
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="wallet">
          <WalletView />
        </TabsContent>
        <TabsContent value="sell-naira">
          <SellNairaView />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
