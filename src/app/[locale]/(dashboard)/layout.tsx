import SidebarDashboard from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainContent from "@/components/layout/MainContent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";

const MESSAGE_PATH = "../../../../messages";

export default async function RootDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;

  let messages;
  try {
    const dashboardMessages = (await import(`${MESSAGE_PATH}/${locale}/dashboard.json`)).default;
    const settingMessages = (await import(`${MESSAGE_PATH}/${locale}/settings.json`)).default;
    
    // 💡 CORREÇÃO: Combinar os namespaces de ambos os arquivos JSON
    messages = {
      Dashboard: dashboardMessages, 
      sidebar: settingMessages.sidebar      
    };

  } catch (error) {
    console.error("Error loading root dashboard messages:", error);
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
    <ProtectedRoute>
      <SidebarProvider>
        <SidebarDashboard />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </ProtectedRoute>
    </NextIntlClientProvider>
  );
}
