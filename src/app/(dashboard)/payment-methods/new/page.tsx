"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreatePaymentMethod, BranchPaymentVisibility } from "@vitalfit/sdk";
import PaymentForm from "../PaymentForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import {
  PaymentMethodFormData,
  paymentMethodSchema,
} from "@/lib/validation/paymentMethodSchema";

export default function NewPaymentMethodPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const generateUUID = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  };

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

      const createData: CreatePaymentMethod = {
        method_id: generateUUID(),
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

      await api.paymentMethod.createPaymentMethod(createData, token);

      setNotification({
        isVisible: true,
        description: "Método de pago creado exitosamente",
        title: "Éxito",
      });

      setTimeout(() => {
        router.push("/payment-methods");
      }, 1500);
    } catch (error) {
      console.error("Error creating payment method:", error);
      setNotification({
        isVisible: true,
        description: "Error al crear el método de pago",
        title: "Error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="CREAR MÉTODO DE PAGO">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Método de Pago"}
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          Complete la información para crear un nuevo método de pago
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
