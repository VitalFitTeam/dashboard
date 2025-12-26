import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";
import { PackageListItem } from "@vitalfit/sdk";

interface UsePackagesProps {
  token: string;
}

export function usePackages({ token }: UsePackagesProps) {
  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    count: 0,
  });

  const fetchPackages = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      // Casteo a any para acceder a la respuesta anidada del backend
      const response: any = await api.packages.getPackages(token, {
        page: pagination.page,
        limit: pagination.limit,
        sort: "desc",
        search: search.trim() || undefined,
      });

      const backendData = response.data;

      setPackages(backendData.data || []);
      setPagination(prev => ({
        ...prev,
        total: backendData.total || 0,
        count: backendData.count || 0,
      }));
    } catch (error) {
      console.error("Error fetchPackages:", error);
      toast.error("Error al cargar la lista de paquetes");
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPackages();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchPackages]);

  return {
    packages,
    loading,
    search,
    updateSearch: (val: string) => {
      setSearch(val);
      setPagination(p => ({ ...p, page: 1 }));
    },
    refresh: fetchPackages,
  };
}