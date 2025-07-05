import DashboardLayout from "@/components/dashboard/dashboard-layout";
import WalletView from "@/components/dashboard/wallet-view";

export default function Home() {
  return (
    <DashboardLayout pageTitle="Wallet">
      <WalletView />
    </DashboardLayout>
  );
}
