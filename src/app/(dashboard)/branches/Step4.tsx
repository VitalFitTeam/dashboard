"use client";

type StepProps = {
  formData: any;
  onChange: (field: string, value: string) => void;
};

export default function Step4({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-4">
      <span>PASO 4 EN PROGRESO...</span>
    </div>
  );
}
