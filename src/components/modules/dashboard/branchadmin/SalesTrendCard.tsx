"use client";

import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchReport } from "@/hooks/reports/useBranchReport";

export const SalesTrendCard = ({ token, branchId }: { token: string | null; branchId?: string }) => {
  const { data: response, isLoading } = useBranchReport.useWeeklySalesChart(token, branchId);

  // Transformación de datos para Recharts
  const chartData = useMemo(() => {
    const rawData = response || [];
    return rawData.map((item: any) => ({
      day: item.label.substring(0, 3), // "Mon", "Tue", etc.
      ventas: Number(item.value),
    }));
  }, [response]);

  // Formateador para el eje Y y Tooltip
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <Card className="shadow-sm border-none bg-white dark:bg-slate-950">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Tendencia de Ventas</CardTitle>
        <CardDescription>Ingresos generados en los últimos 7 días</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground))"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                            {payload[0].payload.day}
                          </p>
                          <p className="font-bold text-primary">
                            {currencyFormatter.format(Number(payload[0].value))}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                  strokeWidth={2}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};