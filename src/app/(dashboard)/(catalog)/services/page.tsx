"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ServicesTable from "./ServicesTable";
import { StatCard } from "@/components/ui/StatCard";
import { useRouter } from "next/navigation";

interface StatsData {
  total: number;
  featured: number;
}

const initialStatsData: StatsData = {
  total: 0,
  featured: 0,
};

const statCardsConfig = [
  {
    title: "Total",
    valueKey: "total" as const,
    fontColor: "text-black-600",
  },
  {
    title: "Destacados",
    valueKey: "featured" as const,
    fontColor: "text-yellow-600",
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const [statsData, setStatsData] = useState<StatsData>(initialStatsData);

  const handleServiceUpdate = (stats: StatsData) => {
    setStatsData(stats);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Tarjetas de estadísticas en tiempo real */}
      <div className="grid gap-4 md:grid-cols-2">
        {statCardsConfig.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={
              <>
                {statsData[card.valueKey] ?? 0}
                <span className={`ml-1.5 font-normal ${card.fontColor}`}>
                  SERVICIOS
                </span>
              </>
            }
          />
        ))}
      </div>

      <PageHeader title="SERVICIOS">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/services/new")}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Servicio
        </Button>
      </PageHeader>

      <ServicesTable onServiceUpdate={handleServiceUpdate} />
    </div>
  );
}
