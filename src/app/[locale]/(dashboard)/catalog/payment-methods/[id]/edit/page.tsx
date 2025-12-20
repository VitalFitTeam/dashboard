"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  PaymentMethod,
  CreatePaymentMethod,
  PaymentConfiguration,
  BranchPaymentVisibility,
} from "@vitalfit/sdk";
import PaymentForm from "../../PaymentForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import {
  PaymentMethodFormData,
  paymentMethodSchema,
} from "@/lib/validation/paymentMethodSchema";

export default function EditPaymentMethodPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [formData, setFormData] = useState<
    PaymentMethodFormData & { global_status?: boolean }
  >({
    name: "",
    type: "",
    processing_type: "",
    description: "",
    global_status: true,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PaymentMethodFormData, string>>
  >({});

  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
  });

  if (!token) {
    return null;
  }

  useEffect(() => {
    if (id && token) {
      loadPaymentMethod();
    }
  }, [id, token]);

  const validateForm = (): boolean => {
    const result = paymentMethodSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof PaymentMethodFormData, string>> =
        {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as keyof PaymentMethodFormData] =
            issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validateField = (field: keyof PaymentMethodFormData): boolean => {
    const fieldSchema = paymentMethodSchema.pick({ [field]: true });
    const result = fieldSchema.safeParse({ [field]: formData[field] });

    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || "Error de validación";
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));
      return false;
    }

    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return true;
  };

  const loadPaymentMethod = async () => {
    try {
      setIsLoading(true);
      const response = await api.paymentMethod.getPaymentMethodByID(id, token);
      const paymentMethodData = response.data;
      setPaymentMethod(paymentMethodData);

      setFormData({
        name: paymentMethodData.name,
        type: paymentMethodData.type,
        processing_type: paymentMethodData.processing_type,
        description: paymentMethodData.description || "",
        global_status: paymentMethodData.global_status,
      });
    } catch (error) {
      console.error("Error loading payment method:", error);
      setNotification({
        isVisible: true,
        description: "Error al cargar el método de pago",
        title: "Error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof PaymentMethodFormData]) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof PaymentMethodFormData]: undefined,
      }));
    }
  };

  const handleBlur = (field: string) => {
    validateField(field as keyof PaymentMethodFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        isVisible: true,
        description: "Por favor corrige los errores en el formulario",
        title: "Error de validación",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: CreatePaymentMethod = {
        method_id: paymentMethod?.method_id || "",
        name: formData.name,
        type: formData.type as "Cash" | "Card" | "Transfer" | "Other",
        processing_type: formData.processing_type as "Gateway" | "Offline",
        description: formData.description || "",
        display_name: formData.name,
        surcharge_fixed: 0,
        surcharge_percentage: 0,
        configuration: {},
        visibility: "All" as BranchPaymentVisibility,
      };

      await api.paymentMethod.updatePaymentMethod(id, updateData, token);

      setNotification({
        isVisible: true,
        description: "Método de pago actualizado exitosamente",
        title: "Éxito",
      });

      setTimeout(() => {
        router.push("/payment-methods");
      }, 1500);
    } catch (error) {
      console.error("Error updating payment method:", error);
      setNotification({
        isVisible: true,
        description: "Error al actualizar el método de pago",
        title: "Error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="EDITAR MÉTODO DE PAGO">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/payment-methods")}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          Modifique la información del método de pago
        </p>
        <PaymentForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </form>

      {notification.isVisible && (
        <Notification
          title={notification.title}
          description={notification.description}
          onClose={hideNotification}
          autoCloseDuration={3000}
          variant={notification.title === "Error" ? "destructive" : "success"}
        />
      )}
    </div>
  );
}
