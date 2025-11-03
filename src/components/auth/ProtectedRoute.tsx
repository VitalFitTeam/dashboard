"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// Ajusta esta ruta si es necesario
import Loading from "@/app/(dashboard)/loading";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, loading, hasRole, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, hasRole, allowedRoles, router, user]);

  console.log(
    "ProtectedRoute: loading, isAuthenticated, user:",
    loading,
    isAuthenticated,
    user,
  );
  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated || (allowedRoles && !hasRole(allowedRoles))) {
    return <Loading />;
  }

  return <>{children}</>;
}
