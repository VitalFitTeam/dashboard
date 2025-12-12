"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import CausesForm from "../CausesForm";
import { mockCauses, Cause } from "../data";

export default function CauseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cause, setCause] = useState<Cause | null>(null);

  useEffect(() => {
    const foundCause = mockCauses.find(c => c.causes_id === params.id);
    if (foundCause) {
      setCause(foundCause);
    }
  }, [params.id]);

  if (!cause) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="text-center p-10">Causal no encontrada</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader subtitle="Información de la cancelación" title="DETALLES DE LA CAUSAL">
        <Button
          onClick={() => router.push(`/causes/${params.id}/edit`)}
          className="flex items-center gap-2"
        >
          Modificar
        </Button>
      </PageHeader>

      <div className="w-full">
        <CausesForm
          cause={cause}
          mode="view"
        />
      </div>
    </div>
  );
}