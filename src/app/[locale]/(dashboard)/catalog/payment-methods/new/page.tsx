"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { CreatePaymentMethod, BranchPaymentVisibility, PaymentMethod } from "@vitalfit/sdk";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import PaymentForm from "../PaymentForm";

export default function NewPaymentMethodPage() {
  const t = useTranslations("catalog.payment_methods");
  const router = useRouter();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreatePaymentMethod>({
    method_id: "", 
    name: "",
    display_name: "",
    type: "Cash",
    processing_type: "Offline",
    description: "",
    surcharge_fixed: 0,
    surcharge_percentage: 0,
    configuration: {},
    visibility: "All" as BranchPaymentVisibility,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token){
       return;
    }

    try {
      setIsSubmitting(true);

      let finalConfig = {};
      const c = formData.configuration as any;

      if (formData.type === "Transfer") {
        finalConfig = {
          bank_name: c.bank_name || "",
          account_number: c.account_number || "",
          tax_id: c.tax_id || "",
        };
      } else if (formData.type === "Other") {
        if (c.phone) {
          finalConfig = {
            phone: c.phone,
            bank_id: c.bank_id,
            tax_id: c.tax_id,
          };
        } else if (c.email) {
          finalConfig = {
            email: c.email,
          };
        }
      }

      const payload: CreatePaymentMethod = {
        ...formData,
        method_id: crypto.randomUUID(),
        display_name: formData.display_name || formData.name,
        configuration: finalConfig, 
        surcharge_fixed: Number(formData.surcharge_fixed),
        surcharge_percentage: Number(formData.surcharge_percentage),
      };

      await api.paymentMethod.createPaymentMethod(payload, token);

      toast.success(t("notifications.create_success"));
      router.push("/catalog/payment-methods");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating payment method:", error);
      toast.error(error.response?.data?.error || t("notifications.create_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <form onSubmit={handleSubmit}>
        <PageHeader title={t("new.title")}>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              {t("form.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("new.creating") : t("new.create_button")}
            </Button>
          </div>
        </PageHeader>

        <div className="mt-4 bg-white rounded-xl border p-6 shadow-sm">
          <PaymentForm
            formData={formData}
            onChange={handleChange}
            mode="create"
          />
        </div>
      </form>
    </div>
  );
}