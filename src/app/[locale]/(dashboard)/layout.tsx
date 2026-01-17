import { SidebarProvider } from "@/components/ui/sidebar";
import MainContent from "@/components/layout/MainContent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SidebarDashboard from "@/components/layout/sidebar/Sidebar";
import { IdleLogoutManager } from "@/components/auth/IdleLogoutManager";
import { Toaster } from "sonner";
import { NotificationSync } from "@/components/layout/notifications/NotificationSync";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <IdleLogoutManager />
      <NotificationSync />
      <Toaster position="top-right" richColors closeButton />
      <SidebarProvider>
        <SidebarDashboard />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}