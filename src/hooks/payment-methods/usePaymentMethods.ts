import { useState, useCallback, useEffect, useMemo } from "react";
import { PaymentMethod } from "@vitalfit/sdk";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { api } from "@/lib/sdk-config";

export function usePaymentMethods(token: string | null) {
  const t = useTranslations("catalog.payment_methods");
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", type: "", status: "" });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchMethods = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.paymentMethod.getPaymentMethods(token);
      setData(response.data || []);
    } catch (error) {
      toast.error(t("notifications.error_title"), { description: t("notifications.load_error") });
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = !filters.search || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesType = !filters.type || item.type === filters.type;
      
      const matchesStatus = !filters.status || 
        (filters.status === "active" ? item.global_status === true : item.global_status === false);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [data, filters]);

  const stats = useMemo(() => {
    return filteredData.reduce((acc, pm) => {
      acc.total++;
      if (pm.type === "Cash") acc.cash++;
      if (pm.processing_type === "Gateway") acc.gateway++;
      if (["Card", "Transfer", "Other"].includes(pm.type)) acc.digital++;
      return acc;
    }, { total: 0, cash: 0, gateway: 0, digital: 0 });
  }, [filteredData]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  return {
    paginatedData,
    stats,
    loading,
    filters,
    setFilters: (f: any) => { setFilters(f); setPage(1); },
    pagination: { page, totalPages, setPage },
    refresh: fetchMethods,
    allFiltered: filteredData
  };
}