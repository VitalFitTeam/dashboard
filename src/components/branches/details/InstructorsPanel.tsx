import React from "react";
import { Branches } from "@/types/branches";

interface InstructorPanelProps {
  formData: Branches;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InstructorsPanel({
  formData,
  handleChange,
}: InstructorPanelProps) {
  return (
    <div className="pt-4 text-sm text-gray-600">
      Mostrando métodos de pago para {formData.name}
    </div>
  );
}
