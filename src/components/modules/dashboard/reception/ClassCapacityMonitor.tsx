"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBranchReport } from "@/hooks/reports/useBranchReport";
import { useTranslations } from "next-intl";

export const ClassCapacityMonitor = ({
  token,
  branchId,
}: {
  token: string | null;
  branchId?: string;
}) => {
  const t = useTranslations("analytics.branch.ClassCapacity");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const { data: upcomingResponse, isLoading: isLoadingClasses } =
    useBranchReport.useUpcomingClasses(token, branchId);

  const { data: ratioResponse, isLoading: isLoadingRatio } =
    useBranchReport.useClassCapacityRatio(token, selectedClassId);

  const classes = upcomingResponse || [];
  const stats = ratioResponse;

  useEffect(() => {
    setSelectedClassId("");
  }, [branchId]);

  const percentage = stats
    ? Math.round((stats.current_count / stats.max_capacity) * 100)
    : 0;
  const availableSlots = stats ? stats.max_capacity - stats.current_count : 0;

  const getStatusStyles = (pct: number) => {
    if (pct >= 100) {
      return {
        color: "bg-slate-950",
        label: t("status.sold_out"),
        text: "text-slate-950",
      };
    }
    if (pct >= 85) {
      return {
        color: "bg-orange-500",
        label: t("status.almost_full"),
        text: "text-orange-600",
      };
    }
    return {
      color: "bg-emerald-500",
      label: t("status.available"),
      text: "text-emerald-600",
    };
  };

  const status = getStatusStyles(percentage);

  return (
    <Card className="h-full border-none shadow-sm bg-white dark:bg-slate-950">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-orange-500">
              <SelectValue
                placeholder={
                  isLoadingClasses
                    ? t("placeholder_loading")
                    : t("placeholder_select")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedClassId ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-2xl bg-slate-50/50">
            <Users2 className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              {t("empty_state")}
            </p>
          </div>
        ) : isLoadingRatio ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("ratio_label")}
                </p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">
                  {stats?.ratio}
                </p>
              </div>
              <Badge
                className={`${status.color} hover:${status.color} text-white px-3 py-1 shadow-sm`}
              >
                {status.label}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  {percentage >= 90 ? (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  {t("occupied", { percentage })}
                </div>
                <span className={`font-bold ${status.text}`}>
                  {t("free_slots", { count: availableSlots })}
                </span>
              </div>

              <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${status.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                {t.rich("max_capacity", {
                  max: stats?.max_capacity ?? 0,
                  bold: (chunks) => <span className="font-bold">{chunks}</span>,
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
