"use client";

import { useState } from "react";
import {
  AccountsReceivableStat,
  ActiveBranchesCount,
  AverageCLV,
  MRRStat,
  WeeklyRevenueStat,
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

export default function FinancePage() {
  // Al usar el scope "analytics.finance", las llaves dentro deben ser relativas
  const t = useTranslations("analytics.finance");
  const { token } = useAuth();

  const [branchId, setBranchId] = useState<string>("all");
  const [range, setRange] = useState("this-month");
  const [startDate, setStartDate] = useState<Date | undefined>(
    startOfMonth(new Date())
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    endOfMonth(new Date())
  );

  const { branches, isLoading: loadingBranches } = useBranches({
    token: token ?? "",
    limit: 100,
  });

  if (!token) {
    return null;
  }

  // 1. Mapeo de opciones (usando llaves relativas al scope inicializado)
  const branchOptions = [
    { value: "all", label: t("filters.all_branches") },
    ...branches.map((b) => ({
      value: b.branch_id,
      label: b.name,
    })),
  ];

  const rangeOptions = [
    { value: "this-month", label: t("filters.ranges.this_month") },
    { value: "last-month", label: t("filters.ranges.last_month") },
    { value: "last-3-months", label: t("filters.ranges.last_3_months") },
    { value: "custom", label: t("filters.ranges.custom") },
  ];

  const selectedBranch = branchId === "all" ? undefined : branchId;
  const sDate = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
  const eDate = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

  return (
    <div className="min-h-screen dark:bg-gray-900 p-6 md:p-10 space-y-8">
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
            setBranchId("all");
            setRange("this-month");
            setStartDate(startOfMonth(new Date()));
            setEndDate(endOfMonth(new Date()));
          }}
        />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <WeeklyRevenueStat token={token} branchId={selectedBranch} />
        <MRRStat token={token} branchId={selectedBranch} />
        <AccountsReceivableStat token={token} branchId={selectedBranch} />
        <ActiveBranchesCount token={token} />
        <AverageCLV token={token} branchId={selectedBranch} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <ProjectedCashFlowReport token={token} branchId={selectedBranch} />
        <MonthlyRevenueReport token={token} branchId={selectedBranch} />
      </section>

      <section className="mt-10">
        <BillingMatrixReport token={token} startDate={sDate} endDate={eDate} />
      </section>
    </div>
  );
}
