"use client";

import { useAuth } from "@/context/AuthContext";
import ViewEquipment from "./ViewEquipment";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { EquipmentInfo, DataResponse } from "@vitalfit/sdk";

export default function ViewEquipmentPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<EquipmentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      router.replace("/equipment");
      return;
    }
    if (!token) {
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const equipmentData: DataResponse<EquipmentInfo> =
          await api.equipment.getEquipmentByID(id, token);

        if (!mounted) {
          return;
        }
        setEquipment(equipmentData.data);
      } catch (err: any) {
        if (!mounted) {
          return;
        }

        const status = err?.response?.status ?? err?.status ?? null;
        if (status === 404) {
          router.replace("/equipment");
        } else {
          console.error("Error cargando equipamiento:", err);
          setError("No se pudo cargar la información del equipamiento.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, token, router]);

  if (loading) {
    return <div className="p-6">Cargando equipamiento...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!equipment) {
    return null;
  }
  return <ViewEquipment equipment={equipment} />;
}
