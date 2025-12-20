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
    refresh, 
  } = useServices(token, page, filters);

  const handlePageChange = (newPage: number) => setPage(newPage);
  
  const handleFilterChange = (newFilters: { search?: string; category?: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); 
  };

  const featuredCount = useMemo(
    () => services.filter((s) => s.is_featured).length,
    [services]
  );

  const statCardsConfig = useMemo(() => [
    {
      title: t("stats.total"),
      value: totalItems, 
      fontColor: "text-green-600",
    },
    {
      title: t("stats.featured"),
      value: featuredCount,
      fontColor: "text-orange-600",
    },
  ], [t, totalItems, featuredCount]);

  if (!token) {
    return null;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-2">
        {statCardsConfig.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={
              <>
                {card.value}
                <span className={`ml-1.5 font-normal ${card.fontColor}`}>
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