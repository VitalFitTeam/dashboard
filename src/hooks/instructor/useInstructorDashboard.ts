"use client";

import { api } from "@/lib/sdk-config";
import { ClassScheduleItem, KPICard } from "@vitalfit/sdk";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface FlexibleKPICard extends Omit<KPICard, "value" | "target"> {
  value?: string | number;
  target?: string | number;
}

export default function useInstructorDashboard(token: string | null) {

  const t = useTranslations("dashboards.InstructorDashboard");

  const [data, setData] = useState<{
    classesToday: ClassScheduleItem[];
    monthlyCount: FlexibleKPICard | null;
    nextClass: string;
    studentCount: FlexibleKPICard | null;
  }>({
    classesToday: [],
    monthlyCount: null,
    nextClass: t("classes_list.loading") || "...", 
    studentCount: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(
    async (isManual = false) => {
      if (!token) {
        return;
      }

      let toastId: string | number | undefined;
      if (isManual) {
        // Mensaje de actualización traducido
        toastId = toast.loading(t("messages.updating"));
      }

      setIsLoading(true);

      try {
        const [todayRes, monthlyRes, nextRes, studentRes] = await Promise.all([
          api.report.instructorClassesToday(token),
          api.report.instructorMonthlyClassesCount(token),
          api.report.instructorNextClass(token),
          api.report.instructorStudentCountKPI(token),
        ]);

        setData({
          classesToday: todayRes?.data || [],
          monthlyCount: (monthlyRes?.data as FlexibleKPICard) || null,
          nextClass: nextRes?.data || t("classes_list.empty"),
          studentCount: (studentRes?.data as FlexibleKPICard) || null,
        });

        if (isManual) {
          toast.success(t("messages.updated"), { id: toastId });
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        toast.error(t("messages.error_loading"));
      } finally {
        setIsLoading(false);
      }
    },
    [token, t] 
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    ...data,
    isLoading,
    refresh: () => loadDashboardData(true),
  };
}