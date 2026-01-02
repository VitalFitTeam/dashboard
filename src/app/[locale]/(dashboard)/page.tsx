"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/roles";
import { SidebarMenuSkeleton } from "@/components/ui/sidebar";
import SuperAdminDashboard from "@/components/modules/dashboard/SuperAdminDashboard";
import BranchAdminDashboard from "@/components/modules/dashboard/BranchDashboard";
import InstructorDashboard from "@/components/modules/dashboard/InstructorDashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SidebarMenuSkeleton />;
  }


  if (!user) {
    return null; 
  }
  const dashboards: Record<UserRole, React.ReactNode> = {
    [UserRole.SUPER_ADMIN]: (
      <SuperAdminDashboard  />
    ),
    [UserRole.BRANCH_ADMIN]: (
      <BranchAdminDashboard 
        user={user} 
        activeBranch={user.activeBranch} 
      />
    ),
    [UserRole.INSTRUCTOR]: (
      <InstructorDashboard 
        user={user} 
        activeBranch={user.activeBranch} 
      />
    ),
    [UserRole.ACCOUNTANT]: (
      <SuperAdminDashboard  />
    ),
    [UserRole.DATA_ANALYST]: (
      <SuperAdminDashboard  />
    ),
    [UserRole.RECEPTIONIST]: (
      <div className="p-8 font-medium">Panel Recepción - Próximamente</div>
    ),
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {dashboards[user.role] || (
        <div className="p-8 text-center text-muted-foreground">
          No tienes un dashboard asignado para tu rol.
        </div>
      )}
    </div>
  );
}