import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";
import { InstructorDataList } from "@vitalfit/sdk";
import { toast } from "sonner";

interface InstructorFilters {
  search?: string;
  sort?: "asc" | "desc";
  identity_doc?: string;
}

export function useInstructors(token: string | null, page: number, filters: InstructorFilters) {
  const [data, setData] = useState<InstructorDataList[]>([]);
  const [summary, setSummary] = useState<{ total: number; actives: number; blocked: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async (isManual = false) => {
    if (!token){
         return;
    }

    let toastId;
    if (isManual) {
        toastId = toast.loading("Actualizando instructores...");
    }
    
    setIsLoading(true);
    try {
      const [instructorsRes, summaryRes] = await Promise.all([
        api.instructor.getInstructors({ 
          limit: 10, 
          page, 
          search: filters.search || undefined,
          sort: filters.sort || "desc",
          identity_doc: filters.identity_doc || undefined
        }, token),
        api.instructor.getSummary(token)
      ]);

      setData(instructorsRes.data || []);
      setTotalItems(instructorsRes.total || 0); 
      setSummary(summaryRes?.data ?? null);

      if (isManual){
         toast.success("Sincronizado", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [token, page, filters.search, filters.sort, filters.identity_doc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    summary,
    isLoading,
    totalPages: Math.ceil(totalItems / 10) || 1,
    refresh: () => loadData(true),
  };
}