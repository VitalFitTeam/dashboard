"use client";
import type { PaymentMethod } from "@/models/paymentMethod";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import PaymentForm from "./PaymentForm";
import { useState } from "react";

interface ViewDetailsPaymentProps {
  payment: PaymentMethod;
  onBack: () => void;
}

export default function ViewDetailsPayment({
  payment,
  onBack,
}: ViewDetailsPaymentProps) {
  const [formData, setFormData] = useState<PaymentMethod>({
    id: payment.id,
    name: payment.name,
    type: payment.type,
    description: payment.description,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.warn("enviar formulario");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="DETALLES">
          <Button variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Modificar
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          información del equipamiento
        </p>

        <PaymentForm formData={formData} onChange={() => {}} disabled />
      </form>
    </div>
  );
}
