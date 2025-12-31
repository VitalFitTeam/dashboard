"use client";

import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
  ResponsiveContainer,
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

interface ChartSeries {
  key: string;
  label: string;
  color: string;
  type: "bar" | "line";
}

interface BaseMultiChartProps {
  title: string;
  description?: string;
  data: any[];
  series: ChartSeries[];
  indexKey: string; // En tu caso será "name" por el mapper
}

export function BaseMultiChart({
  title,
  description,
  data,
  series,
  indexKey,
}: BaseMultiChartProps) {
  // Generamos el config para las etiquetas y colores de Shadcn
  const chartConfig = series.reduce((acc, s) => {
    acc[s.key] = { label: s.label, color: s.color };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          {/* ComposedChart es el secreto para mezclar Bar y Line */}
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.4}
            />
            <XAxis
              dataKey={indexKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs font-medium"
            />
            <YAxis tickLine={false} axisLine={false} className="text-xs" />

            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

            {series.map((s) =>
              s.type === "bar" ? (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  fill={s.color}
                  radius={[4, 4, 0, 0]}
                  barSize={35}
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
            )}
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
