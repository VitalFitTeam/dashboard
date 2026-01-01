"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type StatCardProps = {
  title: string;
  value?: React.ReactNode;
  icon?: React.ReactNode | LucideIcon;
  description?: React.ReactNode;
  className?: string;
  variant?: "classic" | "modern";
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  isLoading?: boolean;
  bottomMarkup?: boolean; 
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon, 
  description,
  className,
  variant = "modern",
  trend,
  isLoading,
  bottomMarkup,
}) => {
  return (
    <Card className={cn("shadow-sm border-gray-200/60 overflow-hidden h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-[16px] font-semibold text-[#111827]">
          {title}
        </CardTitle>
        {Icon && (
          <div className="text-gray-400">
            {typeof Icon === "function" ? (
              <Icon className="h-5 w-5" />
            ) : (
              Icon
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2 flex-1">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mb-1">
              {value}
            </div>

            {trend ? (
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-sm text-gray-500 font-normal">
                  {trend.label ?? "desde el mes pasado"}
                </span>
              </div>
            ) : (
              description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )
            )}
          </>
        )}
      </CardContent>

      {(variant === "classic" || bottomMarkup) && (
        <div className="bg-gray-50/80 border-t p-4 w-full mt-auto">
          <div className="h-1 w-full" /> 
        </div>
      )}
    </Card>
  );
};