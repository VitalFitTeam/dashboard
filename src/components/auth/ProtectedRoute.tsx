"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/app/(dashboard)/loading";
import { sidebarMenusByRole, isNavItemWithSub } from "@/components/layout/Sidebar";
import ForbiddenError from "@/components/errors/ForbiddenError";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, loading, hasRole, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated || (allowedRoles && !hasRole(allowedRoles))) {
    return <Loading />;
  }

  // - Validación de rutas según el Sidebar
  if (user?.role) {
    const userRole = user.role.toLowerCase();
    const allowedSections = sidebarMenusByRole[userRole] || [];

    // Aplanar todas las rutas permitidas
    const allowedPaths: string[] = [];
    allowedSections.forEach((section) => {
      section.items.forEach((item) => {
        if (isNavItemWithSub(item)) {
          item.subitems.forEach((sub) => allowedPaths.push(sub.href));
        } else {
          allowedPaths.push(item.href);
        }
      });
    });

    const isAllowed = allowedPaths.some((path) => {
      if (path === "/") { return pathname === "/"; }
      return pathname.startsWith(path);
    });

    if (!isAllowed && allowedPaths.length > 0) {
      return <ForbiddenError />;
    }
  }

  return <>{children}</>;
}
