"use client";

import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
} from "recharts";
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

interface ChartSeries {
  key: string;
  label: string;
  color: string;
  type: "bar" | "line";
}

interface BaseMultiChartProps {
  title: string;
  description?: string;
  data: any[] | undefined; // Cambiado a any[] porque el mapper entrega un objeto procesado
  series: ChartSeries[];
  indexKey: string;
  isLoading: boolean;
}

export function BaseMultiChart({
  title,
  description,
  data,
  series,
  indexKey,
  isLoading,
}: BaseMultiChartProps) {
  // DEBUG: Si el gráfico sale vacío, mira la consola.
  // Debes ver un array donde cada objeto tenga una propiedad llamada igual que s.key
  console.log("Datos en BaseMultiChart:", data);

  const chartConfig = series.reduce((acc, s) => {
    acc[s.key] = { label: s.label, color: s.color };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col h-full shadow-sm border-none bg-white dark:bg-slate-950">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {isLoading ? (
          <div className="space-y-3">
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
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ComposedChart
              data={data}
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
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
