"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode; // 👇 Este es el único cambio que necesitas
  description?: string;
  className?: string;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
