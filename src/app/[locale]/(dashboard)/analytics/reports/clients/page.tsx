"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/branches/useBranches";
import { ReportFilters } from "@/components/modules/analytics/ReportFilter";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useTranslations } from "next-intl";
import { UserRole } from "@/lib/roles";

import { 
  ActiveMember, 
  NewClients, 
  RetentionRate, 
  TotalClients 
} from "@/components/modules/analytics/clients/ClientsStat";
import { CohortAnalysisReport } from "@/components/modules/analytics/clients/CohortAnalysisChart";
import { MostUsedServicesReport } from "@/components/modules/analytics/clients/MostUsedServicesReport";
import { NewVsRecurringReport } from "@/components/modules/analytics/clients/NewVsRecurringReport";
import { TopInstructorsReport } from "@/components/modules/analytics/clients/TopInstructorsReport";

export default function ClientReportPage() {
  const t = useTranslations("analytics.clients");
  const { token, user, hasRole } = useAuth();

  const isGlobalAdmin = hasRole([UserRole.SUPER_ADMIN]);
  const activeBranchId = user?.activeBranch?.id;

  const [branchId, setBranchId] = useState<string>(() => {
    return user?.activeBranch?.id || "all";
  });

  const [range, setRange] = useState("this-month");
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));


  useEffect(() => {
    if (activeBranchId && branchId === "all" && !isGlobalAdmin) {
      setBranchId(activeBranchId);
    }
  }, [activeBranchId, isGlobalAdmin, branchId]);

  const { branches, isLoading: loadingBranches } = useBranches({ 
    token: token ?? "", 
    limit: 100 
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

  const sDate = useMemo(() => startDate ? format(startDate, "yyyy-MM-dd") : format(startOfMonth(new Date()), "yyyy-MM-dd"), [startDate]);
  const eDate = useMemo(() => endDate ? format(endDate, "yyyy-MM-dd") : format(endOfMonth(new Date()), "yyyy-MM-dd"), [endDate]);

  const rangeOptions = [
    { value: "this-month", label: t("filters.ranges.this_month") },
    { value: "last-month", label: t("filters.ranges.last_month") },
    { value: "last-3-months", label: t("filters.ranges.last_3_months") },
    { value: "custom", label: t("filters.ranges.custom") },
  ];

  const selectedBranch = branchId === "all" ? undefined : branchId;

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen dark:bg-gray-950 p-6 md:p-10 space-y-10 pb-20">
      <PageHeader
        title={t("header.title")}
        subtitle={t("header.subtitle")}
        actionButton={
          <Button variant="default" className="shadow-sm">
            <FileDown className="mr-2 h-4 w-4" />
            {t("header.export")}
          </Button>
        }
      />

      <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-slate-200/60 dark:border-gray-700">
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
        <TotalClients token={token} />
        <ActiveMember token={token} branchId={selectedBranch} />
        <NewClients token={token} branchId={selectedBranch} />
        <RetentionRate token={token} />
      </section>

      <div className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-white dark:bg-gray-900  rounded-2xl border border-slate-200/60 shadow-sm">
            <NewVsRecurringReport 
              token={token} 
              branchId={selectedBranch} 
            />
          </div>

          <div className="xl:col-span-2 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200/60 shadow-sm overflow-x-auto">
            <CohortAnalysisReport token={token} branchId={selectedBranch} />
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/60 shadow-sm">
          <MostUsedServicesReport 
            token={token} 
            branchId={selectedBranch} 
            startDate={sDate} 
            endDate={eDate} 
          />
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/60 shadow-sm">
          <TopInstructorsReport 
            token={token} 
            branchId={selectedBranch} 
            startDate={sDate} 
            endDate={eDate} 
          />
        </div>
      </section>
    </div>
  );
}