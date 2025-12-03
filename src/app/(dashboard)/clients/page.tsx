"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import ClientsTable from "./ClientsTable";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { DataResponse, User } from "@vitalfit/sdk";

export default function Clients() {
  const [allData, setAllData] = useState<User[]>([]);
  const [paginatedData, setPaginatedData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0
  });

  const { token } = useAuth();

  useEffect(() => {
    const loadAllClients = async () => {
      if (!token) { return; }

      setIsLoading(true);
      try {
        const options = {
          search: filters.search || undefined,
          sort: "desc" as "asc" | "desc",
          role: "client"
        };

        const response = await api.user.getClientUsers(token, options);

        const allUsers = (response as DataResponse<User[]>).data || [];

        const activeCount = allUsers.filter(user =>
          user.is_validated === true
        ).length;

        const blockedCount = allUsers.filter(user =>
          user.is_validated === false || user.is_validated === undefined
        ).length;

        setAllData(allUsers);
        setTotalItems(allUsers.length);

        setStats({
          total: allUsers.length,
          active: activeCount,
          blocked: blockedCount
        });

      } catch (error) {
        console.error("Error loading clients:", error);
        setAllData([]);
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

    loadAllClients();
  }, [filters.search, reloadTrigger, token]);

  // Aplicar paginación cuando cambia la página o los datos
  useEffect(() => {
    if (allData.length === 0) {
      setPaginatedData([]);
      return;
    }

    // Aplicar paginación manualmente
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = allData.slice(startIndex, endIndex);

    setPaginatedData(paginated);
  }, [allData, page, pageSize]);

  useEffect(() => {
    if (allData.length === 0) { return; }
    let filtered = allData;

    setTotalItems(filtered.length);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    setPaginatedData(paginated);

    const activeCount = filtered.filter(user =>
      user.is_validated === true
    ).length;

    const blockedCount = filtered.filter(user =>
      user.is_validated === false || user.is_validated === undefined
    ).length;

    setStats({
      total: filtered.length,
      active: activeCount,
      blocked: blockedCount
    });
  }, [allData, page, pageSize, filters.category]);

  const handlePageChange = (newPage: number) => {
    console.log("Changing to page:", newPage);
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: {
    search?: string;
    category?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reiniciar a página 1 al filtrar
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
          data={paginatedData.map(user => ({
            client_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            category: "N/A",
            status: user.is_validated ? "active" : "blocked"
          }))}
          onReload={handleReload}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
    </div>
  );
}