"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  AccountsReceivableStat, 
  ActiveBranchesCount, 
  MRRStat, 
  WeeklyRevenueStat 
} from "@/components/modules/analytics/finance/FinancialStats";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { FileDown } from "lucide-react";
import { ReportFilters } from "@/components/modules/analytics/ReportFilter";
import { useBranches } from "@/hooks/branches/useBranches";
import { ProjectedCashFlowReport } from "@/components/modules/analytics/finance/ProjectedCashFlow";
import { MonthlyRevenueReport } from "@/components/modules/analytics/finance/MonthlyRevenueReport";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { BillingMatrixReport } from "@/components/modules/analytics/finance/BillingMatrixBanch";
import { useTranslations } from "next-intl";
import { UserRole } from "@/lib/roles";

export default function FinancePage() {
  const t = useTranslations("analytics.finance");
  const { token, user, hasRole } = useAuth();

  const activeBranchId = user?.activeBranch?.id;
  const isGlobalAdmin = hasRole([UserRole.SUPER_ADMIN]);

  const [branchId, setBranchId] = useState<string>(() => {
    return user?.activeBranch?.id || "all";
  });
  const [range, setRange] = useState("custom");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

 useEffect(() => {
    if (user?.activeBranch?.id && branchId === "all" && !isGlobalAdmin) {
      setBranchId(user.activeBranch.id);
    }
  }, [user, isGlobalAdmin, branchId]);

  const { branches, isLoading: loadingBranches } = useBranches({
    token: token ?? "",
    limit: 100,
  });

  const branchOptions = useMemo(() => {
    if (!isGlobalAdmin && user?.activeBranch) {
      return [{ value: user.activeBranch.id, label: user.activeBranch.name }];
    }
    return [
      { value: "all", label: t("filters.all_branches") },
      ...branches.map((b) => ({ value: b.branch_id, label: b.name })),
    ];
  }, [branches, isGlobalAdmin, user?.activeBranch, t]);

  const rangeOptions = [
    { value: "this-month", label: t("filters.ranges.this_month") },
    { value: "last-month", label: t("filters.ranges.last_month") },
    { value: "last-3-months", label: t("filters.ranges.last_3_months") },
    { value: "custom", label: t("filters.ranges.custom") },
  ];

  const selectedBranch = branchId === "all" ? undefined : branchId;
  const hasValidRange = !!(startDate && endDate);
  
  const sDate = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
  const eDate = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

  if (!token) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10 space-y-8">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actionButton={
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
        }
      />

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <ReportFilters
          branches={branchOptions}
          branchValue={branchId}
          onBranchChange={setBranchId}
          ranges={rangeOptions}
          rangeValue={range}
          onRangeChange={setRange}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          loadingBranches={loadingBranches}
          onClear={() => {
            setBranchId(!isGlobalAdmin && activeBranchId ? activeBranchId : "all");
            setRange("this-month");
            setStartDate(startOfMonth(new Date()));
            setEndDate(endOfMonth(new Date()));
          }}
        />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <WeeklyRevenueStat token={token} branchId={selectedBranch} />
        <MRRStat token={token} branchId={selectedBranch} />
        <AccountsReceivableStat token={token} branchId={selectedBranch} />
        <ActiveBranchesCount token={token} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <ProjectedCashFlowReport token={token} branchId={selectedBranch}/>
        <MonthlyRevenueReport token={token} branchId={selectedBranch}/>
      </section>

      <section className="mt-10">
        <BillingMatrixReport 
          token={token} 
          startDate={sDate}
          endDate={eDate}
        />
      </section>
    </div>
  );
}