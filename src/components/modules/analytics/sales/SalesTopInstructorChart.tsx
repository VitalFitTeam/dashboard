"use client";

import { useTopInstructors } from "@/hooks/useReports";; 
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
  const {
    data: salesTopInstructors,
    isLoading: isSalesTopInstructors,
    error: errorSalesTopInstructors,
  } = useTopInstructors(token, startDate, endDate);

  if (errorSalesTopInstructors) {
    return (
      <Card className="h-[400px] border-none">
        <CardHeader>
          <CardTitle>Ventas por Instructor Principal</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">
          Error al cargar datos de instructores.
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
          <CardTitle>Ventas por Instructor Principal</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center py-16">
          No hay datos de ventas de instructores para este período.
        </CardContent>
      </Card>
    );
  }

  const myChartConfig = {
    value: { 
      label: "Ventas Totales", 
      color: "hsl(var(--chart-1))", 
    },
    label: {
      label: "Instructor",
      color: "hsl(var(--foreground))",
    }
  } satisfies ChartConfig;

  return (
    <BarChartVertical
      title="Ventas por Instructor Principal"
      description={`Mostrando los instructores con mayores ventas entre ${startDate} y ${endDate}.`}
      data={salesTopInstructors}
      categoryKey="label" 
      valueKey="value"    
      config={myChartConfig}
    />
  );
}