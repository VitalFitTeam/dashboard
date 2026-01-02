"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";

import { ReportFilters } from "@/components/modules/analytics/ReportFilter";
import PaymentMethodPieChart from "@/components/modules/analytics/sales/PaymentMethodPieChart";
import SalesByHourChart from "@/components/modules/analytics/sales/SalesByHourChart";
import SalesTopInstructorChart from "@/components/modules/analytics/sales/SalesTopInstructorChart";
import ServiceSalesDonutChart from "@/components/sales/ServiceSalesDonutChart";

import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/StatCard";

import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/branches/useBranches";

import { DollarSign, Users, ShoppingCart } from "lucide-react";
import { useGlobalStats } from "@/hooks/useReports";

export default function SalesReport() {
  const { token } = useAuth();
  const t = useTranslations("analytics.sales");

  const [branchValue, setBranchValue] = useState("all");
  const [rangeValue, setRangeValue] = useState("this_month");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { branches, isLoading: loadingBranches } = useBranches({
    token: token ?? "",
    limit: 50,
  });

  const branchOptions = useMemo(
    () => [
      { value: "all", label: t("filters.all_branches") },
      ...branches.map((branch) => ({
        value: branch.branch_id,
        label: branch.name,
      })),
    ],
    [branches, t]
  );

  const ranges = useMemo(() => [
    { value: "today", label: t("filters.ranges.today") },
    { value: "this_week", label: t("filters.ranges.this_week") },
    { value: "this_month", label: t("filters.ranges.this_month") },
    { value: "last_month", label: t("filters.ranges.last_month") },
  ], [t]);

  const { finalStartDate, finalEndDate } = useMemo(() => {
    const now = new Date();
    if (startDate && endDate) {
      return { finalStartDate: startDate, finalEndDate: endDate };
    }

    switch (rangeValue) {
      case "today": return { finalStartDate: now, finalEndDate: now };
      case "this_week": return {
        finalStartDate: startOfWeek(now, { weekStartsOn: 1 }),
        finalEndDate: endOfWeek(now, { weekStartsOn: 1 }),
      };
      case "last_month": {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return { finalStartDate: startOfMonth(lastMonth), finalEndDate: endOfMonth(lastMonth) };
      }
      default: return { finalStartDate: startOfMonth(now), finalEndDate: endOfMonth(now) };
    }
  }, [rangeValue, startDate, endDate]);

  const startDateISO = format(finalStartDate, "yyyy-MM-dd");
  const endDateISO = format(finalEndDate, "yyyy-MM-dd");

  const { data: gobalSales, isLoading: isLoadingGlobalSales } = useGlobalStats(token ?? "");

  const handleClearFilters = () => {
    setBranchValue("all");
    setRangeValue("this_month");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (!token) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      <ReportFilters
        branches={branchOptions}
        branchValue={branchValue}
        onBranchChange={setBranchValue}
        ranges={ranges}
        rangeValue={rangeValue}
        onRangeChange={(value) => {
          setRangeValue(value);
          setStartDate(undefined);
          setEndDate(undefined);
        }}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(date) => { setStartDate(date); setRangeValue(""); }}
        onEndDateChange={(date) => { setEndDate(date); setRangeValue(""); }}
        loadingBranches={loadingBranches}
        onClear={handleClearFilters}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("stats.total_sales")}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          value={gobalSales?.total_current_month}
          description={
            <span className={`${
              gobalSales?.trend === "up" ? "text-green-500" : 
              gobalSales?.trend === "down" ? "text-red-500" : "text-gray-500"
            } font-semibold`}>
              {t("stats.comparison", { amount: gobalSales?.total_last_month ?? 0 })}
            </span>
          }
          
        />

        <StatCard
          title={t("stats.membership_sales")}
          icon={<Users className="h-4 w-4 text-primary" />}
          value="-"
          description={<span className="text-gray-400 font-semibold">-</span>}
          
        />

        <StatCard
          title={t("stats.transactions")}
          icon={<ShoppingCart className="h-4 w-4 text-primary" />}
          value="-"
          description={<span className="text-gray-400 font-semibold">-</span>}
          
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SalesByHourChart token={token} startHour={startDateISO} endHour={endDateISO} />
        </div>
        <PaymentMethodPieChart token={token} startDate={startDateISO} endDate={endDateISO} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ServiceSalesDonutChart token={token} startDate={startDateISO} endDate={endDateISO} />
        <SalesTopInstructorChart token={token} startDate={startDateISO} endDate={endDateISO} />
      </section>
    </div>
  );
}