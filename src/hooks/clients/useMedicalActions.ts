// hooks/medical/useMedicalActions.ts
import { useState } from "react";
import { api } from "@/lib/sdk-config";
import { MedicalProfile } from "@vitalfit/sdk";
import { toast } from "sonner";

export const useMedicalActions = (userId: string, token: string | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveMedicalProfile = async (formData: MedicalProfile, exists: boolean) => {
    if (!userId || !token) return false;
    setIsSubmitting(true);
    try {
      if (!exists) {
        await api.user.createMedicalProfile(userId, formData, token);
        toast.success("Ficha médica creada");
      } else {
        await api.user.updateMedicalProfile(userId, formData, token);
        toast.success("Ficha médica actualizada");
      }
      return true;
    } catch (error) {
      toast.error("Error al guardar información");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { saveMedicalProfile, isSubmitting };
}