"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import PackageTable from "./PackageTable";
import { useTranslations } from "next-intl";
import { usePackages } from "@/hooks/packages/usePackages";

export default function PackagesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const t = useTranslations("catalog.packages");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
  });

  const { packageData, isLoading, totalPages, refresh } = usePackages(
    token,
    page,
    pageSize,
    filters
  );

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleFilterChange = (newFilters: { search?: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title={t("title")} subtitle="">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/catalog/packages/new")}
        >
          <PlusIcon className="h-5 w-5" />
          {t("add_button")}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">{t("loading")}</div>
      ) : (
        <PackageTable
          data={packageData}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReload={refresh}
        />
      )}
    </div>
  );
}
