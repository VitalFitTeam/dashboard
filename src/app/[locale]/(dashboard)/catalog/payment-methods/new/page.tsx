"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreatePaymentMethod, BranchPaymentVisibility } from "@vitalfit/sdk";
import PaymentForm from "../PaymentForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  PaymentMethodFormData,
  getPaymentMethodSchema,
} from "@/lib/validation/paymentMethodSchema";

export default function NewPaymentMethodPage() {
  const t = useTranslations("catalog.payment_methods");
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
    const result = getPaymentMethodSchema(t).safeParse(formData);

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
    const fieldSchema = getPaymentMethodSchema(t).pick({ [field]: true } as any);
    const result = fieldSchema.safeParse({ [field]: formData[field] });

    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || t("notifications.error_title");
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
      toast.error(t("notifications.validation_error_title"), {
        description: t("notifications.validation_error_description"),
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

      toast.success(t("notifications.success_title"), {
        description: t("notifications.create_success"),
      });

      setTimeout(() => {
        router.replace("/catalog/payment-methods");
      }, 1500);
    } catch (error) {
      console.error("Error creating payment method:", error);
      toast.error(t("notifications.error_title"), {
        description: t("notifications.create_error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title={t("new.title")}>
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? t("new.creating") : t("new.create_button")}
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          {t("new.subtitle")}
        </p>
        <PaymentForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </form>
    </div>
  );
}
