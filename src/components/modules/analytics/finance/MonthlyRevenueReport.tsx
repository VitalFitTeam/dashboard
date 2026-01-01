"use client";

import { BaseMultiChart } from "@/components/charts/BaseMultiChart";
import { useFinanceReports } from "@/hooks/reports/useFinanceReports";
import { mapChartResponse } from "@/utils/mapChartResponse";
import { useTranslations } from "next-intl";

export function MonthlyRevenueReport({ token, branchId }: { token: string; branchId?: string }) {
  const t = useTranslations("analytics.finance.charts.monthly_revenue");
  
  const { data: rawResponse, isLoading } = useFinanceReports.useMonthlyRevenueChart(token, branchId);

  const chartData = mapChartResponse(rawResponse);

  const seriesConfig = [
    {
      key: "valor",
      label: t("series_label"), 
      color: "#3b82f6", 
      type: "line" as const, 
    },
  ];

  return (
    <BaseMultiChart
      title={t("title")}
      description={t("description")}
      data={chartData}
      series={seriesConfig}
      indexKey="name"
      isLoading={isLoading}
    />
  );
}