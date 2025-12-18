"use client";

import { PieChart, Pie, LabelList, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type DonutDatum = Record<string, string | number>;

interface DonutChartProps {
  title: string;
  description?: string;
  data: DonutDatum[];
  dataKey: string; 
  labelKey: string; 
  config?: ChartConfig;
  footerText?: string;
  growth?: number; 
  height?: number;
}

export function ReusableDonutChart({
  title,
  description,
  data,
  dataKey,
  labelKey,
  config = {},
  footerText,
  growth,
  height = 260,
}: DonutChartProps) {
  const colors = ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"];


  const safeData = data.map((item) => {
    const value = item[dataKey];
    const numeric = typeof value === "string" ? parseFloat(value) : value;

    return {
      ...item,
      [dataKey]: isNaN(numeric) ? 0 : numeric,
    };
  });
  const total = safeData.reduce((acc, item) => acc + (item[dataKey] as number), 0);

  const percentFormatter = (label: string) => {
    const item = safeData.find((x) => x[labelKey] === label);
    if (!item) {
      return null;
    }

    const value = item[dataKey] as number;
    const pct = total > 0 ? (value / total) * 100 : 0;

    return pct < 6 ? null : `${pct.toFixed(1)}%`;
  };

  const growthStatus = (() => {
    if (growth === undefined){
       return null;
    }
    if (growth > 0){
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        text: `Trending up by ${growth}% this month`,
        className: "text-green-600",
      };
    }
      
    if (growth < 0){
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

  return (
     <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>

     <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square"
          style={{ maxHeight: height }}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey={labelKey} />}
            />

            <Pie
              data={safeData}
              dataKey={dataKey}
              nameKey={labelKey}
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
            >
              {safeData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}

              <LabelList
                dataKey={labelKey}
                formatter={percentFormatter}
                position="outside"
                className="fill-foreground"
                fontSize={12}
                stroke="none"
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      {(footerText || growthStatus) && (
        <CardFooter className="flex-col gap-2 text-sm mt-2">
          {growthStatus && (
            <div
              className={`flex items-center gap-2 font-medium ${growthStatus.className}`}
            >
              {growthStatus.text} {growthStatus.icon}
            </div>
          )}

          {footerText && (
            <div className="text-muted-foreground text-xs">
              {footerText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
