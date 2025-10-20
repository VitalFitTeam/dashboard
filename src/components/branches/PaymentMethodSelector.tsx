"use client";

import { PaymentMethodUI } from "@/app/(dashboard)/branches/page";
import { cn } from "@/lib/utils";

type PaymentMethodSelectorProps = {
  selectedMethods: string[];
  onSelectionChange?: (updatedMethods: string[]) => void;
  mode: "edit" | "view";
  formError?: string;
  availableMethods: PaymentMethodUI[];
};

export default function PaymentMethodSelector({
  selectedMethods,
  onSelectionChange,
  mode,
  formError,
  availableMethods, // <-- RECIBE LA PROP
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableMethods.map(
          ({ id, name, description, icon: IconComponent }) => {
            const isSelected = selectedMethods.includes(id);

            if (mode === "view" && !isSelected) {
              return null;
            }

            return (
              <button
                key={id}
                type="button"
                onClick={isEditable ? () => toggleMethod(id) : undefined}
                disabled={!isEditable}
                className={cn(
                  "border rounded-lg p-4 text-left transition flex flex-col items-start gap-2 h-full",
                  isSelected
                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                    : "border-gray-300 bg-white",
                  isEditable
                    ? "hover:shadow-md cursor-pointer"
                    : "cursor-default",
                )}
              >
                {IconComponent && (
                  <IconComponent className="h-6 w-6 text-gray-700" />
                )}
                <h3 className="text-md font-semibold text-gray-800">{name}</h3>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </button>
            );
          },
        )}
      </div>
      {formError && <p className="text-sm text-red-500 mt-2">{formError}</p>}

      {selectedMethods.length > 0 && (
        <div className="pt-6 mt-6 border-t">
          <h4 className="text-sm font-medium text-gray-800 mb-3">
            Métodos Seleccionados
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableMethods
              .filter((method) => selectedMethods.includes(method.id))
              .map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700"
                >
                  {method.icon && <method.icon className="h-4 w-4" />}
                  <span>{method.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
