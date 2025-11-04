"use client";
import { Membership } from "@/models/membership";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import MembershipForm from "./MembershipForm";
import { useState } from "react";

interface CreateMembershipProps {
  onBack: () => void;
}

export default function CreateMembership({ onBack }: CreateMembershipProps) {
  const [formData, setFormData] = useState<Membership>({
    id: "001",
    name: "",
    description: "",
    duration: 0,
    price: 0,
    status: "Active",
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
        <PageHeader title="CREAR MEBRESÍA"></PageHeader>

        <MembershipForm formData={formData} onChange={handleChange} />
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
