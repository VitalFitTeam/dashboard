"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { EquipmentCategory } from "@vitalfit/sdk";

import EquipmentTable from "./EquipmentTable";
import { useEquipment } from "@/hooks/equipment/useEquipment";
import { useTranslations } from "next-intl";

export default function Equipment() {
  const t = useTranslations("catalog.equipment");
  const router = useRouter();
  const { token } = useAuth();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ search?: string; category?: EquipmentCategory }>({
    search: "",
    category: undefined,
  });

  const {
    equipmentData,
    isLoading,
    totalPages,
    pageSize,
    refresh
  } = useEquipment(token, filters, page);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (newFilters: { search?: string; category?: EquipmentCategory }) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title={t("title")}>
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/catalog/equipment/new")}
        >
          <PlusIcon className="h-5 w-5" />
          {t("addButton")}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10 py-20">
          <span className="animate-pulse text-muted-foreground font-medium">
            {t("loading")}
          </span>
        </div>
      ) : (
        <EquipmentTable
          data={equipmentData}
          onReload={refresh}
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