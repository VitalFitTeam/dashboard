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

type PaymentFormData = PaymentMethod | CreatePaymentMethod;

export default function EditPaymentMethodPage() {
  const t = useTranslations("catalog.payment_methods");
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    method_id: "",
    name: "",
    display_name: "",
    type: "Cash",
    processing_type: "Offline",
    description: "",
    surcharge_fixed: 0,
    surcharge_percentage: 0,
    visibility: "All",
    configuration: {},
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PaymentMethodFormData, string>>>({});

  useEffect(() => {
    if (id && token) {
      loadPaymentMethod();
    }
  }, [id, token]);

 const loadPaymentMethod = async () => {
    try {
      setIsLoading(true);
      const response = await api.paymentMethod.getPaymentMethodByID(id, token!);
      const data = response.data;

      const normalizedData = {
        ...data,
        display_name: (data as any).display_name || data.name,
        configuration: data.configuration || {},
      } as PaymentFormData;

      setFormData(normalizedData);
    } catch (error) {
      console.error("Error loading payment method:", error);
      toast.error(t("notifications.error_title"));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const result = getPaymentMethodSchema(t).safeParse(formData);
    if (!result.success) {
      const newErrors: any = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0]] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof PaymentMethodFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("notifications.validation_error_title"));
      return;
    }

    try {
      setIsSubmitting(true);

      const config = formData.configuration as any;
      let finalConfig = {};
      
      if (formData.type === "Transfer") {
        finalConfig = {
          bank_name: config?.bank_name || "",
          account_number: config?.account_number || "",
          tax_id: config?.tax_id || "",
        };
      } 
      else if (formData.type === "Other") {
        if (config?.email) {
          finalConfig = { email: config.email };
        } else if (config?.phone) {
          finalConfig = {
            phone: config.phone,
            bank_id: config.bank_id,
            tax_id: config.tax_id,
          };
        }
      }

      const updateData: CreatePaymentMethod = {
        method_id: id,
        name: formData.name,
        display_name: (formData as any).display_name || formData.name,
        type: formData.type as any,
        processing_type: formData.processing_type as any,
        description: formData.description || "",
        visibility: formData.visibility as BranchPaymentVisibility,
        surcharge_fixed: Number(formData.surcharge_fixed),
        surcharge_percentage: Number(formData.surcharge_percentage),
        configuration: finalConfig,
      };


      await api.paymentMethod.updatePaymentMethod(id, updateData, token!);

      toast.success(t("notifications.success_title"));

      setTimeout(() => {
        router.replace("/catalog/payment-methods");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Error updating:", error);
      const errorMessage = error.response?.data?.error || t("notifications.error_title");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">{t("view.loading")}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PageHeader title={t("edit.title")}>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              {t("edit.cancel_button")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("edit.saving") : t("edit.save_button")}
            </Button>
          </div>
        </PageHeader>
        
        <PaymentForm
          mode="edit"
          formData={formData} 
          errors={errors}
          onChange={handleChange}
        />
      </form>
    </div>
  );
}