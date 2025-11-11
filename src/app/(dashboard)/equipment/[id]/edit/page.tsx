"use client";

import { useState, useEffect } from "react";
import type { Equipment } from "@/models/equipment";
import type { UpdateEquipment } from "@vitalfit/sdk";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import EquipmentForm from "../../EquipmentForm";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { useAuth } from "@/context/AuthContext";
import { EquipmentInfo } from "@vitalfit/sdk";
import { useRouter, useParams } from "next/navigation";
import {
  equipmentSchema,
  type EquipmentSchema,
} from "@/lib/validation/equipmentSchema";

export default function EditEquipment() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<EquipmentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const [formData, setFormData] = useState<EquipmentSchema>({
    equipment_id: "",
    name: "",
    description: "",
    brand: "",
    model: "",
    category: "Cardio",
  });

  useEffect(() => {
    if (!id) {
      router.replace("/equipment");
      return;
    }
    if (!token) {return;}

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const equipmentData = await api.equipment.getEquipmentByID(id, token);
        if (!mounted) {return;}

        setEquipment(equipmentData.data);
      } catch (err: any) {
        if (!mounted) {return;}
        const status = err?.response?.status ?? err?.status ?? null;
        if (status === 404) {
          router.replace("/equipment");
        } else {
          console.error("Error cargando equipo:", err);
          setError("No se pudo cargar la información del equipo.");
        }
      } finally {
        if (mounted) {setLoading(false);}
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, token, router]);

  useEffect(() => {
    if (equipment) {
      setFormData({
        equipment_id: equipment.equipment_id,
        name: equipment.name ?? "",
        description: equipment.description ?? "",
        brand: equipment.brand ?? "",
        model: equipment.model ?? "",
        category: equipment.category ?? "Cardio",
      });
    }
  }, [equipment]);

  const handleChange = (field: keyof Equipment, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const result = equipmentSchema.safeParse(formData);
    if (!result.success) {
      const zodErrors = result.error.flatten().fieldErrors;
      const formattedErrors: Partial<Record<keyof Equipment, string>> = {};

      for (const key in zodErrors) {
        const field = key as keyof Equipment;
        formattedErrors[field] = zodErrors[field]?.[0] ?? "";
      }

      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowServerError({ visible: false, message: "" });
    setShowConnectionError(false);

    if (!validate()) {return;}

    const token = localStorage.getItem("access_token");
    if (!token || typeof token !== "string" || token.length < 10) {
      setShowServerError({
        visible: true,
        message: "Token de autenticación no encontrado.",
      });
      return;
    }

    const payload: UpdateEquipment = {
      name: formData.name,
      description: formData.description ?? "",
      brand: formData.brand ?? "",
      model: formData.model ?? "",
      category: formData.category,
    };

    setIsLoading(true);
    try {
      await api.equipment.updateEquipment(
        formData.equipment_id,
        payload,
        token,
      );
      setShowSuccess(true);
      setTimeout(() => router.push("/equipment"), 1500);
    } catch (err: any) {
      console.error("Error al actualizar equipo:", err);
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
        <PageHeader title="MODIFICAR EQUIPO">
          <Button variant="secondary" onClick={() => router.push("/equipment")}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          Modifica la información del equipo
        </p>

        {!loading && (
          <EquipmentForm
            formData={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="¡Equipamiento actualizado exitosamente!"
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
          title="Error al actualizar equipo"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
