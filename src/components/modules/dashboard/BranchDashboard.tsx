"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { SessionUser } from "@/context/AuthContext";
import { BranchStaff } from "@vitalfit/sdk";
import { Tabs, TabsContent} from "@/components/ui/tabs";
import { MonthlySalesKPI, OccupancyKPI } from "./branchadmin/BranchAdminStats";
import { ActiveMember } from "../analytics/clients/ClientsStat";
import { FinancialSummaryCard } from "./branchadmin/FinancialSummaryCard";
import { ClassOccupancyAnalytics } from "./branchadmin/ClassOccupancyAnalytics";
import { ActivityHeatmapCard } from "./branchadmin/ActivityHeatmapCard";
import { SalesTrendCard } from "./branchadmin/SalesTrendCard";
import { PageHeader } from "@/components/ui/PageHeader";

interface BranchDashboardProps {
  user: SessionUser;
  activeBranch?: BranchStaff;
}

export default function BranchAdminDashboard({
  user,
  activeBranch,
}: BranchDashboardProps) {
  const { token } = useAuth();
  const branchId = activeBranch?.id || "all";

  if (!token) {
    return null;
  }

  return (
    <div className="flex-1 min-h-screen p-4 md:p-8 pt-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
       <PageHeader 
          title={`Panel: ${activeBranch?.name || "Global"}`}
          subtitle={
            <span className="text-muted-foreground">
              ¡Hola, <span className="text-foreground font-semibold">{user.first_name}</span>! 
              Aquí tienes el resumen de lo que sucede en tu sede hoy.
            </span>
          }
        />

        <Tabs defaultValue="overview" className="space-y-6">

          <TabsContent value="overview" className="space-y-6">
            
            <div className="grid gap-4 md:grid-cols-3">
              <MonthlySalesKPI token={token} branchId={branchId} />
              <ActiveMember token={token} branchId={branchId} />
              <OccupancyKPI token={token} branchId={branchId} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <SalesTrendCard token={token} branchId={branchId} />
              </div>
              <div className="lg:col-span-4">
                <FinancialSummaryCard token={token} branchId={branchId} />
              </div>
              <div className="lg:col-span-8">
                <ActivityHeatmapCard token={token} branchId={branchId} />
              </div>
              <div className="lg:col-span-4">
                <ClassOccupancyAnalytics token={token} branchId={branchId} />
              </div>

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}