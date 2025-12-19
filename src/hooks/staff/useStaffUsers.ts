import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";
import { User } from "@vitalfit/sdk";
import { toast } from "sonner";

interface UserFilters {
  search?: string;
  role?: string;
}

export function useStaffUsers(token: string | null, filters: UserFilters = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    let toastId;
    if (isManualRefresh) {
      toastId = toast.loading("Actualizando lista de usuarios...");
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.user.getStaffUsers({ 
        search: filters.search || undefined, 
        role: filters.role || undefined 
      }, token);

      setUsers(response.data || []);

      if (isManualRefresh) {
        toast.success("Lista actualizada", { id: toastId });
      }

    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      const message = "No se pudo cargar la lista de usuarios";
      setError(message);

      toast.error("Error de carga", {
        description: message,
        id: toastId, 
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, filters.search, filters.role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { 
    users, 
    isLoading, 
    error, 
    refresh: () => fetchUsers(true) 
  };
}