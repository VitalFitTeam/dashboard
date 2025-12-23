"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { StatCard } from "@/components/ui/StatCard";
import { useRouter } from "@/i18n/navigation";
import ServicesTable from "@/components/modules/services/ServicesTable";
import { useAuth } from "@/context/AuthContext";
import { useServices } from "@/hooks/services/useServices";

export default function ServicesPage() {
  const t = useTranslations("catalog.services");
  const router = useRouter();
  const { token } = useAuth();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", category: "all" });

  const {
    services,
    categories,
    isLoading,
    totalPages,
    totalItems,
    summary,
    refresh,
  } = useServices(token, page, filters);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleFilterChange = (newFilters: { search?: string; category?: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const statCardsConfig = useMemo(() => [
    {
      title: t("stats.total"),
      value: summary?.total,
      fontColor: "text-blue-600",
    },
    {
      title: t("stats.actives"),
      value: summary?.actives,
      fontColor: "text-green-600",
    },
    {
      title: t("stats.featured"),
      value: summary?.featured,
      fontColor: "text-purple-600",
    },
  ], [t, summary]);

  if (!token) {
    return null;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {statCardsConfig.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={
              <>
                <span className="font-bold text-2xl">{card.value}</span>
                <span className={`ml-1.5 font-semibold uppercase ${card.fontColor}`}>
                  {t("stats.unit")}
                </span>
              </>
            }
          />
        ))}
      </div>

      <PageHeader title={t("title")}>
        <Button
          className="bg-primary text-white"
          onClick={() => router.push("/catalog/services/new")}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t("add_button")}
        </Button>
      </PageHeader>

      <ServicesTable
        data={services}
        categories={categories}
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