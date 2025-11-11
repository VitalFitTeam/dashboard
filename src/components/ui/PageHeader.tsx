"use client";

import { cn } from "@/lib/utils";
import { typography } from "@/styles/styles";
import React from "react";

type PageHeaderProps = {
  title: string;
  actionButton?: React.ReactNode;
  subtitle?: React.ReactNode;
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actionButton,
  subtitle,
}) => {
  return (
    <div className="flex flex-col p-6">
      <div className="flex items-start justify-between">
        <h2 className={cn(typography.heading, "text-2xl font-bold uppercase")}>
          {title}
        </h2>

        {actionButton && (
          <div className="flex items-center space-x-2">{actionButton}</div>
        )}
      </div>

      {subtitle && <div className="mt-1">{subtitle}</div>}
    </div>
  );
};
