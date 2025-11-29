"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import ClientsTable from "./ClientsTable";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { clientsData } from "./data";

export default function Clients() {
  const [data, setData] = useState<any[]>([]);
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

  useEffect(() => {
    const loadClientsData = async () => {
      setIsLoading(true);
      try {

        const filteredData = clientsData.filter(client => {
          const matchesSearch = filters.search === "" ||
            client.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            client.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            client.email.toLowerCase().includes(filters.search.toLowerCase());
          return matchesSearch;
        });

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = filteredData.slice(start, end);

        setData(paginatedData);
        setTotalItems(filteredData.length);

        setStats({
          total: clientsData.length,
          active: clientsData.filter(c => c.status === "active").length,
          blocked: clientsData.filter(c => c.status === "blocked").length
        });

      } catch (error) {
        console.error("Error loading clients:", error);
        setData([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadClientsData();
  }, [pageSize, filters, page, reloadTrigger]);

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
          title="BLOQUEADO"
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
          data={data}
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