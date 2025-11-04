"use client";

import type { Membership } from "@/models/membership";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import MembershipForm from "./MembershipForm";
import { useState } from "react";

interface EditMembershipProps {
  membership: Membership;
  onBack: () => void;
}

export default function EditMembership({
  membership,
  onBack,
}: EditMembershipProps) {
  const [formData, setFormData] = useState<Membership>({
    id: membership.id,
    name: membership.name,
    description: membership.description,
    duration: membership.duration,
    price: membership.price,
    status: membership.status,
  });

  const handleChange = (field: keyof Membership, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.warn("enviar formulario");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="MODIFICAR MEMBRESÍA"></PageHeader>
        <p className="text-sm text-muted-foreground">
          Información de membresía
        </p>

        <MembershipForm
          formData={formData}
          onChange={handleChange}
          edit={true}
        />
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
