"use client";

<<<<<<< HEAD
import React from "react";
=======
>>>>>>> da69483 (Feature/reports finance (#129))
import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
} from "recharts";
<<<<<<< HEAD
import { useTranslations, useLocale } from "next-intl"; // Importado para localización
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
=======
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton"; // Asumiendo que usas Shadcn Skeleton
>>>>>>> da69483 (Feature/reports finance (#129))

interface ChartSeries {
  key: string;
  label: string;
  color: string;
  type: "bar" | "line";
}

interface BaseMultiChartProps {
  title: string;
  description?: string;
<<<<<<< HEAD
  data: any[] | undefined;
  series: ChartSeries[];
  indexKey: string;
  isLoading: boolean;
  layout?: "horizontal" | "vertical"; 
  valueType?: "currency" | "number";
=======
  data: any[] | undefined; // Cambiado a any[] porque el mapper entrega un objeto procesado
  series: ChartSeries[];
  indexKey: string;
  isLoading: boolean;
>>>>>>> da69483 (Feature/reports finance (#129))
}

export function BaseMultiChart({
  title,
  description,
  data,
  series,
  indexKey,
  isLoading,
<<<<<<< HEAD
  layout = "horizontal",
  valueType = "number",
}: BaseMultiChartProps) {

  const t = useTranslations("analytics.common");
  const locale = useLocale();
=======
}: BaseMultiChartProps) {
  // DEBUG: Si el gráfico sale vacío, mira la consola.
  // Debes ver un array donde cada objeto tenga una propiedad llamada igual que s.key
  console.log("Datos en BaseMultiChart:", data);
>>>>>>> da69483 (Feature/reports finance (#129))

  const chartConfig = series.reduce((acc, s) => {
    acc[s.key] = { label: s.label, color: s.color };
    return acc;
  }, {} as ChartConfig);

<<<<<<< HEAD
  const formatValue = (value: number) => {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
      style: valueType === "currency" ? "currency" : "decimal",
      currency: "USD", 
    }).format(value);
  };

  return (
    <Card className="flex flex-col h-full shadow-sm border-none bg-white dark:bg-slate-950">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
=======
  return (
    <Card className="flex flex-col h-full shadow-sm border-none bg-white dark:bg-slate-950">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
>>>>>>> da69483 (Feature/reports finance (#129))
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {isLoading ? (
          <div className="space-y-3">
<<<<<<< HEAD
             <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg text-sm italic">
            {t("no_data")}
=======
            <Skeleton className="h-[280px] w-full rounded-lg" />
            <div className="flex justify-between px-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-3 w-10" />
              ))}
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg text-sm">
            No hay datos disponibles para mostrar
>>>>>>> da69483 (Feature/reports finance (#129))
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ComposedChart
              data={data}
<<<<<<< HEAD
              layout={layout === "vertical" ? "vertical" : "horizontal"}
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid 
                vertical={layout === "horizontal"} 
                horizontal={layout === "vertical"} 
                strokeDasharray="3 3" 
                opacity={0.2} 
              />
              
              <XAxis
                type={layout === "vertical" ? "number" : "category"}
                dataKey={layout === "vertical" ? undefined : indexKey}
                tickFormatter={layout === "vertical" ? formatValue : undefined}
                className="text-[10px] font-medium"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type={layout === "vertical" ? "category" : "number"}
                dataKey={layout === "vertical" ? indexKey : undefined}
                tickFormatter={layout === "horizontal" ? formatValue : undefined}
                className="text-[10px]"
                tickLine={false}
                axisLine={false}
                width={layout === "vertical" ? 120 : 40} 
              />

              <ChartTooltip 
                cursor={{ fill: "rgba(0,0,0,0.05)" }} 
                content={<ChartTooltipContent indicator="dashed" />} 
              />

              {series.map((s) => (
                s.type === "bar" ? (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    fill={s.color}
                    layout={layout === "vertical" ? "vertical" : "horizontal"}
                    radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                    barSize={layout === "vertical" ? 20 : 24}
                  />
                ) : (
                  <Line 
                    key={s.key} 
                    type="monotone" 
                    dataKey={s.key} 
                    stroke={s.color} 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: s.color }} 
                  />
                )
              ))}
=======
              margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                opacity={0.2}
              />
              <XAxis
                dataKey={indexKey} // Aquí debe ir "name" si tu mapper devuelve {name, valor}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-[10px] uppercase font-medium"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-[10px]"
                tickFormatter={(value) =>
                  `$${new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)}`
                }
              />

              <ChartTooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                content={<ChartTooltipContent indicator="dashed" />}
              />

              {series.map((s) =>
                s.type === "bar" ? (
                  <Bar
                    key={s.key}
                    dataKey={s.key} // ESTO DEBE COINCIDIR CON LA PROPIEDAD DEL OBJETO DATA
                    fill={s.color}
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                ) : (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: s.color, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                )
              )}
>>>>>>> da69483 (Feature/reports finance (#129))
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> da69483 (Feature/reports finance (#129))
