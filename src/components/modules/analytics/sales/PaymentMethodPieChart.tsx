"use client";

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

const paymentChartConfig: ChartConfig = {
  Sales: {
    label: "Ventas",
    color: "hsl(220 89% 63%)",
  },
};

export default function PaymentMethodPieChart({
  token,
  startDate,
  endDate,
}: PaymentMethodPieChartProps) {
  const {
    data: paymentData,
    isLoading: isLoadingPayment,
    error: errorPayment,
  } = useSalesByPaymentMethod(token, startDate, endDate);

  if (errorPayment) {
    return (
      <Card className="h-[400px] border-none">
        <CardHeader>
          <CardTitle>Ventas por Método de Pago</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">
          Error al cargar métodos de pago.
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

  const safeData = chartData.length > 0 ? chartData : [{ label: "Sin datos", value: 1 }];

  return (
    <ReusablePieChart
      title="Ventas por Método de Pago"
      description="Preferencia de pago de clientes"
      data={safeData}
      dataKey="value"
      nameKey="label"    
      chartConfig={paymentChartConfig}  
      footerText={`Total vendido: $${totalSales.toLocaleString()}`}
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
