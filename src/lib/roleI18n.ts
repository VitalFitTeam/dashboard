import { UserRole } from "@/lib/roles";

export const ROLE_I18N_KEY: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "SUPER_ADMIN",
  [UserRole.BRANCH_ADMIN]: "BRANCH_ADMIN",
  [UserRole.INSTRUCTOR]: "INSTRUCTOR",
  [UserRole.ACCOUNTANT]: "ACCOUNTANT",
  [UserRole.DATA_ANALYST]: "DATA_ANALYST",
  [UserRole.RECEPTIONIST]: "RECEPTIONIST",
};