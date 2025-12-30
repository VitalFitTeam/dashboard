"use client";

import { Clock, Users, GraduationCap } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { useTranslations } from "next-intl";

export function InstructorStats({ nextClass, studentCount, monthlyCount }: any) {
  
  const t = useTranslations("dashboards.InstructorDashboard.stats");

  const tCommon = useTranslations("dashboards.InstructorDashboard.classes_list");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title={t("next_class")}
        value={nextClass}
        icon={<Clock className="h-5 w-5 text-blue-500" />}
        bottomMarkup={false}
        description={tCommon("starts")}
      />

      <StatCard
        title={t("students_today")}
        value={studentCount?.value?.toString() || "0"}
        icon={<Users className="h-5 w-5 text-green-500" />}
        bottomMarkup={false}
        description={
          <span className={studentCount?.is_positive ? "text-green-600" : "text-red-600"}>
            {studentCount?.is_positive ? "+" : ""}
            {studentCount?.trend_percent}% {studentCount?.trend_label}
          </span>
        }
      />

      <StatCard
        title={t("monthly_classes")}
        value={monthlyCount?.value?.toString() || "0"}
        icon={<GraduationCap className="h-5 w-5 text-purple-500" />}
        bottomMarkup={false}
        description={`${t("meta") || "Meta"}: ${monthlyCount?.target || 0}`}
      />
    </div>
  );
}