"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Equipment } from "@/models/equipment";
import CreateEquipment from "./CreateEquipment";
import EditEquipment from "./EditEquipment";
import ViewDetailsEquipment from "./ViewDetailsEquipment";
import EquipmentTable from "./EquipmentTable";
import { useState } from "react";

export default function Equipment() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  );
  const [viewEquipment, setViewEquipment] = useState<Equipment | null>(null);

  if (showCreateForm) {
    return <CreateEquipment onBack={() => setShowCreateForm(false)} />;
  }

  if (editingEquipment) {
    return (
      <EditEquipment
        equipment={editingEquipment}
        onBack={() => setEditingEquipment(null)}
      />
    );
  }

  if (viewEquipment) {
    return (
      <ViewDetailsEquipment
        equipment={viewEquipment}
        onBack={() => setViewEquipment(null)}
      />
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="EQUIPAMIENTO">
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-5 w-5" />
          Agregar Equipamiento
        </Button>
      </PageHeader>
      <EquipmentTable
        onView={(equipment) => setViewEquipment(equipment)}
        onEdit={(equipment) => setEditingEquipment(equipment)}
      />
    </div>
  );
}
