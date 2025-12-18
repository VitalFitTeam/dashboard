"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSalesByCategory } from "@/hooks/useReports";
import { ReusableDonutChart } from "../charts/donut-chart";

type ServiceSalesDonutChartProps = {
  startDate?: string;
  endDate?: string;
  token: string;
};

export default function CategorySalesDonutChart({
  startDate,
  endDate,
  token,
}: ServiceSalesDonutChartProps) {
  const t = useTranslations("analytics.sales.charts.category_sales");

  const {
    data: salesCategory,
    isLoading: isLoadingSales,
    error: errorSales,
  } = useSalesByCategory(token || "", startDate || "", endDate || "");

  if (errorSales) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">
          {t("error")}
        </CardContent>
      </Card>
    );
  }

  if (isLoadingSales || !salesCategory) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  const serviceGrowth = 8.5;

  return (
    <ReusableDonutChart
      title={t("title")}
      description={t("description")}
      data={salesCategory}
      dataKey="value"
      labelKey="label"
      growth={serviceGrowth}
      footerText={t("footer_total", { count: salesCategory.length })}
    />
  );
}