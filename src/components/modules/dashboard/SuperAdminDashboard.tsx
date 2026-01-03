import { useAuth } from "@/context/AuthContext";
import { GlobalStats } from "../analytics/sales/SalesStats";
import { ActiveBranchesCount, WeeklyRevenueStat } from "../analytics/finance/FinancialStats";
import { TotalClients } from "../analytics/clients/ClientsStat";
import { FranchisePerformanceCard } from "./superadmin/FranchisePerformanceCard";
import { SystemAlertsCard } from "./superadmin/SystemAlertsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/ui/PageHeader";
import { Download } from "lucide-react";

export default function SuperAdminDashboard() {
  const { token } = useAuth();

  if (!token) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Dashboard"
        subtitle="Bienvenido al resumen ejecutivo de tu red de franquicias."
        actionButton={
          <Button size="sm" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Descargar Reporte
          </Button>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="analytics" disabled>Analíticas</TabsTrigger>
          <TabsTrigger value="reports" disabled>Reportes</TabsTrigger>
          <TabsTrigger value="notifications" disabled>Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <GlobalStats token={token} />
            <ActiveBranchesCount token={token} />
            <TotalClients token={token} />
            <WeeklyRevenueStat token={token}  branchId=" " />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <FranchisePerformanceCard token={token} />
            </div>

            <div className="col-span-3">
              <SystemAlertsCard />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}