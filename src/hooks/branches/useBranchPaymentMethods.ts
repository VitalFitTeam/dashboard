"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";

// Definimos la interfaz exacta según tu respuesta del backend
interface BranchPaymentMethod {
  branch_id: string;
  is_active: boolean;
  method_id: string; // Esta es la propiedad clave
  name: string;
  type: string;
}

export function useBranchPaymentMethods(branchId: string | undefined, token: string | null) {
  const [methods, setMethods] = useState<BranchPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    if (!branchId || !token) {
      setMethods([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.paymentMethod.getBranchPaymentMethods(branchId, token);
      
      // Filtramos solo los métodos activos para mejorar la UX
      if (response && response.data) {
        const activeMethods = Array.isArray(response.data) 
          ? response.data.filter((m: BranchPaymentMethod) => m.is_active)
          : [];
        setMethods(activeMethods);
      } else {
        setMethods([]);
      }
    } catch (err: any) {
      console.error("Error en useBranchPaymentMethods:", err);
      if (err.status === 403 || err.message?.includes("forbidden")) {
        setError("forbidden");
      } else {
        setError("error");
        toast.error("Error al cargar los métodos de pago de la sede");
      }
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, token]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  return { methods, loading, error, refresh: fetchMethods };
}