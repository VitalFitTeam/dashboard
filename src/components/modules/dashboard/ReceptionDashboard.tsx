"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { SessionUser } from "@/context/AuthContext";
import { BranchStaff } from "@vitalfit/sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckInsToday, OccupancyStat } from "./reception/ReceptionStats";
import { RecentCheckInsCard } from "./reception/RecentCheckInsCard";
import { ClassCapacityMonitor } from "./reception/ClassCapacityMonitor";
import { UpcomingClassesCard } from "./reception/UpcomingClassesCard";

interface ReceptionDashboardProps {
  user: SessionUser;
  activeBranch?: BranchStaff;
}

export default function ReceptionDashboard({
  user,
  activeBranch,
}: ReceptionDashboardProps) {
  const { token } = useAuth();
  const branchId = activeBranch?.id || "all";

  if (!token) {
    return null;
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50/50 dark:bg-transparent transition-colors">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        
        <PageHeader 
          title={`Recepción: ${activeBranch?.name || "Global"}`}
          subtitle={
            <span className="text-muted-foreground italic">
              ¡Buen día, <span className="text-primary font-bold">{user.first_name}</span>! 
              Control de acceso y aforo listo para operar.
            </span>
          }
        />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/50 border shadow-sm">
            <TabsTrigger value="overview">Panel de Control</TabsTrigger>
            <TabsTrigger value="history">Historial del Día</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <OccupancyStat token={token} branchId={branchId} />
              <CheckInsToday token={token} branchId={branchId} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

              <div className="lg:col-span-8 space-y-6">
                <ClassCapacityMonitor token={token} branchId={branchId} />
                
                <RecentCheckInsCard token={token} branchId={branchId} />
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="flex-1 min-h-[500px]">
                  <UpcomingClassesCard token={token} branchId={branchId} />
                </div>
              </div>

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}