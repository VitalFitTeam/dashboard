"use client";

import { useState } from "react";
import { Equipment } from "@/models/equipment";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import EquipmentForm from "../EquipmentForm";
import { api } from "@/lib/sdk-config";
import type { CreateEquipment } from "@vitalfit/sdk";
import { Notification } from "@/components/ui/Notification";
import { type EquipmentSchema } from "@/lib/validation/equipmentSchema";
import { useRouter } from "next/navigation";

interface CreateEquipmentProps {
  onBack: () => void;
}

export default function CreateEquipment({ onBack }: CreateEquipmentProps) {
  const [formData, setFormData] = useState<EquipmentSchema>({
    equipment_id: "",
    name: "",
    description: "",
    brand: "",
    model: "",
    category: "Cardio",
  });

  const router = useRouter();

  const [errors, setErrors] = useState<
    Partial<Record<keyof Equipment, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showServerError, setShowServerError] = useState({
    visible: false,
    message: "",
  });
  const [showConnectionError, setShowConnectionError] = useState(false);

  const handleChange = (field: keyof Equipment, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Equipment, string>> = {};

    if (!(formData.name ?? "").trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }
    if (!(formData.description ?? "").trim()) {
      newErrors.description = "La descripción es obligatoria.";
    }
    if (!(formData.brand ?? "").trim()) {
      newErrors.brand = "La marca es obligatoria.";
    }
    if (!(formData.model ?? "").trim()) {
      newErrors.model = "El modelo es obligatorio.";
    }
    if (!(formData.category ?? "").trim()) {
      newErrors.category = "La categoría es obligatoria.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowServerError({ visible: false, message: "" });
    setShowConnectionError(false);

    if (!validate()) {
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token || typeof token !== "string" || token.length < 10) {
      setShowServerError({
        visible: true,
        message: "Token de autenticación no encontrado.",
      });
      return;
    }

    const payload: CreateEquipment = {
      name: formData.name,
      description: formData.description ?? "",
      brand: formData.brand ?? "",
      model: formData.model ?? "",
      category: formData.category,
    };

    setIsLoading(true);
    try {
      await api.equipment.createEquipment(payload, token);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/equipment");
      }, 1500);
    } catch (err: any) {
      console.error("Error al crear equipo:", err);
      if (err?.response?.data?.error) {
        setShowServerError({ visible: true, message: err.response.data.error });
      } else {
        setShowConnectionError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="CREAR EQUIPAMIENTO"></PageHeader>
        <p className="text-sm text-muted-foreground">
          Ingrese la información de un nuevo equipo
        </p>

        <EquipmentForm
          equipment={formData}
          onChange={handleChange}
          errors={errors}
          mode="edit"
        />
        <Button
          type="submit"
          className="w-full"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Crear"}
        </Button>
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="¡Equipamiento creado exitosamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showConnectionError && (
        <Notification
          variant="destructive"
          title="Error de conexión"
          description="No se pudo conectar con el servidor. Intenta más tarde."
          onClose={() => setShowConnectionError(false)}
        />
      )}
      {showServerError.visible && (
        <Notification
          variant="destructive"
          title="Error al crear equipo"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
