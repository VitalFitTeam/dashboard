"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  title: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  variant?: "classic" | "modern"; 
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  isLoading?: boolean;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
  variant = "modern",
  trend,
  isLoading
}) => {
  return (
    <Card className={cn("shadow-sm border-gray-200/60", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-[16px] font-semibold text-[#111827]">
          {title}
        </CardTitle>
        {icon && <div className="text-[#111827]">{icon}</div>}
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="text-4xl font-bold tracking-tight text-gray-900 mb-1">
          {value}
        </div>
        
        {trend ? (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn(
              "text-sm font-semibold",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}% 
            </span>
            <span className="text-sm text-gray-500 font-normal">
              {trend.label ?? "desde el mes pasado"}
            </span>
          </div>
        ) : (
          description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )
        )}
      </CardContent>

      {variant === "classic" && (
        <div className="bg-gray-100 p-5 w-full rounded-b-lg mt-2"></div>
      )}
    </Card>
  );
};