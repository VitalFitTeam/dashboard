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

  const toggleMethod = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter((m) => m !== id)
      : [...selected, id];
    setSelected(updated);
    onChange("metodosPago", updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentMethods.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleMethod(id)}
            className={cn(
              "border rounded-lg p-4 text-left transition hover:shadow-md flex flex-col items-start gap-2",
              selected.includes(id)
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 bg-white",
            )}
          >
            <Icon className="h-6 w-6 text-orange-600" />
            <h3 className="text-md font-semibold text-gray-800">{label}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </button>
        ))}
      </div>

      {formErrors?.["metodosPago"] && (
        <p className="text-sm text-red-500 mt-2">{formErrors["metodosPago"]}</p>
      )}

      <StepNotification
        title="Importante sobre métodos de pago"
        description="Los métodos seleccionados estarán disponibles para todos los servicios y membresías en esta sucursal."
      />

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Métodos Seleccionados:
        </h4>
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const method = paymentMethods.find((m) => m.id === id);
              if (!method) {return null;}
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
