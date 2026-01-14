"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  endOfDay 
} from "date-fns";
import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ReportFilters } from "@/components/modules/analytics/ReportFilter";
import { EmptyChartPlaceholder } from "@/components/modules/analytics/sales/EmptyChartPlaceholder";

import {
  AverageTicketStat,
  GlobalStats,
  TotalSales,
  TotalTransactionsStat,
} from "@/components/modules/analytics/sales/SalesStats";
import SalesByHourChart from "@/components/modules/analytics/sales/SalesByHourChart";
import PaymentMethodPieChart from "@/components/modules/analytics/sales/PaymentMethodPieChart";
import CategorySalesDonutChart from "@/components/modules/analytics/sales/ServiceSalesDonutChart";
import TopBranchesChart from "@/components/modules/analytics/sales/TopBranchesChart";
import { DemographicSalesSection } from "@/components/modules/analytics/sales/DemographicSalesSection"; 

import { useBranches } from "@/hooks/branches/useBranches";
import { UserRole } from "@/lib/roles";

export default function SalesPage() {
  const t = useTranslations("analytics.Sales");
  const { token, user, hasRole } = useAuth();

  const activeBranchId = user?.activeBranch?.id;
  const isGlobalAdmin = hasRole([UserRole.SUPER_ADMIN]);

  const [branchId, setBranchId] = useState<string>(() => {
    return user?.activeBranch?.id || "all";
  });
  
  const [range, setRange] = useState("this-month"); 
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (user?.activeBranch?.id && branchId === "all" && !isGlobalAdmin) {
      setBranchId(user.activeBranch.id);
    }
  }, [user, isGlobalAdmin, branchId]);

  useEffect(() => {
    const now = new Date();

    if (range === "this-month") {
      setStartDate(startOfMonth(now));
      setEndDate(endOfDay(now));
    } else if (range === "last-month") {
      const lastMonth = subMonths(now, 1);
      setStartDate(startOfMonth(lastMonth));
      setEndDate(endOfMonth(lastMonth));
    } else if (range === "last-3-months") {
      setStartDate(startOfMonth(subMonths(now, 2)));
      setEndDate(endOfDay(now));
    }
  }, [range]);

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setRange("custom"); 
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setRange("custom");
    }
  };

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
    <div className="min-h-screen dark:bg-gray-900 p-6 md:p-10 space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actionButton={
          <Button variant="outline" size="sm" className="hidden md:flex">
            <FileDown className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
        }
      />

      <div className="dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4 z-10 backdrop-blur-md">
        <ReportFilters
          branches={branchOptions}
          branchValue={branchId}
          onBranchChange={setBranchId}
          ranges={rangeOptions}
          rangeValue={range}
          onRangeChange={setRange}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          loadingBranches={loadingBranches}
          onClear={() => {
            setBranchId(user?.activeBranch?.id || "all");
            setRange("custom");
            setStartDate(undefined);
            setEndDate(undefined);
          }}
        />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <TotalSales token={token} />
        <GlobalStats token={token} />
        <AverageTicketStat token={token} branchId={selectedBranch} />
        <TotalTransactionsStat token={token} branchId={selectedBranch} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[400px]">
         <SalesByHourChart 
           token={token} 
           startHour="00:00" 
           endHour="23:59" 
         />
        </div>

        <div className="lg:col-span-1">
          <TopBranchesChart token={token} />
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="min-h-[400px]">
          {hasValidRange ? (
            <CategorySalesDonutChart token={token} startDate={sDate} endDate={eDate} />
          ) : (
            <EmptyChartPlaceholder 
              title={t("filters.required_title")} 
              description={t("filters.required_description")} 
            />
          )}
        </div>

        <div className="min-h-[400px]">
          {hasValidRange ? (
            <PaymentMethodPieChart token={token} startDate={sDate} endDate={eDate} />
          ) : (
            <EmptyChartPlaceholder 
              title={t("filters.required_title")} 
              description={t("filters.required_description")} 
            />
          )}
        </div>

        <div className="min-h-[400px]">
           <DemographicSalesSection 
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