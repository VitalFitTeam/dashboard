"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/sdk-config";

export function useGetPaymentMethod(paymentMethodId: string | undefined, token: string | null) {
  const [method, setMethod] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMethod = async () => {
      if (!paymentMethodId || !token) {
        return;
      }
      try {
        setLoading(true);
        const response = await api.billing.getPaymentByID(paymentMethodId, token);
        setMethod(response.data);
      } catch (error) {
        console.error("Error al cargar método de pago:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMethod();
  }, [paymentMethodId, token]);

  return { method, loading };
}