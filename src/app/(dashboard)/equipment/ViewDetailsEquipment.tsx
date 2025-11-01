"use client";
import type { Equipment } from "@/models/equipment";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import EquipmentForm from "./EquipmentForm";
import { useState } from "react";

interface ViewDetailsEquipmentProps {
  equipment: Equipment;
  onBack: () => void;
}

export default function ViewDetailsEquipment({
  equipment,
  onBack,
}: ViewDetailsEquipmentProps) {
  const [formData, setFormData] = useState<Equipment>({
    id: "",
    name: "",
    category: "Cardio",
    description: "",
    brand: "",
    model: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.warn("enviar formulario");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="DETALLES">
          <Button variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Modificar
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          información del equipamiento
        </p>

        <EquipmentForm formData={formData} onChange={() => {}} disabled />
      </form>
    </div>
  );
}
