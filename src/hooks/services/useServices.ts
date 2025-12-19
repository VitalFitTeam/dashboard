import { api } from "@/lib/sdk-config";
import { ServiceCategoryInfo, ServiceFullDetail } from "@vitalfit/sdk";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

interface Filters {
    search: string;
    category: string;
}

export function useServices(token: string | null, page: number, filters: Filters) {
    const [services, setServices] = useState<ServiceFullDetail[]>([]);
    const [categories, setCategories] = useState<ServiceCategoryInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const filtersKey = JSON.stringify(filters);
    const lastFiltersRef = useRef(filtersKey);

    const loadData = useCallback(async (isManual = false) => {
        if (!token) {
            return;
        }

        let toastId: string | number | undefined;
        if (isManual) {
            toastId = toast.loading("Actualizando catálogo...");
        }

        setIsLoading(true);

        try {
            const categoryParam = filters.category === "all" || !filters.category
                ? undefined
                : filters.category;

            const [servicesRes, categoriesRes] = await Promise.all([
                api.products.getServices(token, {
                    page: page,
                    limit: 10,
                    sort: "desc",
                    search: filters.search?.trim() || undefined,
                    category: categoryParam,
                }),
                api.products.getCategories(token),
            ]);

            const newData = servicesRes.data || [];
            const serverTotal = Number(servicesRes.total) || 0;

            setServices(newData);
            setCategories(categoriesRes.data || []);

            setTotalItems((prevTotal) => {
                if (filtersKey !== lastFiltersRef.current) {
                    lastFiltersRef.current = filtersKey;
                    return serverTotal;
                }

                if (serverTotal === 0 && newData.length > 0) {
                    return prevTotal;
                }

                return serverTotal;
            });

            if (isManual && toastId){
                toast.success("Sincronizado correctamente", { id: toastId });
            }
                
        } catch (error) {
            console.error("Error en useServices:", error);
            if (isManual) {
                toast.error("No se pudo actualizar", { id: toastId });
            } else {
                toast.error("Error al cargar servicios");
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, page, filtersKey]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalPages = useMemo(() => {
        return totalItems > 0 ? Math.ceil(totalItems / 10) : 1;
    }, [totalItems]);

    return {
        services,
        categories,
        isLoading,
        totalPages,
        totalItems,
        refresh: () => loadData(true),
    };
}