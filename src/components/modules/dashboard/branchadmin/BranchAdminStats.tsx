"use client";

import { useFinanceReports } from "@/hooks/reports/useFinanceReports";
import { 
  DollarSign, 
  TrendingUp, 
  WalletCards, 
  Building,
  UserIcon
} from "lucide-react"; 
import { useTranslations } from "next-intl";
import { StatCard } from "@/components/ui/StatCard";
import { useBranchReport } from "@/hooks/reports/useBranchReport";
import { ReportStatItem } from "../../analytics/ReportStatItem";

interface StatProps {
  token: string | null;
  branchId?: string | undefined; 
}

export function MonthlySalesKPI({ token, branchId }: StatProps) {
  const { data, isLoading } = useBranchReport.useMonthlySalesKPI(token, branchId);
  
  return (
    <ReportStatItem
      data={data} 
      isLoading={isLoading} 
      defaultTitle="Total Sales (Month)" 
      icon={DollarSign}
      formatType="currency"
    />
  );
}

export function OccupancyKPI({ token, branchId }: StatProps) {
  const { data, isLoading } = useBranchReport.useOccupancyKPI(token, branchId);
  
  return (
    <ReportStatItem
      data={data} 
      isLoading={isLoading} 
      defaultTitle="Average Occupation" 
      icon={DollarSign}
      formatType="percentage"
    />
  );
}

export function ActiveBranchesCount({ token }: StatProps) {
  const t = useTranslations("analytics.finance.stats");
  const { data, isLoading } = useFinanceReports.useActiveBranches(token);

  return (
    <StatCard 
      value={data ?? 0}
      isLoading={isLoading} 
      title={t("active_branches")} 
      icon={<Building className="h-5 w-5" />} 
    />
  );
}

