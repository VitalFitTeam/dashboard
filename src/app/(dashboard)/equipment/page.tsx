"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import EquipmentTable from "./EquipmentTable";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Equipment as EquipmentType, EquipmentCategory } from "@vitalfit/sdk";
import { useRouter } from "next/navigation";

export default function Equipment() {
  const router = useRouter();
  const { token } = useAuth();

  const [equipmentData, setEquipmentData] = useState<EquipmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const loadEquipmentData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const categoryParam =
        filters.category !== "all"
          ? (filters.category as EquipmentCategory)
          : undefined;

      const result = await api.equipment.getEquipment(token, {
        limit: pageSize,
        page,
        search: filters.search || undefined,
        category: categoryParam,
      });

      console.log("Datos página", page, ":", result.data?.length, "registros");

      setEquipmentData(result.data || []);
      setTotalItems(result.total || 0);
    } catch (error) {
      console.error("Error cargando equipamiento:", error);
      setEquipmentData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, pageSize, filters]);

  useEffect(() => {
    const loadEquipmentData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const categoryParam =
          filters.category !== "all"
            ? (filters.category as EquipmentCategory)
            : undefined;

        const result = await api.equipment.getEquipment(token, {
          limit: pageSize,
          page: page,
          search: filters.search || undefined,
          category: categoryParam,
        });

        console.log(
          "Datos página",
          page,
          ":",
          result.data?.length,
          "registros",
        );
        setEquipmentData(result.data || []);
        setTotalItems(result.total || 0);
      } catch (error) {
        console.error("Error cargando equipamiento:", error);
        setEquipmentData([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: {
    search?: string;
    category?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="EQUIPAMIENTO">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/equipment/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Equipamiento
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">Cargando equipamiento...</div>
      ) : (
        <EquipmentTable
          data={equipmentData}
          onReload={() => setPage((prev) => prev)}
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
