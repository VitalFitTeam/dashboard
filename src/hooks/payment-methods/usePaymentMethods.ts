"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";

export function usePaymentMethods(token: string | null) {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMethods = useCallback(async () => {
    if (!token) {
        return;
    }

    try {
      setLoading(true);
      const response = await api.paymentMethod.getPaymentMethods(token);
      
      if (response?.data) {
        setMethods(response.data);
      }
    } catch (err: any) {
      console.error("Error al cargar métodos de pago:", err);

    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  return { 
    methods, 
    loading, 
    refresh: fetchMethods 
  };
}