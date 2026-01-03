"use client";

import React, { useMemo } from "react";
import { useBranchReport } from "@/hooks/reports/useBranchReport";
import { BaseMultiChart } from "@/components/charts/BaseMultiChart";

interface ClassOccupancyAnalyticsProps {
  token: string | null;
  branchId?: string;
}

export function ClassOccupancyAnalytics({
  token,
  branchId,
}: ClassOccupancyAnalyticsProps) {
    
  const { data, isLoading } = useBranchReport.useClassOccupancyChart(
    token,
    "1439465a-74dc-4f0d-b75a-27363ddeae12"
  );

  console.log("clases", data)
  const formattedData = useMemo(() => {
    const rawData = response || [];

    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((item: any) => ({
      name: item.label.split("(")[0].trim(),
      ocupacion: Number(item.value),
    }));
  }, [response]);

  const seriesConfig = [
    {
      key: "ocupacion",
      label: "Porcentaje de Ocupación",
      color: "hsl(var(--primary))",
      type: "bar" as const,
    },
  ];

  return (
    <div className="h-full">
      <BaseMultiChart
        title="Ocupación por Disciplina"
        description="Porcentaje de llenado promedio por tipo de clase"
        data={formattedData}
        series={seriesConfig}
        indexKey="name"
        isLoading={isLoading}
        layout="vertical"
        valueType="number"
      />
    </div>
  );
}
