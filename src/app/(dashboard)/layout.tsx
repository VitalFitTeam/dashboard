import SidebarDashboard from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainContent from "@/components/layout/MainContent";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen ">
      <SidebarProvider>
        <SidebarDashboard />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </div>
  );
}
