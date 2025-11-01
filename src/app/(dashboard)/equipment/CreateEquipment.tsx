"use client";
import { Equipment } from "@/models/equipment";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import EquipmentForm from "./EquipmentForm";
import { useState } from "react";

interface CreateEquipmentProps {
  onBack: () => void;
}

export default function CreateEquipment({ onBack }: CreateEquipmentProps) {
  const [formData, setFormData] = useState<Equipment>({
    id: "",
    name: "",
    category: "Cardio",
    description: "",
    brand: "",
    model: "",
  });

  const handleChange = (field: keyof Equipment, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.warn("enviar formulario");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="CREAR EQUIPO">
          <Button variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Cambios
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          Ingrese la información de un nuevo equipo
        </p>

        <EquipmentForm formData={formData} onChange={handleChange} />
      </form>
    </div>
  );
}
