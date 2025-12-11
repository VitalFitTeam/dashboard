"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import InstructorsTable from "./InstructorTable";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { InstructorDataList } from "@vitalfit/sdk";
import { useRouter } from "next/navigation";

export default function Instructor() {
  const router = useRouter();
  const { token } = useAuth();

  const [instructorData, setInstructorData] = useState<InstructorDataList[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0); // Añade este estado

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const [summary, setSummary] = useState<{
    total: number;
    actives: number;
    blocked: number;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const loadInstructorData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const result = await api.instructor.getInstructors(
          {
            limit: pageSize,
            page: page,
            search: filters.search || undefined,
          },
          token,
        );

        setInstructorData(result.data || []);
        setTotalItems(result.total || 0);
      } catch (error) {
        console.error("Error cargando Instructor:", error);
        setInstructorData([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstructorData();
  }, [token, pageSize, filters, page, reloadTrigger]); // Añade reloadTrigger como dependencia

  useEffect(() => {
    const loadSummary = async () => {
      if (!token) {
        setSummary(null);
        setSummaryLoading(false);
        return;
      }
      setSummaryLoading(true);
      try {
        const res = await api.instructor.getSummary(token);
        setSummary(res?.data ?? null);
      } catch (err) {
        console.error("Error cargando resumen de instructores:", err);
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [token, reloadTrigger]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: {
    search?: string;
    category?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReload = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard
          title="Total"
          value={
            <>
              <h3 className="ml-1.5 font-normal">
                {summaryLoading ? "..." : (summary?.total ?? 0)} INSTRUCTORES
              </h3>
            </>
          }
        />
        <StatCard
          title="Activos"
          value={
            <>
              <h3 className="ml-1.5 font-normal text-green-500">
                {summaryLoading ? "..." : (summary?.actives ?? 0)} INSTRUCTORES
              </h3>
            </>
          }
        />
        <StatCard
          title="Bloqueados"
          value={
            <>
              <h3 className="ml-1.5 font-normal text-red-500">
                {summaryLoading ? "..." : (summary?.blocked ?? 0)} INSTRUCTORES
              </h3>
            </>
          }
        />
      </div>

      <PageHeader title="Instructor">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/instructors/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Instructor
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">Cargando Instructor...</div>
      ) : (
        <InstructorsTable
          data={instructorData}
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
