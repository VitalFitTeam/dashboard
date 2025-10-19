"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import StepNotification from "./StepNotification";
import StepNotification from "./StepNotification";
import PaymentMethodSelector, {
  ALL_PAYMENT_METHODS,
} from "@/components/branches/PaymentMethodSelector";

type StepProps = {
  formData: any;
  onChange: (field: string, value: string[]) => void;
  formErrors?: Record<string, string>;
};

const paymentMethods = [
  {
    id: "efectivo",
    label: "Efectivo",
    description: "Pago en efectivo en Sucursal",
    icon: BanknotesIcon,
  },
  {
    id: "tarjeta",
    label: "Tarjeta de Crédito/Débito",
    description: "Visa, MasterCard",
    icon: CreditCardIcon,
  },
  {
    id: "transferencia",
    label: "Transferencia Bancaria",
    description: "Transferencia directa a cuenta bancaria",
    icon: BuildingLibraryIcon,
  },
  {
    id: "pago-movil",
    label: "Pago Móvil",
    description: "Pago móvil Intercambiario",
    icon: DevicePhoneMobileIcon,
  },
];

export default function Step4({
  formData,
  onChange,
  formErrors = {},
}: StepProps) {
  const [selected, setSelected] = useState<string[]>(
    formData.metodosPago || [],
  );

  const handleSelectionChange = (updatedMethods: string[]) => {
    setSelected(updatedMethods);
    onChange("metodosPago", updatedMethods);
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
        formError={formErrors?.["metodosPago"]}
      />

      <StepNotification
        title="Importante sobre métodos de pago"
        description="Los métodos de pago seleccionados estarán disponibles para todos los servicios y membresías en esta sucursal. Puede modificarlos posteriormente desde la configuración de la sucursal."
      />

      {formErrors?.["metodosPago"] && (
        <p className="text-sm text-red-500 mt-2">{formErrors["metodosPago"]}</p>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Métodos Seleccionados:
        </h4>
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const method = ALL_PAYMENT_METHODS.find((m) => m.id === id);
              if (!method) {
                return null;
              }
              const Icon = method.icon;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium border border-orange-300"
                >
                  <Icon className="h-8 w-4 text-orange-600" />
                  {method.label}
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
