"use client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import MembershipForm from "../MembershipForm";
import { MembershipType } from "@vitalfit/sdk";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ViewMembershipProps {
  membership: MembershipType;
}

export default function ViewMembership({ membership }: ViewMembershipProps) {
  const router = useRouter();
  const id = membership.membership_type_id;

  const [formData, setFormData] = useState<MembershipType>({
    membership_type_id: membership.membership_type_id,
    name: membership.name,
    description: membership.description,
    duration_days: membership.duration_days,
    price: membership.price,
    is_active: membership.is_active,
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <PageHeader title="DETALLES DE MEMBRESÍA">
        <Button
          variant="primary"
          onClick={() => {
            router.push(`/memberships/${id}/edit`);
          }}
        >
          Modificar
        </Button>
      </PageHeader>

      <MembershipForm
        formData={formData}
        onChange={() => {}}
        mode="view"
        disabled
      />
    </div>
  );
}
