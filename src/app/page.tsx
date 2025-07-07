"use client";

import DashboardLayout from "@/components/dashboard/dashboard-layout";
import WalletView from "@/components/dashboard/wallet-view";
import DepositNairaView from "@/components/deposit-naira/deposit-naira-view";

export default function Home() {
  return (
    <DashboardLayout>
      <WalletView />
    </DashboardLayout>
  );
}
