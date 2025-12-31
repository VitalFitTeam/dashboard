import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";
import { User, PaginatedTotal } from "@vitalfit/sdk";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ClientStats {
    total: number;
    active: number;
    blocked: number;
}

interface UseClientsOptions {
    token: string | null;
    initialLimit?: number;
}

export function useClients({ token, initialLimit = 10 }: UseClientsOptions) {
    const t = useTranslations("clients");
    const [data, setData] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(initialLimit);
    const [totalItems, setTotalItems] = useState(0);
    const [reloadTrigger, setReloadTrigger] = useState(0);

    const [filters, setFilters] = useState({
        search: "",
        role: "all",
    });

    const [stats, setStats] = useState<ClientStats>({
        total: 0,
        active: 0,
        blocked: 0
    });

    const loadStats = useCallback(async () => {
        if (!token) return;

        try {
            const statsResponse = await api.user.getClientUsers(token, {
                role: "client",
                limit: 1000
            });

            const response = statsResponse as PaginatedTotal<User[]>;
            const allUsers = response.data || [];

            const activeCount = allUsers.filter((user) =>
                user.is_validated === true
            ).length;

            const blockedCount = allUsers.filter((user) =>
                user.is_validated === false || user.is_validated === undefined
            ).length;

            setStats({
                total: response.total || allUsers.length,
                active: activeCount,
                blocked: blockedCount
            });
        } catch (error) {
            console.error("Error loading stats:", error);
            toast.error(t("notifications.stats_error"));
        }
    }, [token, t]);

    const loadClients = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const options = {
                search: filters.search || undefined,
                page: page,
                limit: limit,
                sort: "desc" as "asc" | "desc", // Explicit cast to satisfy type requirements
                role: filters.role === "all" ? undefined : filters.role
            };

            const response = await api.user.getClientUsers(token, options);
            const paginatedResponse = response as PaginatedTotal<User[]>;

            const users = paginatedResponse.data || [];
            const total = paginatedResponse.total || 0;

            setData(users);
            setTotalItems(total);

            await loadStats();

        } catch (error) {
            console.error("Error loading clients:", error);
            toast.error(t("notifications.load_error"));
            setData([]);
            setTotalItems(0);
            setStats({
                total: 0,
                active: 0,
                blocked: 0
            });
        } finally {
            setIsLoading(false);
        }
    }, [token, page, limit, filters.search, filters.role, loadStats, t]);

    useEffect(() => {
        loadClients();
    }, [loadClients, reloadTrigger]);

    useEffect(() => {
        if (filters.search) {
            setPage(1);
        }
    }, [filters.search]);

    const reload = () => setReloadTrigger((prev) => prev + 1);

    const handlePageChange = (newPage: number) => setPage(newPage);

    const handleFilterChange = (newFilters: Partial<typeof filters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
        data,
        isLoading,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            onPageChange: handlePageChange
        },
        filters,
        onFilterChange: handleFilterChange,
        stats,
        reload
    };
}
