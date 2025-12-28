"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/sdk-config";
import { BranchStaff, User as SdkUser } from "@vitalfit/sdk";
import { UserRole, ROLE_LABELS } from "@/lib/roles";

interface JwtPayload {
  exp?: number;
  sub: string;
  role?: string | string[];
  roles?: string[];
}

export interface SessionUser extends Omit<SdkUser, "role"> {
  role: UserRole;
  role_label: string;
  branch_id?: string;
  assignedBranches: BranchStaff[];
  managedBranches: BranchStaff[];
  activeBranch?: BranchStaff; 
}

const VALID_ROLES = Object.values(UserRole);

interface AuthContextType {
  token: string | null;
  user: SessionUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  switchBranch: (branch: BranchStaff) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  hasRole: () => false,
  switchBranch: () => {},
});

const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  } catch (err) {
    console.warn("decodeToken error", err);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getUserProfile = useCallback(
    async (token: string): Promise<SessionUser | null> => {
      const decoded = decodeToken(token);
      if (!decoded) return null;

      try {
        const [profileResponse, branchesRes, managedRes] = await Promise.all([
          api.user.WhoAmI(token),
          api.staff.getStaffBranches(token),
          api.staff.getManagedBranches(token)
        ]);

        const sdkData = profileResponse.user;
        if (!sdkData) return null;

        const rawRoleName = (sdkData.role as any)?.name?.toLowerCase();
        const userRole = rawRoleName as UserRole;

        if (!VALID_ROLES.includes(userRole)) return null;

        const assignedBranches = branchesRes.data || [];
        const managedBranches = managedRes.data || [];
        
        // Unificamos todas las ramas para encontrar una activa por defecto
        const allAvailableBranches = [...assignedBranches, ...managedBranches];

        // Lógica de sucursal activa: 1. LocalStorage, 2. Primera disponible, 3. undefined
        const savedBranchId = localStorage.getItem("active_branch_id");
        const activeBranch = 
          allAvailableBranches.find(b => b.id === savedBranchId) || 
          allAvailableBranches[0] || 
          undefined;

        // Si se seleccionó una por defecto (y no estaba en storage), la guardamos
        if (activeBranch && !savedBranchId) {
          localStorage.setItem("active_branch_id", activeBranch.id);
        }

        return {
          ...sdkData,
          role: userRole,
          role_label: ROLE_LABELS[userRole] ?? rawRoleName,
          assignedBranches,
          managedBranches,
          activeBranch,
          branch_id: activeBranch?.id || (sdkData as any).branch_id,
        };
      } catch (error) {
        console.error("Error al obtener perfil completo:", error);
        return null;
      }
    },
    []
  );

  const switchBranch = useCallback((branch: BranchStaff) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, activeBranch: branch, branch_id: branch.id };
    });
    localStorage.setItem("active_branch_id", branch.id);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem("access_token");
        if (storedToken) {
          const userProfile = await getUserProfile(storedToken);
          if (userProfile) {
            setToken(storedToken);
            setUser(userProfile);
          } else {
            localStorage.removeItem("access_token");
          }
        }
      } catch (error) {
        console.error("AuthContext: init error:", error);
        localStorage.removeItem("access_token");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [getUserProfile]);

  const login = useCallback(
    async (newToken: string) => {
      setIsLoading(true);
      try {
        const userProfile = await getUserProfile(newToken);
        if (userProfile) {
          localStorage.setItem("access_token", newToken);
          setToken(newToken);
          setUser(userProfile);
        } else {
          throw new Error("Credenciales inválidas o sin permisos");
        }
      } catch (err) {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getUserProfile]
  );

  const logout = useCallback(async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("active_branch_id");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user?.role) return false;
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading: isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        hasRole,
        switchBranch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};