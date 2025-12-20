"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import EquipmentForm from "../../EquipmentForm";
import { EquipmentInfo } from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";

export default function EditEquipmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [equipment, setEquipment] = useState<EquipmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) {
      return;
    }

    const loadEquipment = async () => {
      try {
        setLoading(true);
        const response = await api.equipment.getEquipmentByID(id, token);
        // Verifica si la API devuelve data.data o data directamente
        setEquipment(response.data ?? response);
      } catch (err) {
        console.error("Error cargando equipo:", err);
        setError("No se pudo cargar el equipo.");
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment || !token) {
      return;
    }

    try {
      await api.equipment.updateEquipment(
        equipment.equipment_id,
        equipment,
        token,
      );
      router.push("/equipment");
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      setError("No se pudo guardar la información del equipo.");
    }
  };

  if (loading) {
    return <div className="p-6">Cargando equipo...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  if (!equipment) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PageHeader
          title="Editar Equipamiento"
          subtitle={`Modifica los datos del equipo: ${equipment.name}`}
          actionButton={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.push("/equipment")}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                Guardar cambios
              </Button>
            </div>
          }
        />

        <EquipmentForm
          mode="edit"
          equipment={equipment}
          onChange={(field, value) =>
            setEquipment((prev) => (prev ? { ...prev, [field]: value } : prev))
          }
        />
      </form>
    </div>
  );
}
