"use client";

import React from "react";
import { Branches } from "@/models/branches";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { PaymentMethodUI } from "@/app/(dashboard)/branches/page";
import PaymentMethodSelector from "@/components/features/branches/PaymentMethodSelector";

interface PaymentMethodProps {
  formData: Branches;
  handlePaymentMethodChange: (selectedIds: string[]) => void;
  mode: "edit" | "view";
  allPaymentMethods: PaymentMethodUI[];
}

export default function BranchPaymentMethodPanel({
  formData = { paymethods: [] } as unknown as Branches,
  handlePaymentMethodChange = () => {},
  mode = "edit",
  allPaymentMethods = [],
}: PaymentMethodProps) {
  const handlePaymentMethodsChange = (updatedMethods: string[]) => {
    handlePaymentMethodChange(updatedMethods);
  };
  const currentMethods = formData.paymethods ?? [];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Métodos de pago aceptados
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Selecciona los métodos de pago que estarán disponibles en esta
          sucursal.
        </p>
      </section>

      <section>
        <PaymentMethodSelector
          selectedMethods={currentMethods}
          onSelectionChange={handlePaymentMethodsChange}
          mode={mode}
          availableMethods={allPaymentMethods}
        />
      </section>
      <Alert variant="default" className="mt-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Importante:</span> los métodos
          seleccionados estarán disponibles para todos los servicios y
          membresías de esta sucursal. Puedes modificarlos posteriormente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
