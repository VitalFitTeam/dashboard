"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import ClientsTable from "./ClientsTable";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { DataResponse, User, PaginatedTotal } from "@vitalfit/sdk";

export default function Clients() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0
  });

  const { token } = useAuth();

  const loadStats = async () => {
    if (!token) {
      return;
    }

    try {
      const statsResponse = await api.user.getClientUsers(token, {
        role: "client",
        limit: 1000
      });

      const response = statsResponse as PaginatedTotal<User[]>;
      const allUsers = response.data || [];

      const activeCount = allUsers.filter(user =>
        user.is_validated === true
      ).length;

      const blockedCount = allUsers.filter(user =>
        user.is_validated === false || user.is_validated === undefined
      ).length;

      setStats({
        total: response.total || allUsers.length,
        active: activeCount,
        blocked: blockedCount
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadClients = async () => {
    if (!token) { return; }

    setIsLoading(true);
    try {
      const options = {
        search: filters.search || undefined,
        page: page,
        limit: limit,
        sort: "desc" as "asc" | "desc",
        role: "client"
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
  };

  useEffect(() => {
    loadClients();
  }, [page, filters.search, reloadTrigger, token, limit]);

  useEffect(() => {
    if (filters.search) {
      setPage(1);
    }
  }, [filters.search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: {
    search?: string;
    category?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleReload = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="TOTAL"
          value={<h3 className="text-4xl">{stats.total} CLIENTES</h3>}
          bottomMarkup={true}
        />
        <StatCard
          title="ACTIVOS"
          value={<h3 className="text-4xl text-green-500">{stats.active} CLIENTES</h3>}
          bottomMarkup={true}
        />
        <StatCard
          title="INACTIVOS/BLOQUEADOS"
          value={<h3 className="text-4xl text-red-500">{stats.blocked} CLIENTES</h3>}
          bottomMarkup={true}
        />
      </div>

      <PageHeader title="CLIENTES" >
        <Button variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" />
          Agregar un Cliente
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">Cargando Clientes...</div>
      ) : (
        <ClientsTable
          data={data.map(user => ({
            client_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            category: "N/A",
            status: user.is_validated ? "active" : "blocked"
          }))}
          onReload={handleReload}
          page={page}
          pageSize={limit}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={handleFilterChange}
          totalItems={totalItems}
        />
      )}
    </div>
  );
}