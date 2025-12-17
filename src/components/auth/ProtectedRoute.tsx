"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ForbiddenError from "@/components/errors/ForbiddenError";
import { UserRole } from "@/lib/roles";
import Loading from "@/app/[locale]/loading";
import { usePathname, useRouter } from "@/i18n/navigation";
import { sidebarMenusByRole } from "../layout/sidebar/sidebar.config";
import { hasSubItems } from "../layout/sidebar/SidebarItem";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
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

  if (user?.role) {

    const allowedSections = sidebarMenusByRole[user.role] || [];

    const allowedPaths: string[] = [];
    
    allowedPaths.push("/");       
    allowedPaths.push("/settings/profile");  
    allowedPaths.push("/settings"); 

    allowedSections.forEach((section) => {
      section.items.forEach((item) => {
        if (hasSubItems(item)) {
          item.subitems.forEach((sub) => allowedPaths.push(sub.href));
        } else {
          allowedPaths.push(item.href);
        }
      });
    });

    const isAllowed = allowedPaths.some((path) => {
      if (path === "/") {
        return pathname === "/";
      }

      return pathname.startsWith(path);
    });

    if (!isAllowed && allowedPaths.length > 0) {
      return <ForbiddenError />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
      return <ForbiddenError />;
    }
  }

  return <>{children}</>;
}