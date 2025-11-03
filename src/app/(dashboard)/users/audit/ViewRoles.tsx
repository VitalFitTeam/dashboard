"use client";
import type { Roles } from "@/models/roles";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "./RolesForm";
import { useState } from "react";

interface ViewRolesProps {
  roles: Roles;
  onBack: () => void;
}

export default function ViewRoles({ roles, onBack }: ViewRolesProps) {
  const [formData, setFormData] = useState<Roles>({
    id: roles.id,
    name: roles.name,
    description: roles.description,
    permits: roles.permits,
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <PageHeader title="DETALLES ROL">
        <Button variant="secondary" onClick={onBack}>
          Volver
        </Button>
      </PageHeader>

      <RolesForm formData={formData} onChange={() => {}} disabled={true} />
    </div>
  );
}
