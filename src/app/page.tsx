"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import WalletView from "@/components/dashboard/wallet-view";
import SellNairaView from "@/components/sell-naira/sell-naira-view";
import { Landmark, Wallet, ShoppingCart } from "lucide-react";
import BuyNairaView from "@/components/buy-naira/buy-naira-view";

export default function Home() {
  return (
    <DashboardLayout>
      <Tabs defaultValue="wallet" className="w-full pt-4">
        <div className="px-4 lg:px-6">
           <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wallet">
              <Wallet className="mr-2 h-4 w-4" />
              My Wallet
            </TabsTrigger>
            <TabsTrigger value="buy-naira">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell-naira">
              <Landmark className="mr-2 h-4 w-4" />
              Sell
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="wallet">
          <WalletView />
        </TabsContent>
        <TabsContent value="buy-naira">
          <BuyNairaView />
        </TabsContent>
        <TabsContent value="sell-naira">
          <SellNairaView />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
