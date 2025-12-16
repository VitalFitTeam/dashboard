"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/sdk-config";
import { PackageListItem } from "@vitalfit/sdk";
import PackageTable from "./PackageTable";

interface PaginatedPackages {
  data: PackageListItem[];
  total: number;
  count: number;
  next?: string;
  previous?: string;
}

export default function Package() {
  const router = useRouter();
  const { token } = useAuth();

  const [packageData, setPackageData] = useState<PackageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadFlag, setReloadFlag] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    const loadPackageData = async () => {
      if (!token) {
        return;
      }

      setIsLoading(true);

      try {
        const result = await api.packages.getPackages(token, {
          page,
          limit: pageSize,
          sort: "desc",
          search: filters.search || undefined,
        });

        const paquetesResult = result as unknown as { data: PaginatedPackages };

        setPackageData(paquetesResult.data.data);
        setTotalItems(paquetesResult.data.total ?? 0);

        console.log("Paquetes cargados:", paquetesResult.data.data);
      } catch (error) {
        console.error("Error cargando paquetes:", error);
        setPackageData([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadPackageData();
  }, [token, page, pageSize, filters.search, reloadFlag]);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleFilterChange = (newFilters: { search?: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleReload = () => setReloadFlag((prev) => prev + 1);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="Paquetes de servicios" subtitle="">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/packages/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar una paquete
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">Cargando paquetes...</div>
      ) : (
        <PackageTable
          data={packageData}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReload={handleReload}
        />
      )}
    </div>
  );
}
