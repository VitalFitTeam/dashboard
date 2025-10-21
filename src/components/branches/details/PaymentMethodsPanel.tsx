"use client";

import React from "react";
import { Branches } from "@/types/branches";
import PanelWrapper from "./PanelWrapper";
import PaymentMethodSelector from "../PaymentMethodSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { PaymentMethodUI } from "@/app/(dashboard)/branches/page";

type ArrayChange = {
  target: {
    name: string;
    value: string[];
  };
};

interface PaymentMethodProps {
  formData: Branches;
  handlePaymentMethodChange: (selectedIds: string[]) => void;
  mode: "edit" | "view";
  allPaymentMethods: PaymentMethodUI[];
}

export default function PaymentMethodPanel({
  formData,
  handlePaymentMethodChange,
  mode,
  allPaymentMethods,
}: PaymentMethodProps) {
  const handlePaymentMethodsChange = (updatedMethods: string[]) => {
    handlePaymentMethodChange(updatedMethods);
  };

  const isDisabled = mode === "view";
  const currentMethods = formData.paymethods ?? [];

  return (
    <PanelWrapper
      title="Métodos de Pago Aceptados"
      description={
        isDisabled
          ? "Selecciona los métodos de pago que estarán disponibles en esta sucursal."
          : "Métodos de pago actualmente aceptados:"
      }
    >
      <PaymentMethodSelector
        selectedMethods={currentMethods}
        onSelectionChange={isDisabled ? handlePaymentMethodsChange : undefined}
        mode={mode}
        availableMethods={allPaymentMethods}
      />

      <Alert variant="default" className="mt-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Importante sobre métodos de pago: Los métodos seleccionados estarán
          disponibles para todos los servicios y membresías. Puede modificarlos
          posteriormente.
        </AlertDescription>
      </Alert>
    </PanelWrapper>
  );
}
