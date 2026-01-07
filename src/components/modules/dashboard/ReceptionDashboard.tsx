"use client";

import { useAuth } from "@/context/AuthContext";
import { SessionUser } from "@/context/AuthContext";
import { BranchStaff } from "@vitalfit/sdk";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckInsToday, OccupancyStat } from "./reception/ReceptionStats";
import { RecentCheckInsCard } from "./reception/RecentCheckInsCard";
import { ClassCapacityMonitor } from "./reception/ClassCapacityMonitor";
import { UpcomingClassesCard } from "./reception/UpcomingClassesCard";
import { useTranslations } from "next-intl";

interface ReceptionDashboardProps {
  user: SessionUser;
  activeBranch?: BranchStaff;
}

export default function ReceptionDashboard({
  user,
  activeBranch,
}: ReceptionDashboardProps) {
  const { token } = useAuth();
  const t = useTranslations("dashboards.ReceptionDashboard");
  
  const branchId = activeBranch?.id || "all";
  const branchName = activeBranch?.name || t("global");

  if (!token) {
    return null;
  }

 return (
    <div className="w-full bg-transparent transition-colors">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        
        <PageHeader 
          title={t("title", { branch: branchName })}
          subtitle={
            <span className="text-muted-foreground italic">
              {t("welcome", { name: user.first_name })}{" "}
              <span className="text-primary font-bold">
                {t("status_ready")}
              </span>
            </span>
          }
        />

        <div className="space-y-6">
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <OccupancyStat token={token} branchId={branchId} />
            <CheckInsToday token={token} branchId={branchId} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 space-y-6">
              <ClassCapacityMonitor token={token} branchId={branchId} />
              <RecentCheckInsCard token={token} branchId={branchId} />
            </div>

            <div className="lg:col-span-4">
              <UpcomingClassesCard token={token} branchId={branchId} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}