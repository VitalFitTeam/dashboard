"use client";

import { useMemo, useState } from "react";
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

export default function SalesReport() {
  const { token } = useAuth();

  const [branchValue, setBranchValue] = useState("all");
  const [rangeValue, setRangeValue] = useState("this_month");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const {
    branches,
    isLoading: loadingBranches,
  } = useBranches({
    token: token ?? "",
    limit: 50,
  });

const branchOptions = useMemo(
  () => [
    { value: "all", label: "Todas las sucursales" },
    ...branches.map((branch) => ({
      value: branch.branch_id,
      label: branch.name,
    })),
  ],
  [branches],
);

  const ranges = [
    { value: "today", label: "Hoy" },
    { value: "this_week", label: "Esta semana" },
    { value: "this_month", label: "Este mes" },
    { value: "last_month", label: "Mes anterior" },
  ];

  const { finalStartDate, finalEndDate } = useMemo(() => {
    const now = new Date();

    if (startDate && endDate) {
      return {
        finalStartDate: startDate,
        finalEndDate: endDate,
      };
    }

    switch (rangeValue) {
      case "today":
        return { finalStartDate: now, finalEndDate: now };

      case "this_week":
        return {
          finalStartDate: startOfWeek(now, { weekStartsOn: 1 }),
          finalEndDate: endOfWeek(now, { weekStartsOn: 1 }),
        };

      case "last_month": {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
          finalStartDate: startOfMonth(lastMonth),
          finalEndDate: endOfMonth(lastMonth),
        };
      }

      case "this_month":
      default:
        return {
          finalStartDate: startOfMonth(now),
          finalEndDate: endOfMonth(now),
        };
    }
  }, [rangeValue, startDate, endDate]);

const startDateISO = format(finalStartDate, "yyyy-MM-dd");
const endDateISO = format(finalEndDate, "yyyy-MM-dd");

const handleClearFilters = () => {
  setBranchValue("all");
  setRangeValue("this_month");
  setStartDate(undefined);
  setEndDate(undefined);
};

  if (!token) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
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
        onStartDateChange={(date) => {
          setStartDate(date);
          setRangeValue("");
        }}
        onEndDateChange={(date) => {
          setEndDate(date);
          setRangeValue("");
        }}
        loadingBranches={loadingBranches}
        onClear={handleClearFilters}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Totales"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          value="-"
          description={<span className="text-green-500 font-semibold">-</span>}
          bottomMarkup
        />

        <StatCard
          title="Ventas de Membresías"
          icon={<Users className="h-4 w-4 text-primary" />}
          value="-"
          description={<span className="text-green-500 font-semibold">-</span>}
          bottomMarkup
        />

        <StatCard
          title="Transacciones"
          icon={<ShoppingCart className="h-4 w-4 text-primary" />}
          value="-"
          description={<span className="text-green-500 font-semibold">-</span>}
          bottomMarkup
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SalesByHourChart
            token={token}
            startHour={startDateISO}
            endHour={endDateISO}
          />
        </div>

        <PaymentMethodPieChart
          token={token}
          startDate={startDateISO}
          endDate={endDateISO}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ServiceSalesDonutChart
          token={token}
          startDate={startDateISO}
          endDate={endDateISO}
        />

        <SalesTopInstructorChart
          token={token}
          startDate={startDateISO}
          endDate={endDateISO}
        />
      </section>

    </div>
  );
}
