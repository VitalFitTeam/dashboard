"use client";
import StepNotification from "./StepNotification";
import PaymentMethodSelector from "@/components/branches/PaymentMethodSelector";
import { PaymentMethodUI } from "./page";

type StepProps = {
  formData: any;
  handleCustomChange: (field: string, value: unknown) => void;
  formErrors?: Record<string, string>;
  allPaymentMethods: PaymentMethodUI[];
};

export default function Step4({
  formData,
  handleCustomChange,
  formErrors = {},
  allPaymentMethods,
}: StepProps) {
  const selectedMethods = (formData.paymentMethods || []) as string[];

  const handleSelectionChange = (updatedMethodIds: string[]) => {
    handleCustomChange("paymentMethods", updatedMethodIds);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Métodos de Pago Aceptados
      </h2>

      <PaymentMethodSelector
        selectedMethods={selectedMethods}
        onSelectionChange={handleSelectionChange}
        mode="edit"
        formError={formErrors?.["paymentMethods"]}
        availableMethods={allPaymentMethods}
      />

      <StepNotification
        title="Importante sobre métodos de pago"
        description="Los métodos de pago seleccionados estarán disponibles para los clientes al realizar pagos en esta sucursal." // Example description
      />

      {formErrors?.["paymentMethods"] && (
        <p className="text-sm text-red-500 mt-2">
          {formErrors["paymentMethods"]}
        </p>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Métodos Seleccionados:
        </h4>
        {selectedMethods.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedMethods.map((id) => {
              const method = allPaymentMethods.find((m) => m.id === id);
              if (!method) {
                return null;
              }
              const Icon = method.icon;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium border border-orange-200"
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
