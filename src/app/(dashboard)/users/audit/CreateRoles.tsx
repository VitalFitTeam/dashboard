"use client";
import { Roles } from "@/models/roles";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "./RolesForm";
import { useState } from "react";

interface CreateRolesProps {
  onBack: () => void;
}

export default function CreateRole({ onBack }: CreateRolesProps) {
  const [formData, setFormData] = useState<Roles>({
    id: "",
    name: "",
    description: "",
    permits: "",
  });

  const handleChange = (field: keyof Roles, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.warn("enviar formulario");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="CREAR NUEVO ROL"></PageHeader>

        <RolesForm formData={formData} onChange={handleChange} />
        <div className="flex gap-8">
          <Button className="w-full" variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
          <Button className="w-full" variant="primary">
            Crear
          </Button>
        </div>
      </form>
    </div>
  );
}
