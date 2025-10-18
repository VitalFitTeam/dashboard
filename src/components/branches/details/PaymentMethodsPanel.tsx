import React from "react";
import { Branches } from "@/types/branches";

interface PaymentMethodProps {
  formData: Branches;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PaymentMethodPanel({
  formData,
  handleChange,
}: PaymentMethodProps) {
  return (
    <div className="pt-4 text-sm text-gray-600">
      Mostrando métodos de pago para {formData.name}
    </div>
  );
}
