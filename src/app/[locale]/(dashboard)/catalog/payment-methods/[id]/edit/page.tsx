"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  PaymentMethod,
  CreatePaymentMethod,
  BranchPaymentVisibility,
} from "@vitalfit/sdk";
import PaymentForm from "../../PaymentForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  PaymentMethodFormData,
  getPaymentMethodSchema,
} from "@/lib/validation/paymentMethodSchema";

export default function EditPaymentMethodPage() {
  const t = useTranslations("catalog.payment_methods");
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

  if (!token) {
    return null;
  }

  useEffect(() => {
    if (id && token) {
      loadPaymentMethod();
    }
  }, [id, token]);

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
      toast.error(t("notifications.error_title"), {
        description: t("edit.load_error"),
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
      toast.error(t("notifications.validation_error_title"), {
        description: t("notifications.validation_error_description"),
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

      toast.success(t("notifications.success_title"), {
        description: t("edit.success_title") || t("notifications.update_success"),
      });

      setTimeout(() => {
        router.replace("/catalog/payment-methods");
      }, 1500);
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error(t("notifications.error_title"), {
        description: t("edit.save_error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        {t("view.loading")}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title={t("edit.title")}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.replace("/catalog/payment-methods")}
          >
            {t("edit.cancel_button")}
          </Button>
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? t("edit.saving") : t("edit.save_button")}
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          {t("edit.subtitle")}
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
