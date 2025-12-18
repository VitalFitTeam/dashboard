"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ServicesTable from "./ServicesTable";
import { StatCard } from "@/components/ui/StatCard";
import { useRouter } from "@/i18n/navigation";

interface StatsData {
  total: number;
  featured: number;
}

const initialStatsData: StatsData = {
  total: 0,
  featured: 0,
};

export default function ServicesPage() {
  const t = useTranslations("catalog.services");
  const router = useRouter();
  const [statsData, setStatsData] = useState<StatsData>(initialStatsData);

  // Configuramos las cards dentro del componente para usar 't'
  const statCardsConfig = useMemo(() => [
    {
      title: t("stats.total"),
      valueKey: "total" as const,
      fontColor: "text-black-600",
    },
    {
      title: t("stats.featured"),
      valueKey: "featured" as const,
      fontColor: "text-yellow-600",
    },
  ], [t]);

  const handleServiceUpdate = (stats: StatsData) => {
    setStatsData(stats);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-2">
        {statCardsConfig.map((card) => (
          <StatCard
            key={card.valueKey}
            title={card.title}
            value={
              <>
                {statsData[card.valueKey] ?? 0}
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
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/services/new")}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t("add_button")}
        </Button>
      </PageHeader>

      <ServicesTable onServiceUpdate={handleServiceUpdate} />
    </div>
  );
}