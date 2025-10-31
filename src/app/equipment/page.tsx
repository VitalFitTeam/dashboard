"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import EquipmentTable from "./EquipmentTable";

export default function Users() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="EQUIPAMIENTO">
        <Button variant="primary">
          <PlusIcon className="h-5 w-5" />
          Agregar Equipamiento
        </Button>
      </PageHeader>

      <EquipmentTable />
    </div>
  );
}
