"use client";

import { useAuth } from "@/context/AuthContext";
import SuperAdminDashboard from "@/components/modules/dashboard/SuperAdminDashboard";
import BranchDashboard from "@/components/modules/dashboard/BranchDashboard";
import InstructorDashboard from "@/components/modules/dashboard/InstructorDashboard";
import { UserRole } from "@/lib/roles";
import { useTranslations } from "next-intl"; 

export default function DashboardHome() {
  const { user, hasRole } = useAuth();
  const t = useTranslations("Dashboard"); 

  if (!user) {
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  const firstName = user.first_name; 
  const roleLabel = user.role_label;

  return (
    <div className="p-6">
      {!hasRole([
        UserRole.SUPER_ADMIN, 
        UserRole.BRANCH_ADMIN, 
        UserRole.ACCOUNTANT, 
        UserRole.INSTRUCTOR
      ]) && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {t("welcome_header", { firstName })}
          </h1>
          <p className="text-gray-600">
            {t("current_role", { roleLabel })}
          </p>
        </div>
      )}

      {hasRole(UserRole.SUPER_ADMIN) && (
        <SuperAdminDashboard />
      )}

      {hasRole(UserRole.BRANCH_ADMIN) && (
        <BranchDashboard />
      )}

      {hasRole(UserRole.INSTRUCTOR) && (
        <InstructorDashboard />
      )}

      {hasRole(UserRole.ACCOUNTANT) && (
        <div className="p-4 bg-white shadow rounded-lg">
          {/* 🛑 5. Traducción del título del panel */}
          <h2 className="text-lg font-semibold mb-2">{t("finance_panel_title")}</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {t("view_reports_button")}
          </button>
        </div>
      )}
    </div>
  );
}