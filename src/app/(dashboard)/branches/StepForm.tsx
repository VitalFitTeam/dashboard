"use client";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import { PaymentMethodUI } from "./page"; // Importa el tipo

// --- 1. ACTUALIZA LAS PROPS ---
type StepProps = {
  step: number;
  formData: any; // (Considera usar un tipo más específico para formData)
  handleChange: (
    // <-- Cambia a handleChange
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handleCustomChange: (field: string, value: unknown) => void; // <-- Añade handleCustomChange
  formErrors?: Record<string, string>;
  allPaymentMethods?: PaymentMethodUI[]; // <-- Añade allPaymentMethods (opcional)
};

export default function StepForm({
  step,
  formData,
  handleChange, // <-- Recibe handleChange
  handleCustomChange, // <-- Recibe handleCustomChange
  formErrors,
  allPaymentMethods = [], // <-- Recibe allPaymentMethods
}: StepProps) {
  switch (step) {
    case 1:
      return (
        <Step1
          formData={formData}
          handleChange={handleChange} // <-- Pasa handleChange
          handleCustomChange={handleCustomChange} // <-- Pasa handleCustomChange
          formErrors={formErrors}
        />
      );
    case 2:
      return (
        <Step2
          formData={formData}
          handleChange={handleChange} // <-- Pasa handleChange
          handleCustomChange={handleCustomChange} // <-- Pasa handleCustomChange
          formErrors={formErrors}
        />
      );
    case 3:
      return (
        <Step3
          formData={formData}
          handleChange={handleChange} // <-- Pasa handleChange
          handleCustomChange={handleCustomChange} // <-- Pasa handleCustomChange
          formErrors={formErrors}
        />
      );
    case 4:
      return (
        <Step4
          formData={formData}
          handleCustomChange={handleCustomChange}
          formErrors={formErrors}
          allPaymentMethods={allPaymentMethods}
        />
      );
    case 5:
      return <Step5 formData={formData} formErrors={formErrors} />;
    default:
      return null;
  }
}
