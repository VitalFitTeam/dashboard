"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  isViewMode?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  isViewMode = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
      <div className="space-y-1 text-left">
        <h2 className="text-xl text-orange-400 font-bold tracking-tight uppercase  flex items-center gap-2">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground italic font-medium">
          {subtitle}
        </p>
      </div>
      
      {isViewMode && (
        <Badge variant="secondary" className="h-fit bg-slate-100 text-slate-500 border-none px-3">
          Modo Lectura
        </Badge>
      )}
    </div>
  );
};