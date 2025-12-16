"use client";

import { useAuth } from "@/context/AuthContext";
import SuperAdminDashboard from "@/components/modules/dashboard/SuperAdminDashboard";
import BranchDashboard from "@/components/modules/dashboard/BranchDashboard";
import InstructorDashboard from "@/components/modules/dashboard/InstructorDashboard";
import { UserRole } from "@/lib/roles";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function DashboardHome() {
  const { user, hasRole } = useAuth();
  const t = useTranslations("DashboardHome");

  if (!user) {
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  const rolesWithSpecificDashboard = [
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.ACCOUNTANT,
    UserRole.INSTRUCTOR,
  ];

  const hasSpecificDashboard = hasRole(rolesWithSpecificDashboard);

  return (
    <div className="p-6">
      {!hasSpecificDashboard && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {t("welcomeTitle", { firstName: user.first_name })}
          </h1>
          <p className="text-gray-600">
            {t("roleInfo", { roleLabel: user.role_label })}
          </p>
        </div>
      )}


      {hasRole(UserRole.SUPER_ADMIN) && <SuperAdminDashboard />}

      {hasRole(UserRole.BRANCH_ADMIN) && <BranchDashboard />}

      {hasRole(UserRole.INSTRUCTOR) && <InstructorDashboard />}

      {hasRole(UserRole.ACCOUNTANT) && (
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-2">
            {t("financialPanelTitle")}
          </h2>
          <Button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {t("viewReportsButton")}
          </Button>
        </div>
      )}
      {!hasSpecificDashboard && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800">
          {t("unassignedRoleMessage")}
        </div>
      )}
    </div>
  );
}
