import Navbar from "@/components/layout/Navbar";
import SidebarDashboard from "@/components/layout/Sidebar";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen ">
      <SidebarProvider>
        <SidebarDashboard />
        <div className="flex-1 flex flex-col ml-64">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
