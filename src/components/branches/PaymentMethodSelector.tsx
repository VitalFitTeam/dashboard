"use client";

import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types/paymentMethod";
import {
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

export const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "efectivo",
    label: "Efectivo",
    description: "Pago en efectivo en Sucursal",
    dbName: "Efectivo",
    icon: BanknotesIcon,
  },
  {
    id: "tarjeta",
    label: "Tarjeta de Crédito/Débito",
    description: "Visa, MasterCard",
    dbName: "Tarjeta Credito/Debito",
    icon: CreditCardIcon,
  },
  {
    id: "transferencia",
    label: "Transferencia Bancaria",
    description: "Transferencia directa a cuenta bancaria",
    dbName: "Transferencia Bancaria",
    icon: BuildingLibraryIcon,
  },
  {
    id: "pago-movil",
    label: "Pago Móvil",
    description: "Pago móvil Intercambiario",
    dbName: "Pago Movil",
    icon: DevicePhoneMobileIcon,
  },
];

type PaymentMethodSelectorProps = {
  selectedMethods: string[];
  onSelectionChange?: (updatedMethods: string[]) => void;
  mode: "edit" | "view";
  formError?: string;
};

export default function PaymentMethodSelector({
  selectedMethods,
  onSelectionChange,
  mode,
  formError,
}: PaymentMethodSelectorProps) {
  const isEditable = mode === "edit";

  const toggleMethod = (id: string) => {
    if (!isEditable || !onSelectionChange) {
      return;
    }

    const updated = selectedMethods.includes(id)
      ? selectedMethods.filter((m) => m !== id)
      : [...selectedMethods, id];

    onSelectionChange(updated);
  };

  return (
    <div className="space-y-4">
      {isEditable && (
        <p className="text-sm text-gray-700">
          Selecciona los métodos de pago que estarán disponibles en esta
          sucursal
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ALL_PAYMENT_METHODS.map(({ id, label, description, icon: Icon }) => {
          const isSelected = selectedMethods.includes(id);

          if (mode === "view" && !isSelected) {
            return null;
          }
          return (
            <button
              key={id}
              type="button"
              onClick={isEditable ? () => toggleMethod(id) : undefined}
              className={cn(
                "border rounded-lg p-4 text-left transition flex flex-col items-start gap-2",
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300 bg-white",
                isEditable
                  ? "hover:shadow-md cursor-pointer"
                  : "cursor-default",
              )}
            >
              <Icon className="h-6 w-6 text-orange-600" />
              <h3 className="text-md font-semibold text-gray-800">{label}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </button>
          );
        })}
      </div>
      {formError && <p className="text-sm text-red-500 mt-2">{formError}</p>}
    </div>
  );
}
