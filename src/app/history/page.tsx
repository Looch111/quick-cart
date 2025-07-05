import DashboardLayout from "@/components/dashboard/dashboard-layout";
import HistoryView from "@/components/history/history-view";

export default function HistoryPage() {
  return (
    <DashboardLayout pageTitle="History">
      <HistoryView />
    </DashboardLayout>
  );
}
