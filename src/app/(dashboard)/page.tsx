"use client";

import { useAuth } from "@/context/AuthContext";
import SuperAdminDashboard from "@/components/modules/dashboard/SuperAdminDashboard";
import BranchDashboard from "@/components/modules/dashboard/BranchDashboard";
import InstructorDashboard from "@/components/modules/dashboard/InstructorDashboard";
import { UserRole } from "@/lib/roles";

export default function DashboardHome() {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <div className="p-8 text-center">Cargando panel...</div>;
  }

  return (
    <div className="p-6">
      {!hasRole([
        UserRole.SUPER_ADMIN, 
        UserRole.BRANCH_ADMIN, 
        UserRole.ACCOUNTANT, 
        UserRole.INSTRUCTOR
      ]) && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Bienvenido, {user.first_name}</h1>
          <p className="text-gray-600">Tu rol actual es: {user.role_label}</p>
        </div>
      )}

      {hasRole(["super_admin"]) && (
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
          <h2 className="text-lg font-semibold mb-2">Panel Financiero</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Ver reportes financieros
          </button>
        </div>
      )}
    </div>
  );
}
