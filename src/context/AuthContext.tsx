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
// 1. Importamos el usuario del SDK con un alias para no confundirnos
import { User as SdkUser } from "@vitalfit/sdk";
// 2. Importamos nuestros roles centralizados
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
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  hasRole: () => false,
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
      if (!decoded) {
        return null;
      }

      try {
        const profileResponse = await api.user.WhoAmI(token);
        console.log(profileResponse);
        const sdkData = profileResponse.user; 

        if (!sdkData) {
          console.error("Respuesta de WhoAmI inválida");
          return null;
        }
        const rawRoleName = (sdkData.role as any)?.name?.toLowerCase();
        const userRole = rawRoleName as UserRole;

        if (!VALID_ROLES.includes(userRole)) {
          console.error(
            `Acceso denegado: El rol '${rawRoleName}' no tiene permisos para este sistema.`
          );
          return null;
        }

        return {
          ...sdkData, 
          role: userRole, 
          role_label: ROLE_LABELS[userRole] ?? rawRoleName,
          branch_id:
            (sdkData as any).branch_id || (sdkData as any).franchise_id,
        };
      } catch (error) {
        console.error("Error al obtener perfil del usuario:", error);
        return null;
      }
    },
    []
  );

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
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("AuthContext: init error:", error);
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
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
          localStorage.removeItem("access_token");
          setToken(null);
          setUser(null);
          throw new Error("Credenciales inválidas o sin permisos");
        }
      } catch (err) {
        console.error("Login error:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getUserProfile]
  );

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem("access_token");
      setToken(null);
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [router]);

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
