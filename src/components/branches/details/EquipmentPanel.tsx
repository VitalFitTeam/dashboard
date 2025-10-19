import React from "react";
import { Branches } from "@/types/branches";
import PanelWrapper from "./PanelWrapper";

interface EquipmentPanelProps {
  formData: Branches;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EquipmentPanel({
  formData,
  handleChange,
}: EquipmentPanelProps) {
  return (
    <div>
      <PanelWrapper
        title="Métodos de Pago Aceptados"
        description={`Mostrando métodos de pago para ${formData.name}`}
      >
        <h1>sucursal</h1>
      </PanelWrapper>
    </div>
  );
}
