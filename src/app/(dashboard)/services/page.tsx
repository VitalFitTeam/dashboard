"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ServicesTable from "./ServicesTable";
import { StatCard } from "@/components/ui/StatCard";

const statsData = {
  total: 6,
  active: 5,
  featured: 2,
};

const statCardsConfig = [
  {
    title: "Total",
    valueKey: "total" as keyof typeof statsData,
    fontColor: "text-black-600",
  },
  {
    title: "Activos",
    valueKey: "active" as keyof typeof statsData,
    fontColor: "text-green-600",
  },
  {
    title: "Destacados",
    valueKey: "featured" as keyof typeof statsData,
    fontColor: "text-yellow-600",
  },
];

export default function Services() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCardsConfig.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={
              <>
                {card.valueKey === "total"
                  ? statsData.active + statsData.featured + statsData.total
                  : (statsData[card.valueKey] ?? 0)}
                <span className={`ml-1.5 font-normal ${card.fontColor} `}>
                  SERVICIOS
                </span>
              </>
            }
          />
        ))}
      </div>

      <PageHeader title="SERVICIOS">
        <Button variant="primary">
          <PlusIcon className="h-5 w-5" />
          Agregar Servicios
        </Button>
      </PageHeader>

      <ServicesTable />
    </div>
  );
}
