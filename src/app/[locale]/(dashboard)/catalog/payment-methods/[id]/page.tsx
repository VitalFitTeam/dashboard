"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { PaymentMethod } from "@vitalfit/sdk";
import PaymentForm from "../PaymentForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { useTranslations } from "next-intl";

export default function PaymentMethodDetailPage() {
  const t = useTranslations("catalog.payment_methods");
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const id = params.id as string;

  if (!token) {
    return;
  }

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && token) {
      loadPaymentMethod();
    }
  }, [id, token]);

  const loadPaymentMethod = async () => {
    try {
      setIsLoading(true);
      const response = await api.paymentMethod.getPaymentMethodByID(id, token);
      setPaymentMethod(response.data);
    } catch (error) {
      console.error("Error loading payment method:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-lg">{t("view.loading")}</div>
      </div>
    );
  }

  if (!paymentMethod) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-lg">{t("view.not_found")}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <PageHeader title={t("view.title")}>
        <Button
          variant="default"
          onClick={() => router.push(`/catalog/payment-methods/${id}/edit`)}
        >
          {t("view.edit_button")}
        </Button>
      </PageHeader>

      <p className="text-sm text-muted-foreground">
        {t("view.subtitle")}
      </p>

      <div className="bg-white rounded-lg">
        <PaymentForm
          formData={paymentMethod}
          onChange={() => { }}
          disabled={true}
        />
      </div>
    </div>
  );
}
