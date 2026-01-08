"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useInstructors } from "@/hooks/instructor/useInstructors";
import { useRouter } from "@/i18n/navigation";

import { useTranslations } from "next-intl";
import InstructorsTable from "@/components/modules/instructor/InstructorTable";

export default function InstructorPage() {
  const router = useRouter();
  const { token } = useAuth();
  

  const t = useTranslations("catalog.instructor");

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ 
    search: "", 
    sort: "desc" as "asc" | "desc",
    identity_doc: "" 
  });

  const { data, summary, isLoading, totalPages, refresh } = useInstructors(token, page, filters);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); 
  };

  if (!token) {
    return null;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={t("stats.total")}
          value={<h3 className="ml-1.5 font-bold">{summary?.total ?? 0}</h3>}
        />
        <StatCard
          title={t("stats.active")}
          value={<h3 className="ml-1.5 font-bold text-green-600">{summary?.actives ?? 0}</h3>}
        />

      </div>

      <PageHeader title={t("title")}>
        <Button onClick={() => router.push("/catalog/instructors/new")}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("add_button")}
        </Button>
      </PageHeader>

      <InstructorsTable
        data={data}
        isLoading={isLoading}
        onReload={refresh}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}