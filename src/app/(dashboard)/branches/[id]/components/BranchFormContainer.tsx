"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TabSelector } from "@/components/ui/TabSelector";
import BranchBasicDataPanel from "./BranchBasicDataPanel";
import BranchServicePanel from "./BranchServicesPanel";
import BranchInstructorPanel from "./BranchInstructorsPanel";
import BranchEquipmentPanel from "./BranchEquipmentPanel";
import BranchPaymentMethodPanel from "./BranchPaymentMethodsPanel";
import { Button } from "@/components/ui/button";
import { BranchDetails } from "@vitalfit/sdk";

interface BranchFormContainerProps {
  mode?: "view" | "edit";
  branch: BranchDetails;
}

export default function BranchFormContainer({
  mode,
  branch,
}: BranchFormContainerProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BranchDetails>(branch);

  const handleSave = () => {
    console.log("Guardando...", formData);
  };

  const tabs = [
    {
      value: "basic",
      label: "General",
      content: (
        <BranchBasicDataPanel
          mode={mode}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
    {
      value: "payment",
      label: "Métodos de pago",
      content: <BranchPaymentMethodPanel mode={mode} />,
    },
    {
      value: "services",
      label: "Servicios",
      content: <BranchServicePanel mode={mode} />,
    },
    {
      value: "instructors",
      label: "Instructores",
      content: <BranchInstructorPanel mode={mode} />,
    },
    {
      value: "equipment",
      label: "Equipamiento",
      content: <BranchEquipmentPanel mode={mode} />,
    },
  ];

  if (!formData) {
    return <p>No se encontró la sucursal.</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "edit" ? "Modificar Sucursal" : "Detalles de sucursal"}
          </h1>
          <p className="text-gray-500">
            Información completa de {formData.name}
          </p>
        </div>

        <div className="flex gap-2">
          {mode === "view" && (
            <Button
              onClick={() => router.push(`/branches/${branch.branch_id}/edit`)}
            >
              Modificar
            </Button>
          )}
          {mode === "edit" && (
            <>
              <Button variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar</Button>
            </>
          )}
        </div>
      </div>

      <TabSelector tabs={tabs} defaultValue="basic" />
    </div>
  );
}
