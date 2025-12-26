"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";

export function useGetPaymentMethod(paymentMethodId: string | undefined, token: string | null) {
  const [method, setMethod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMethod = useCallback(async () => {    if (!paymentMethodId || !token) {
      setMethod(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Llamada usando el nombre exacto de tu SDK
      const response = await api.paymentMethod.getPaymentMethodByID(paymentMethodId, token);
      
      if (response?.data) {
        setMethod(response.data);
      }
    } catch (err: any) {
      console.error("Error en useGetPaymentMethod:", err);
      setError(err.message || "Error al cargar el método de pago");
    } finally {
      setLoading(false);
    }
  }, [paymentMethodId, token]);

  useEffect(() => {
    fetchMethod();
  }, [fetchMethod]);

  return { 
    method, 
    loading, 
    error,
    refresh: fetchMethod 
  };
}