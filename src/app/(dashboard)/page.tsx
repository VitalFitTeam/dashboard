"use client";

import { useAuth } from "@/context/AuthContext";
import SuperAdminDashboard from "@/components/features/dashboard/SuperAdminDashboard";
import BranchDashboard from "@/components/features/dashboard/BranchDashboard";
import InstructorDashboard from "@/components/features/dashboard/InstructorDashboard";

export default function DashboardHome() {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <p>Cargando...</p>;
  }

  return (
    <div>

      {!hasRole(["super_admin", "branch_admin", "accountant", "instructor"]) && (
        <>
          <h1>Bienvenido, {user.first_name}</h1>
          <p>Tu rol: {user.role_label}</p>
        </>
      )}

      {hasRole(["super_admin"]) && (
        <SuperAdminDashboard />
      )}

      {hasRole(["instructor"]) && (
        <InstructorDashboard />
      )}

      {hasRole(["branch_admin"]) && (
        <BranchDashboard />
      )}

      {hasRole("accountant") && <button>Ver reportes financieros</button>}
    </div>
  );
}
