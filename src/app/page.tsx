"use client";

import DashboardLayout from "@/components/dashboard/dashboard-layout";
import WalletView from "@/components/dashboard/wallet-view";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import SellNairaView from "@/components/sell-naira/sell-naira-view";
import DepositNairaView from "@/components/deposit-naira/deposit-naira-view";

export default function Home() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
 
  const TABS = ["Wallet", "Deposit Naira", "Sell for Naira"];

  const handleTabChange = (value: string) => {
    const tabIndex = TABS.indexOf(value);
    if (api && tabIndex !== -1) {
      api.scrollTo(tabIndex);
    }
  };

  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api]);

  return (
    <DashboardLayout>
       <Tabs 
        value={TABS[current]} 
        onValueChange={handleTabChange} 
        className="w-full space-y-4 px-4 pt-4 lg:px-6 lg:pt-6"
      >
        <TabsList>
          {TABS.map(tab => <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          <CarouselItem>
            <div className="p-1">
              <Card className="border-none shadow-none">
                 <WalletView />
              </Card>
            </div>
          </CarouselItem>
           <CarouselItem>
            <div className="p-1">
              <Card className="border-none shadow-none">
                <DepositNairaView />
              </Card>
            </div>
          </CarouselItem>
           <CarouselItem>
            <div className="p-1">
              <Card className="border-none shadow-none">
                <SellNairaView />
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </DashboardLayout>
  );
}
