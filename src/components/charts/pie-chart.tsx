"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Pie, PieChart, Cell, LabelList } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type PieDatum = Record<string, string | number>;

interface ReusablePieChartProps {
  title: string;
  description?: string;
  data: PieDatum[];
  dataKey: string;
  nameKey: string;
  chartConfig?: ChartConfig;
  growth?: number;
  footerText?: string;
  colors?: string[];
}

const defaultColors = [
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1e40af",
];

const defaultChartConfig: ChartConfig = {};

export function ReusablePieChart({
  title,
  description,
  data,
  dataKey,
  nameKey,
  chartConfig = defaultChartConfig,
  growth,
  footerText,
  colors = defaultColors,
}: ReusablePieChartProps) {
  const isEmpty = !data || data.length === 0;

  const growthStatus = (() => {
    if (growth === undefined) {
        return null;
    }
    if (growth > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        text: `Trending up by ${growth}% this month`,
        className: "text-green-600",
      };
    }
    if (growth < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-red-500" />,
        text: `Trending down by ${Math.abs(growth)}% this month`,
        className: "text-red-600",
      };
    }
    return {
      icon: <Minus className="h-4 w-4 text-muted-foreground" />,
      text: "No change this month",
      className: "text-muted-foreground",
    };
  })();

  const safeData = data.map((item) => {
    const value = item[dataKey];
    const numericValue =
      typeof value === "string" ? parseFloat(value) : (value as number);

    return {
      ...item,
      [dataKey]: isNaN(numericValue) ? 0 : numericValue,
    };
  });

  const totalSales = safeData.reduce(
    (sum, item) => sum + (item[dataKey] as number),
    0
  );

  const labelFormatter = (labelValue: string) => {
    const item = safeData.find((d) => d[nameKey] === labelValue);
    const value = item ? (item[dataKey] as number) : 0;
    const percent = totalSales > 0 ? (value / totalSales) * 100 : 0;

    if (percent < 7) {
        return null; 
    }

    return `${percent.toFixed(1)}%`;
  };

  return (
    <Card className="flex flex-col shadow-sm border rounded-xl">
      <CardHeader className="items-center pb-0 text-center">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-0 mt-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey={nameKey} />}
            />

            {isEmpty ? (
              <Pie data={[{ value: 1 }]} dataKey="value">
                <Cell fill="#e5e7eb" />
              </Pie>
            ) : (
              <Pie
                data={safeData}
                dataKey={dataKey}
                nameKey={nameKey}
                outerRadius={100}
                
              >
                {safeData.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}

                <LabelList
                  dataKey={nameKey}
                  position="outside"
                  stroke="none"
                  fill="#374151"
                  fontSize={12}
                  formatter={labelFormatter}
                />
              </Pie>
            )}
          </PieChart>
        </ChartContainer>
      </CardContent>

      {(growthStatus || footerText) && (
        <CardFooter className="flex-col gap-2 text-sm mt-2">
          {growthStatus && (
            <div
              className={`flex items-center gap-2 font-medium ${growthStatus.className}`}
            >
              {growthStatus.text} {growthStatus.icon}
            </div>
          )}
          {footerText && (
            <div className="text-muted-foreground text-xs">{footerText}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
