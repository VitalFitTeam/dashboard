"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1>Bienvenido, {user.first_name}</h1>
      <p>Tu rol: {user.role_label}</p>

      {hasRole(["super_admin", "branch_admin"]) && (
        <button>Gestionar usuarios</button>
      )}

      {hasRole("accountant") && <button>Ver reportes financieros</button>}
    </div>
  );
}
