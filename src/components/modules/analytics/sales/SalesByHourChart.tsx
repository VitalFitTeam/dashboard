"use client";

import { useSalesByHour } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdaptableLineDotsChart } from "@/components/charts/line-dots";

type SalesByHourChartProps = {
  token: string;
  startHour: string;
  endHour: string;
};

export default function SalesByHourChart({
  token,
  startHour,
  endHour,
}: SalesByHourChartProps) {
  const {
    data: salesByHour,
    isLoading: isLoadingSalesByHour,
    error: errorSalesByHour,
  } = useSalesByHour(token, startHour, endHour);

  if (errorSalesByHour) {
    return (
      <Card className="h-[420px] border-red-300 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-red-600">
            Ventas por franja horaria
          </CardTitle>
        </CardHeader>

        <CardContent className="text-red-500 text-sm">
          Error al cargar Ventas por franja horaria.
        </CardContent>
      </Card>
    );
  }

  if (isLoadingSalesByHour || !salesByHour) {
    return (
      <Card className="h-[420px] p-4 shadow-sm">
        <Skeleton className="h-full w-full rounded-xl" />
      </Card>
    );
  }

  const rawDataArray =
    (salesByHour as any)?.data || (salesByHour as any);

  const adaptedChartData = (rawDataArray as any[]).map((item) => ({
    ...item,
    value: parseFloat(item.value),
    hour: item.hour || 0,
  }));

  return (
    <Card className="shadow-lg rounded-2xl border border-gray-200 bg-white dark:bg-neutral-900">
      <CardHeader className="pb-1">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Ventas por Hora
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ventas desde las <strong>{startHour}</strong> hasta las{" "}
          <strong>{endHour}</strong>.
        </p>
      </CardHeader>

      <CardContent className="px-4">
        <AdaptableLineDotsChart
          description=""
          data={adaptedChartData}
          seriesLabel="Ventas Totales"
          footerChange="↑ 5.2% vs. la franja anterior"
          footerText="Datos agrupados por hora de cierre de venta."
          height={200}
        />
      </CardContent>
    </Card>
  );
}
