"use client";

import { useTranslations } from "next-intl";
import { useTopInstructors } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChartVertical } from "@/components/charts/bar-chart-vertical";
import { ChartConfig } from "@/components/ui/chart";

type SalesTopInstructorChartProps = {
  token: string;
  startDate: string;
  endDate: string;
};

export default function SalesTopInstructorChart({
  token,
  startDate,
  endDate,
}: SalesTopInstructorChartProps) {
  const t = useTranslations("analytics.sales.charts.top_instructors");

  const {
    data: salesTopInstructors,
    isLoading: isSalesTopInstructors,
    error: errorSalesTopInstructors,
  } = useTopInstructors(token, startDate, endDate);

  const myChartConfig = {
    value: { 
      label: t("config.value"), 
      color: "hsl(var(--chart-1))", 
    },
    label: {
      label: t("config.label"),
      color: "hsl(var(--foreground))",
    }
  } satisfies ChartConfig;

  if (errorSalesTopInstructors) {
    return (
      <Card className="h-[400px] border-none">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">
          {t("error")}
        </CardContent>
      </Card>
    );
  }

  if (isSalesTopInstructors || !salesTopInstructors) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  if (salesTopInstructors.length === 0) {
    return (
      <Card className="h-[400px] border-none">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center py-16">
          {t("no_data")}
        </CardContent>
      </Card>
    );
  }

  return (
    <BarChartVertical
      title={t("title")}
      description={t("description", { start: startDate, end: endDate })}
      data={salesTopInstructors}
      categoryKey="label" 
      valueKey="value"    
      config={myChartConfig}
    />
  );
}