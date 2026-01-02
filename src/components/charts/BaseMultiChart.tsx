"use client";

import React from "react";
import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
} from "recharts";
import { useTranslations, useLocale } from "next-intl"; // Importado para localización
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSeries {
  key: string;
  label: string;
  color: string;
  type: "bar" | "line";
}

interface BaseMultiChartProps {
  title: string;
  description?: string;
  data: any[] | undefined;
  series: ChartSeries[];
  indexKey: string;
  isLoading: boolean;
  layout?: "horizontal" | "vertical"; 
  valueType?: "currency" | "number";
}

export function BaseMultiChart({
  title,
  description,
  data,
  series,
  indexKey,
  isLoading,
  layout = "horizontal",
  valueType = "number",
}: BaseMultiChartProps) {

  const t = useTranslations("analytics.common");
  const locale = useLocale();

  const chartConfig = series.reduce((acc, s) => {
    acc[s.key] = { label: s.label, color: s.color };
    return acc;
  }, {} as ChartConfig);

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
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {isLoading ? (
          <div className="space-y-3">
             <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg text-sm italic">
            {t("no_data")}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ComposedChart
              data={data}
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
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}