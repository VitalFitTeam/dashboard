"use client";

type StepProps = {
  formData: any;
  onChange: (field: string, value: string) => void;
};

export default function Step5({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-4">
      <span>PASO 5 EN PROGRESO...</span>
    </div>
  );
}
