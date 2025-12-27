"use client";

import { useState } from "react";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";

export function useUpdatePaymentStatus() {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (paymentId: string, status: string, token: string) => {
    setLoading(true);
    try {
      await api.billing.updatePaymentStatus(paymentId, status, token);
      
      toast.success(`Pago marcado como ${status}`);
      return { success: true };
    } catch (error: any) {
      console.error("Error al actualizar estado del pago:", error);
      toast.error(error.message || "No se pudo actualizar el estado del pago");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStatus,
    loading
  };
}