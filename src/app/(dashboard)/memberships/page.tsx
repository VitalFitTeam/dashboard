"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Membership } from "@/models/membership";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import CreateMembership from "./CreateMembership";
import EditMembership from "./EditMembership";
import ViewMembership from "./ViewMembership";
import MembershipTable from "./MembershipTable";

export default function Membership() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(
    null,
  );
  const [viewMembership, setViewMembership] = useState<Membership | null>(null);

  if (showCreateForm) {
    return <CreateMembership onBack={() => setShowCreateForm(false)} />;
  }

  if (editingMembership) {
    return (
      <EditMembership
        membership={editingMembership}
        onBack={() => setEditingMembership(null)}
      />
    );
  }

  if (viewMembership) {
    return (
      <ViewMembership
        membership={viewMembership}
        onBack={() => setViewMembership(null)}
      />
    );
  }

  const statsData = {
    total: 5,
    active: 2,
    inactive: 3,
  };

  const statCardsConfig = [
    {
      title: "Total",
      valueKey: "total" as keyof typeof statsData,
      fontColor: "text-black-600",
    },
    {
      title: "Activas",
      valueKey: "active" as keyof typeof statsData,
      fontColor: "text-green-600",
    },
    {
      title: "Inactivas",
      valueKey: "inactive" as keyof typeof statsData,
      fontColor: "text-primary",
    },
  ];

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
                  ? statsData.active + statsData.inactive
                  : (statsData[card.valueKey] ?? 0)}
                <span className={`ml-1.5 font-normal ${card.fontColor}`}>
                  MEMBRESÍAS
                </span>
              </>
            }
          />
        ))}
      </div>
      <PageHeader title="MEMBRESÍA">
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-5 w-5" />
          Crear
        </Button>
      </PageHeader>

      <MembershipTable
        onView={(membership) => setViewMembership(membership)}
        onEdit={(membership) => setEditingMembership(membership)}
      />
    </div>
  );
}
