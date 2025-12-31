"use client";

import { BaseMultiChart } from "@/components/charts/BaseMultiChart";
import { mapSimpleToChart } from "@/utils/chart-mappers";

export function ProjectedCashFlowReport({ apiResponse }: { apiResponse: any }) {
  const chartData = mapSimpleToChart(apiResponse.data);

  const seriesConfig = [
    {
      key: "valor",
      label: "Ingresos",
      color: "#4ade80",
      type: "bar" as const,
    },
  ];

  return (
    <BaseMultiChart
      title="Flujo de Caja Proyectado"
      description="Ingresos vs Egresos y Flujo Neto"
      data={chartData}
      series={seriesConfig}
      indexKey="name"
    />
  );
}
