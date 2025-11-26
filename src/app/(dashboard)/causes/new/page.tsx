"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import CausesForm from "../CausesForm";

export default function NewCausePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newCause, setNewCause] = useState({
    name: "",
    description: "",
    status: "active" as 'active' | 'inactive'
  });

  const handleChange = (field: string, value: string) => {
    setNewCause(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!newCause.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    
    if (!newCause.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Creando causa:", newCause);
      //router.push("/causes");
    } catch (error) {
      console.error("Error creando causa:", error);
      setErrors({ submit: "Error al crear la causa" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="CREAR CAUSAL DE CANCELACIÓN">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/causes")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando..." : "Crear"}
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
          cause={newCause}
          onChange={handleChange}
          mode="create"
          errors={errors}
        />
      </form>
    </div>
  );
}