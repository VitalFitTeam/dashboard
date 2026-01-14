import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";
import { User } from "@vitalfit/sdk";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface UserFilters {
  search?: string;
  role?: string;
}

export function useStaffUsers(token: string | null, filters: UserFilters = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("user.management");

  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    let toastId;
    if (isManualRefresh) {
      toastId = toast.loading(t("notifications.refresh_loading"));
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
        toast.success(t("notifications.refresh_success"), { id: toastId });
      }

    } catch (err) {
      console.error("Error loading users:", err);
      const message = t("notifications.error_list_load");
      setError(message);

      toast.error(t("notifications.error_load_title"), {
        description: message,
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, filters.search, filters.role, t]);

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