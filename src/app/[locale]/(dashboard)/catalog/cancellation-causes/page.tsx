"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import CausesTable from "./CausesTable";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mockCauses, Cause } from "./data";

export default function Causes() {
  const router = useRouter();

  const [causesData, setCausesData] = useState<Cause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const loadCausesData = useCallback(async () => {
    setIsLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      let filteredData = [...mockCauses];
      
      // Aplicar filtro de búsqueda
      if (filters.search) {
        filteredData = filteredData.filter(cause => 
          cause.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          cause.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      // Aplicar filtro de estado
      if (filters.category !== "all") {
        filteredData = filteredData.filter(cause => 
          cause.status === filters.category
        );
      }
      
      setCausesData(filteredData);
      setTotalItems(filteredData.length);
      setIsLoading(false);
    }, 500);
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadCausesData();
  }, [loadCausesData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: {
    search?: string;
    category?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Resetear a primera página al filtrar
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="CAUSALES DE CANCELACIÓN">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/causes/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Causales
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">Cargando Causales...</div>
      ) : (
        <CausesTable
          data={causesData}
          onReload={loadCausesData}
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