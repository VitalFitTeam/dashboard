"use client";
import type { Membership } from "@/models/membership";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import MembershipForm from "./MembershipForm";
import { useState } from "react";

interface ViewMembershipProps {
  membership: Membership;
  onBack: () => void;
}

export default function ViewMembership({
  membership,
  onBack,
}: ViewMembershipProps) {
  const [formData, setFormData] = useState<Membership>({
    id: membership.id,
    name: membership.name,
    description: membership.description,
    duration: membership.duration,
    price: membership.price,
    status: membership.status,
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <PageHeader title="DETALLES MEMBRESÍA">
        <Button variant="secondary" onClick={onBack}>
          Volver
        </Button>
      </PageHeader>

      <MembershipForm formData={formData} onChange={() => {}} disabled={true} />
    </div>
  );
}
