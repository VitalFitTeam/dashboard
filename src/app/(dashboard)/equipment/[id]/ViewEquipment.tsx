"use client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import EquipmentForm from "../EquipmentForm";
import { useRouter } from "next/navigation";
import { EquipmentInfo } from "@vitalfit/sdk";

interface ViewEquipmentProps {
  equipment: EquipmentInfo;
}

export default function ViewEquipment({ equipment }: ViewEquipmentProps) {
  const router = useRouter();
  const id = equipment.equipment_id;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <PageHeader title="DETALLES DE EQUIPAMIENTO">
        <Button
          onClick={() => router.push(`/equipment/${id}/edit`)}
          variant="primary"
        >
          Modificar
        </Button>
      </PageHeader>
      <p className="text-sm text-muted-foreground">
        Información del equipamiento
      </p>

      <EquipmentForm formData={equipment} onChange={() => {}} disabled />
    </div>
  );
}
