import { api } from "@/lib/sdk-config";
import { getServiceSchema, ServiceFormData } from "@/lib/validation/serviceSchema";
import { UpdateServiceImageManual, UpdateServiceManual } from "@vitalfit/sdk";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export function useEditServiceForm(serviceId: string, token: string | null, onSuccess: () => void) {
  const t = useTranslations("common.Validations");
  const schema = useMemo(() => getServiceSchema(t), [t]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    duration: "", 
    priority: "", 
    is_featured: "false", 
    banner_id: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillForm = useCallback((service: any) => {

    setFormData({
      name: service.name || "",
      description: service.description || "",
      category_id: service.category_id,
      duration: service.duration_minutes?.toString() || "",
      priority: service.priority_score?.toString() || "",
      is_featured: service.is_featured ? "true" : "false",
      banner_id: service.banners?.[0]?.banner_id || "",
    });
  }, []);


  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const submitUpdate = async (images: UpdateServiceImageManual[]) => {
    if (!token) {
      return;
    }
    setIsSubmitting(true);

    try {
      const { duration, priority, is_featured, banner_id, ...rest } = formData;
      const payload: UpdateServiceManual = {
        ...rest,
        banner_id: banner_id || undefined,
        duration: parseInt(duration) || 0,
        priority: parseInt(priority) || 0,
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

  const validate = () => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const errors: any = {};
      result.error.issues.forEach((i) => (errors[i.path[0]] = i.message));
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  return { 
    formData, 
    handleChange, 
    formErrors, 
    isSubmitting, 
    validate, 
    submitUpdate, 
    fillForm 
  };
}