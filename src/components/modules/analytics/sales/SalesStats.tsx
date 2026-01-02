"use client";

import { useFinanceReports } from "@/hooks/reports/useFinanceReports";
import { 
  DollarSign, 
  TrendingUp, 
  WalletCards, 
  Building
} from "lucide-react"; 
import { ReportStatItem } from "../ReportStatItem";
import { useTranslations } from "next-intl";
import { StatCard } from "@/components/ui/StatCard";
import { useSalesReports } from "@/hooks/reports/useSalesReports";
import { useMemo } from "react";

interface StatProps {
  token: string | null;
  branchId?: string | undefined; 
  
}

interface GlobalStatsData {
  total_current_month: string;
  total_last_month: string;
  percentage_change: number;
  trend: string;
}

export function TotalSales({ token }: StatProps) {
  const t = useTranslations("analytics.Sales.stats");
  const { data, isLoading } = useSalesReports.useTotalSales(token);

  const mappedData = useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      value: data.total_sales || 0,
      percentage_change: data.percentage_change,
      trend: data.trend,
      title: t("total_sales") 
    };
  }, [data, t]);

  return (
    <ReportStatItem
      data={mappedData} 
      isLoading={isLoading} 
      defaultTitle={t("total_sales")}
      icon={DollarSign}
      formatType="currency" 
    />
  );
}

export function AverageTicsketStat({ token, branchId  }: StatProps) {
  const t = useTranslations("analytics.sales.stats");
  const { data, isLoading } = useSalesReports.useAverageTicket(token, branchId);

 return (
    <ReportStatItem
      data={data} 
      isLoading={isLoading} 
      defaultTitle="Total de tickets vendidos"
      icon={DollarSign}
      formatType="number"
    />
  );
}

export function TotalTransactionsStat({ token, branchId  }: StatProps) {
  const t = useTranslations("analytics.sales.stats");
  const { data, isLoading } = useSalesReports.useTotalTransactionsKPI(token, branchId);

  return (
    <ReportStatItem
      data={data} 
      isLoading={isLoading} 
      defaultTitle="Total de Transacciones"
      icon={DollarSign}
      formatType="number"
    />
  );
}

export function GlobalStats({ token }: { token: string }) {
  const t = useTranslations("analytics.Sales");
  const { data, isLoading } = useSalesReports.useGlobalStats(token);

  const stats = useMemo(() => {
    if (!data) {
      return null;
    }
    const raw = (data as unknown) as GlobalStatsData;

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    return {
      displayValue: formatter.format(parseFloat(raw.total_current_month) || 0),
      lastMonthFormatted: formatter.format(parseFloat(raw.total_last_month) || 0),
      trendValue: raw.percentage_change,
      isPositive: raw.trend === "up",
    };
  }, [data]);

  return (
    <StatCard
      title={t("stats.total_sales")}
      isLoading={isLoading}
      value={isLoading ? "..." : stats?.displayValue || "$0.00"}
      icon={<DollarSign className="h-5 w-5 text-gray-400" />}
      trend={
        stats ? {
          value: stats.trendValue,
          isPositive: stats.isPositive,
          label: t("stats.comparison", { amount: stats.lastMonthFormatted }) 
        } : undefined
      }
    />
  );
}

