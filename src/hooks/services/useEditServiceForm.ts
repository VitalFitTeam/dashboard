import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { getServiceSchema, ServiceFormData } from "@/lib/validation/serviceSchema";
import { api } from "@/lib/sdk-config";
import { UpdateServiceManual, UpdateServiceImageManual, ServiceFullDetail } from "@vitalfit/sdk";
import { toast } from "sonner";

export function useEditServiceForm(
  serviceId: string, 
  token: string | null, 
  onSuccess: () => void
) {
  const t = useTranslations("common.Validations");
  const schema = useMemo(() => getServiceSchema(t), [t]);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "", description: "", category_id: "", 
    duration_minutes: "", priority_score: "5", 
    is_featured: "false", banner_id: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillForm = useCallback((service: ServiceFullDetail) => {
    setFormData({
      name: service.name,
      description: service.description,
      category_id: service.category_id,
      duration_minutes: service.duration_minutes.toString(),
      priority_score: service.priority_score.toString(),
      is_featured: service.is_featured ? "true" : "false",
      banner_id: service.banners?.[0]?.banner_id || "",
    });
  }, []);

  const validate = () => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const errors: any = {};
      result.error.issues.forEach(i => (errors[i.path[0]] = i.message));
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const submitUpdate = async (images: UpdateServiceImageManual[]) => {
    if (!token) {
        return;
    }
    setIsSubmitting(true);
    
    try {
      const { duration_minutes, priority_score, is_featured, banner_id, ...rest } = formData;
      
      const payload: UpdateServiceManual = {
        ...rest,
        banner_id: banner_id as string,
        duration: parseInt(duration_minutes),
        priority: parseInt(priority_score),
        is_featured: is_featured === "true",
        service_images: images,
      };

      await api.products.updateService(serviceId, payload, token);
      toast.success("Servicio actualizado");
      onSuccess();
    } catch (error: any) {
      toast.error("Error al actualizar", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, setFormData, handleChange: (f: any, v: any) => setFormData(p => ({...p, [f]: v})), formErrors, isSubmitting, validate, submitUpdate, fillForm };
}