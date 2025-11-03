"use client";
import { PaymentMethod } from "@/models/paymentMethod";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import PaymentForm from "./PaymentForm";
import { useState } from "react";

interface CreatePaymentProps {
  onBack: () => void;
}

export default function CreatePayment({ onBack }: CreatePaymentProps) {
  const [formData, setFormData] = useState<PaymentMethod>({
    id: "",
    name: "",
    type: "",
    description: "",
  });

  const handleChange = (field: keyof PaymentMethod, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.warn("enviar formulario");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="CREAR METODO DE PAGO">
          <Button variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Cambios
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          Ingrese la información de un metodo de pago
        </p>

        <PaymentForm formData={formData} onChange={handleChange} />
      </form>
    </div>
  );
}
