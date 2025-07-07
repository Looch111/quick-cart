"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import WalletView from "@/components/dashboard/wallet-view";
import SellNairaView from "@/components/sell-naira/sell-naira-view";
import { Landmark, Wallet, Banknote } from "lucide-react";
import DepositNairaView from "@/components/deposit-naira/deposit-naira-view";

const TABS = ["wallet", "deposit-naira", "sell-naira"];

export default function Home() {
  const [api, setApi] = useState<CarouselApi>();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const handleTabChange = useCallback((tabValue: string) => {
    setActiveTab(tabValue);
    const tabIndex = TABS.indexOf(tabValue);
    if (api && tabIndex !== -1) {
      api.scrollTo(tabIndex);
    }
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setActiveTab(TABS[selectedIndex]);
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <DashboardLayout>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="sticky top-16 z-10 bg-background px-4 py-4 lg:px-6">
           <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wallet">
              <Wallet className="mr-2 h-4 w-4" />
              My Wallet
            </TabsTrigger>
            <TabsTrigger value="deposit-naira">
              <Banknote className="mr-2 h-4 w-4" />
              Deposit Naira
            </TabsTrigger>
            <TabsTrigger value="sell-naira">
              <Landmark className="mr-2 h-4 w-4" />
              Sell for Naira
            </TabsTrigger>
          </TabsList>
        </div>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
              <WalletView />
            </CarouselItem>
            <CarouselItem>
              <DepositNairaView />
            </CarouselItem>
            <CarouselItem>
              <SellNairaView />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </Tabs>
    </DashboardLayout>
  );
}
