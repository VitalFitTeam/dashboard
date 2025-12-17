"use client";

import { useTranslations } from "next-intl";
import { useSalesByPaymentMethod } from "@/hooks/useReports";
import { ChartData } from "@vitalfit/sdk";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { ReusablePieChart } from "@/components/charts/pie-chart";

type PaymentMethodPieChartProps = {
  token: string;
  startDate: string;
  endDate: string;
};

export default function PaymentMethodPieChart({
  token,
  startDate,
  endDate,
}: PaymentMethodPieChartProps) {
  const t = useTranslations("analytics.sales.charts.payment_method");

  const {
    data: paymentData,
    isLoading: isLoadingPayment,
    error: errorPayment,
  } = useSalesByPaymentMethod(token, startDate, endDate);

  const paymentChartConfig: ChartConfig = {
    Sales: {
      label: t("config_label"),
      color: "hsl(220 89% 63%)",
    },
  };

  if (errorPayment) {
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

  if (isLoadingPayment || !paymentData) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  const chartData = paymentData.map((d: ChartData) => ({
    label: d.label,
    value: typeof d.value === "string" ? parseFloat(d.value) : d.value,
  }));

  const totalSales = chartData.reduce((acc, item) => acc + item.value, 0);

  const safeData = chartData.length > 0 
    ? chartData 
    : [{ label: t("no_data"), value: 1 }];

  return (
    <ReusablePieChart
      title={t("title")}
      description={t("description")}
      data={safeData}
      dataKey="value"
      nameKey="label"    
      chartConfig={paymentChartConfig}  
      footerText={t("footer_total", { amount: totalSales.toLocaleString() })}
      growth={undefined}   
      colors={[
        "#60a5fa",
        "#3b82f6",
        "#2563eb",
        "#1d4ed8",
        "#1e40af",
      ]}
    />
  );
}