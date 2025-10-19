import React from "react";
import { Branches } from "@/types/branches";
import PanelWrapper from "./PanelWrapper";
import PaymentMethodSelector from "../PaymentMethodSelector";

type ArrayChange = {
  target: {
    name: string;
    value: string[];
  };
};

interface PaymentMethodProps {
  formData: Branches;
  handleChange: (e: React.ChangeEvent<HTMLInputElement> | ArrayChange) => void;
  mode: "edit" | "view";
}

export default function PaymentMethodPanel({
  formData,
  handleChange,
  mode,
}: PaymentMethodProps) {
  const handlePaymentMethodsChange = (updatedMethods: string[]) => {
    handleChange({
      target: {
        name: "paymethods",
        value: updatedMethods,
      },
    });
  };

  const isEditable = mode === "edit";
  const currentMethods = (formData.paymethods || []) as string[];

  return (
    <PanelWrapper
      title="Métodos de Pago Aceptados"
      description={
        isEditable
          ? "Selecciona los métodos de pago que estarán disponibles en esta sucursal."
          : "Métodos de pago de la sucursal:"
      }
    >
      <PaymentMethodSelector
        selectedMethods={currentMethods}
        onSelectionChange={isEditable ? handlePaymentMethodsChange : undefined}
        mode={mode}
      />
    </PanelWrapper>
  );
}
