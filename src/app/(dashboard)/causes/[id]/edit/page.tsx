"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import CausesForm from "../../CausesForm";
import { mockCauses, Cause } from "../../data";

export default function EditCausePage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cause, setCause] = useState<Cause | null>(null);

  useEffect(() => {
    // Simular carga de datos
    const foundCause = mockCauses.find(c => c.causes_id === params.id);
    if (foundCause) {
      setCause(foundCause);
    }
  }, [params.id]);

  const handleChange = (field: string, value: string) => {
    if (cause) {
      setCause(prev => prev ? { ...prev, [field]: value } : null);
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!cause) return;

    // Validación básica
    const newErrors: Record<string, string> = {};
    
    if (!cause.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    
    if (!cause.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Actualizando causa:", cause);
      //router.push(`/causes/${params.id}`);
    } catch (error) {
      console.error("Error actualizando causa:", error);
      setErrors({ submit: "Error al actualizar la causa" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cause) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="text-center p-10">Causal no encontrada</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="MODIFICAR CAUSAL DE CANCELACIÓN">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/causes/${params.id}`)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </PageHeader>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <form className="w-full" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <CausesForm
          cause={cause}
          onChange={handleChange}
          mode="edit"
          errors={errors}
        />
      </form>
    </div>
  );
}