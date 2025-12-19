"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";

export type StatCardProps = {
  title: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  bottomMarkup?: boolean;
  description?: React.ReactNode;
  className?: string;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bottomMarkup = true,
  description,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
      {bottomMarkup && (
        <CardFooter>
          <div className="bg-gray-100 p-5 w-full"></div>
        </CardFooter>
      )}
    </Card>
  );
};
