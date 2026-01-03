"use client";

import { useTranslations } from "next-intl";
import { StatCard } from "@/components/ui/StatCard";
import { useSalesReports } from "@/hooks/reports/useSalesReports";
import { useMemo } from "react";
import { useBranchReport } from "@/hooks/reports/useBranchReport";
import { ReportStatItem } from "../../analytics/ReportStatItem";
import { Users } from "lucide-react";

interface StatProps {
  token: string | null;
  branchId?: string | undefined;
}

export function OccupancyStat({ token, branchId }: StatProps) {
  const t = useTranslations("analytics.branch.Occupancy");
  const { data: response, isLoading } = useBranchReport.useCurrentOccupancyPercent(token, branchId);


  const occupancyValue = response ? Number(response) : 0;

  return (
    <StatCard
      title={t("stats.current_occupancy") || "Ocupación Actual"}
      isLoading={isLoading}
      value={`${occupancyValue}%`}
      icon={<Users className="h-4 w-4 text-muted-foreground" />}
      trend={{
        value: "",
        isPositive: true,
        label: "En tiempo real"
      }}
    />
  );
}

export function CheckInsToday({ token, branchId }: StatProps) {
  const t = useTranslations("analytics.branch.Occupancy");
  const { data: response, isLoading } = useBranchReport.useCheckInsToday(token, branchId);


  const checkValue = response ? Number(response) : 0;

  return (
    <StatCard
      title={t("stats.current_occupancy") || "Checkin"}
      isLoading={isLoading}
      value={checkValue}
      icon={<Users className="h-4 w-4 text-muted-foreground" />}
      trend={{
        value: "",
        isPositive: true,
        label: "En tiempo real"
      }}
    />
  );
}