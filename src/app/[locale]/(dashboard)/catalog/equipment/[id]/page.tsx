"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import EquipmentForm from "../EquipmentForm";
import { EquipmentInfo } from "@vitalfit/sdk";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const id = params?.id as string | undefined;
  const [equipment, setEquipment] = useState<EquipmentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) {
      return;
    }

    const fetchEquipment = async () => {
      try {
        const data = await api.equipment.getEquipmentByID(id, token);
        setEquipment(data.data);
      } catch (err) {
        console.error("Error al cargar equipo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, token]);

  if (loading) {
    return <div className="p-6">Cargando detalles...</div>;
  }

  if (!equipment) {
    return <div className="p-6 text-red-500">Equipo no encontrado.</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <PageHeader
        title="DETALLES DE EQUIPAMIENTO"
        subtitle={
          <p className="text-sm text-muted-foreground">
            Información del equipamiento:{" "}
            <span className="font-medium">{equipment.name}</span>
          </p>
        }
        actionButton={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/equipment")}
            >
              Volver
            </Button>
            <Button
              variant="default"
              type="button"
              onClick={() => router.push(`/equipment/edit/${id}`)}
            >
              Modificar
            </Button>
          </div>
        }
      />

      <EquipmentForm equipment={equipment} mode="view" />
    </div>
  );
}
