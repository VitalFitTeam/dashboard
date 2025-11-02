"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Instructor } from "@/models/instructor";
import EditInstructor from "./EditInstructor";
import InstructorTable from "./InstructorTable";
import ViewDetailsInstructor from "./ViewDetailsInstructor";
import { StatCard } from "@/components/ui/StatCard";
import CreateInstructor from "./CreateInstructor";
import { useState } from "react";

export default function Instructor() {

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [viewInstructor, setViewInstructor] = useState<Instructor | null>(null);

  if (showCreateForm) {
    return <CreateInstructor onBack={() => setShowCreateForm(false)} />;
  }

  if (editingInstructor) {
    return (
      <EditInstructor
        instructor={editingInstructor}
        onBack={() => setEditingInstructor(null)}
      />
    );
  }

  if (viewInstructor) {
    return (
      <ViewDetailsInstructor
        instructor={viewInstructor}
        onBack={() => setViewInstructor(null)}
      />
    );
  }

  const statsData = {
    total: 4,
    active: 3,
    blocked: 1,
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
      title: "Bloqueados",
      valueKey: "blocked" as keyof typeof statsData,
      fontColor: "text-red-600",
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
                  ? statsData.active + statsData.blocked
                  : (statsData[card.valueKey] ?? 0)}
                <span className={`ml-1.5 font-normal ${card.fontColor}`}>
                  INSTRUCTORES
                </span>
              </>
            }
          />
        ))}
      </div>
      <PageHeader title="INSTRUCTORES">
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-5 w-5" />
          Agregar Instructor
        </Button>
      </PageHeader>
      <InstructorTable
        onView={(instructor) => setViewInstructor(instructor)}
        onEdit={(instructor) => setEditingInstructor(instructor)}
      />
    </div>
  );
}