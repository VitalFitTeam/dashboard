"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/sdk-config";
import { BranchStaff, User as SdkUser } from "@vitalfit/sdk";
import { UserRole, ROLE_LABELS } from "@/lib/roles";
import { authService } from "@/lib/auth-service";

export interface SessionUser extends Omit<SdkUser, "role"> {
  role: UserRole;
  role_label: string;
  branch_id?: string;
  assignedBranches: BranchStaff[];
  managedBranches: BranchStaff[];
  instructorBranches: BranchStaff[];
  activeBranch?: BranchStaff;
}

interface AuthContextType {
  token: string | null;     
  refreshToken: string | null;
  user: SessionUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (token: string, refresh: string) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
  setTokens: (token: string, refresh: string) => void;
  switchBranch: (branch: BranchStaff) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const setTokens = useCallback((token: string, refresh: string) => {
    authService.setTokens(token, refresh);
    setAccessToken(token);
    setRefreshToken(refresh);
  }, []);

  const clearSession = useCallback(() => {
    authService.clearSession();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [clearSession, router]);


  const getUserProfile = useCallback(
    async (token: string): Promise<SessionUser | null> => {
      try {
        const [
          profileResponse,
          branchesRes,
          managedRes,
          instructorRes,
        ] = await Promise.all([
          api.user.WhoAmI(token),
          api.staff.getStaffBranches(token),
          api.staff.getManagedBranches(token),
          api.staff.getInstructorBranches(token),
        ]);

        const sdkUser: SdkUser | null = profileResponse.user;
        if (!sdkUser) {
          return null;
        }

        const rawRoleName = (sdkUser.role as any)?.name?.toLowerCase();
        const role = rawRoleName as UserRole;

        if (!Object.values(UserRole).includes(role)) {
          return null;
        }

        const assignedBranches = branchesRes.data ?? [];
        const managedBranches = managedRes.data ?? [];
        const instructorBranches = instructorRes.data ?? [];

        const allBranches = [...assignedBranches, ...managedBranches, ...instructorBranches];

        const savedBranchId = localStorage.getItem("active_branch_id");
        const activeBranch =
          allBranches.find(b => b.id === savedBranchId) || allBranches[0];

        if (activeBranch){
           localStorage.setItem("active_branch_id", activeBranch.id);
        }

        return {
          ...sdkUser,
          role,
          role_label: ROLE_LABELS[role] ?? rawRoleName,
          assignedBranches,
          managedBranches,
          instructorBranches,
          activeBranch,
          branch_id: activeBranch?.id,
        };
      } catch (err) {
        console.error("Error construyendo SessionUser:", err);
        return null;
      }
    },
    []
  );

  /* ───────────── RELOAD USER ───────────── */

  const reloadUser = useCallback(async () => {
    if (!accessToken){
       return;
    }

    try {
      const sessionUser = await getUserProfile(accessToken);
      if (!sessionUser) {
        logout();
        return;
      }
      setUser(sessionUser);
    } catch {
      logout();
    }
  }, [accessToken, getUserProfile, logout]);

  const login = useCallback(
    async (token: string, refresh: string) => {
      setLoading(true);
      try {
        const sessionUser = await getUserProfile(token);
        if (!sessionUser){
           throw new Error("Usuario sin permisos");
        }

        setTokens(token, refresh);
        setUser(sessionUser);
      } finally {
        setLoading(false);
      }
    },
    [getUserProfile, setTokens]
  );

  const switchBranch = useCallback((branch: BranchStaff) => {
    setUser(prev =>
      prev ? { ...prev, activeBranch: branch, branch_id: branch.id } : prev
    );
    localStorage.setItem("active_branch_id", branch.id);
  }, []);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user?.role) {
        return false;
      }
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(user.role);
    },
    [user]
  );


  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const storedAccess = authService.getAccessToken();
      const storedRefresh = authService.getRefreshToken();

      if (!storedAccess || !storedRefresh) {
        clearSession();
        setLoading(false);
        return;
      }

      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);

      const sessionUser = await getUserProfile(storedAccess);
      if (!sessionUser) {
        clearSession();
      } else {
        setUser(sessionUser);
      }

      setLoading(false);
    };

    initAuth();
  }, [getUserProfile, clearSession]);

  /* ───────────── PROVIDER ───────────── */

  return (
    <AuthContext.Provider
      value={{
        token: accessToken,         
        refreshToken,
        user,
        loading,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
        reloadUser,
        switchBranch,
        hasRole,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
