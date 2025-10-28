"use client";

import { cn } from "@/lib/utils";
import { typography } from "@/styles/styles";
import React from "react";

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <h2 className={cn(typography.heading, "text-4xl")}>{title}</h2>

      <div className="flex items-center space-x-2">{children}</div>
    </div>
  );
};
