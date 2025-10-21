"use client";

import { useState } from "react";
import StepNotification from "./StepNotification";
import PaymentMethodSelector from "@/components/branches/PaymentMethodSelector";
import { PaymentMethodUI } from "./page";

type StepProps = {
  formData: any;
  onChange: (field: string, value: string[]) => void;
  formErrors?: Record<string, string>;
  allPaymentMethods: PaymentMethodUI[];
};

export default function Step4({
  formData,
  onChange,
  formErrors = {},
  allPaymentMethods,
}: StepProps) {
  const [selected, setSelected] = useState<string[]>(formData.paymethods || []);

  const handleSelectionChange = (updatedMethods: string[]) => {
    setSelected(updatedMethods);
    onChange("paymethods", updatedMethods);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Métodos de Pago Aceptados
      </h2>

      <PaymentMethodSelector
        selectedMethods={selected}
        onSelectionChange={handleSelectionChange}
        mode="edit"
        formError={formErrors?.["paymethods"]}
        availableMethods={allPaymentMethods}
      />

      <StepNotification
        title="Importante sobre métodos de pago"
        description="Los métodos de pago seleccionados estarán disponibles..."
      />

      {formErrors?.["paymethods"] && (
        <p className="text-sm text-red-500 mt-2">{formErrors["paymethods"]}</p>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Métodos Seleccionados:
        </h4>
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const method = allPaymentMethods.find((m) => m.id === id);
              if (!method) {
                return null;
              }

              const Icon = method.icon;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium border border-orange-200" // Ajusta estilos si es necesario
                >
                  {Icon && <Icon className="h-4 w-4 text-orange-600" />}
                  {method.name}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No se ha seleccionado ningún método.
          </p>
        )}
      </div>
    </div>
  );
}
