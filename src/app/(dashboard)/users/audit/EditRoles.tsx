"use client";

import type { Roles } from "@/models/roles";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "./RolesForm";
import { useState } from "react";

interface EditRolesProps {
  roles: Roles;
  onBack: () => void;
}

export default function EditRoles({ roles, onBack }: EditRolesProps) {
  const [formData, setFormData] = useState<Roles>({
    id: roles.id,
    name: roles.name,
    description: roles.description,
    permits: roles.permits,
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
        <PageHeader title="MODIFICAR ROL"></PageHeader>
        <p className="text-sm text-muted-foreground">Información del rol</p>

        <RolesForm formData={formData} onChange={handleChange} />
        <div className="flex gap-8">
          <Button className="w-full" variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
          <Button className="w-full" variant="primary">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
