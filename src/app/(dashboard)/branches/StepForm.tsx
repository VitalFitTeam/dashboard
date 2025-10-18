"use client";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

type StepProps = {
  formData: any;
  onChange: (field: string, value: any) => void;
  formErrors?: Record<string, string>;
};

export default function StepForm({
  step,
  formData,
  onChange,
  formErrors,
}: StepProps) {
  switch (step) {
    case 1:
      return (
        <Step1
          formData={formData}
          onChange={onChange}
          formErrors={formErrors}
        />
      );
    case 2:
      return (
        <Step2
          formData={formData}
          onChange={onChange}
          formErrors={formErrors}
        />
      );
    case 3:
      return (
        <Step3
          formData={formData}
          onChange={onChange}
          formErrors={formErrors}
        />
      );
    case 4:
      return (
        <Step4
          formData={formData}
          onChange={onChange}
          formErrors={formErrors}
        />
      );
    case 5:
      return <Step5 formData={formData} formErrors={formErrors} />;
    default:
      return null;
  }
}
