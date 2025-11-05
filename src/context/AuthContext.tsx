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

interface JwtPayload {
  exp?: number;
  sub: string;
  role?: string | string[];
  roles?: string[];
}

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_label?: string;
  [k: string]: any;
}

const ALLOWED_ROLES = [
  "super_admin",
  "branch_admin",
  "accountant",
  "data_analyst",
  "instructor",
  "recepcionist",
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrador",
  branch_admin: "Administrador de sede",
  accountant: "Contador",
  data_analyst: "Analista de datos",
  instructor: "Instructor",
  recepcionist: "Recepcionista",
};

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getUserProfile = useCallback(
    async (token: string): Promise<User | null> => {
      const decoded = decodeToken(token);
      if (!decoded) {
        return null;
      }

      try {
        const profileResponse = await api.user.WhoAmI(token);

        if (!profileResponse || !profileResponse.user) {
          console.error("Respuesta de WhoAmI inválida");
          return null;
        }

        const userData = profileResponse.user;
        const userRole = userData.role?.name?.toLowerCase();

        if (!ALLOWED_ROLES.includes(userRole)) {
          console.error(
            `Acceso denegado: El rol '${userRole}' no tiene permisos para este sistema.`,
          );
          return null;
        }

        return {
          user_id: userData.user_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role: userRole,
          role_label: ROLE_LABELS[userRole] ?? userRole,
          is_validated: userData.is_validated ?? false,
          profile_picture_url: userData.profile_picture_url,
          phone: userData.phone,
          identity_document: userData.identity_document,
          birth_date: userData.birth_date,
        };
      } catch (error) {
        console.error("Error al obtener perfil del usuario:", error);
        return null;
      }
    },
    [],
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
          throw new Error(
            "Credenciales inválidas o sin permisos de administrador",
          );
        }
      } catch (err) {
        console.error("Login error:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getUserProfile],
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
    (roles: string | string[]) => {
      if (!user?.role) {
        return false;
      }
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(user.role);
    },
    [user],
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
