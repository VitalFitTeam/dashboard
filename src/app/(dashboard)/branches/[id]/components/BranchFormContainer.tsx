"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TabSelector } from "@/components/ui/TabSelector";
import { Button } from "@/components/ui/button";

import BranchBasicDataPanel from "./BranchBasicDataPanel";
import BranchServicePanel from "./BranchServicesPanel";
import BranchInstructorPanel from "./BranchInstructorsPanel";
import BranchEquipmentPanel from "./BranchEquipmentPanel";
import BranchPaymentMethodPanel from "./BranchPaymentMethodsPanel";

import { BranchDetails, ServiceFullDetail } from "@vitalfit/sdk";

interface BranchFormContainerProps {
  mode?: "view" | "edit";
  branch: BranchDetails;
}

export default function BranchFormContainer({
  mode = "edit",
  branch,
}: BranchFormContainerProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BranchDetails>({ ...branch });
  const [allServicesFromApi, setAllServicesFromApi] = useState<
    ServiceFullDetail[]
  >([]);

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
      content: (
        <BranchPaymentMethodPanel mode={mode} branchId={branch.branch_id} />
      ),
    },
    {
      value: "services",
      label: "Servicios",
      content: <BranchServicePanel branchId={branch.branch_id} mode={mode} />,
    },
    {
      value: "instructors",
      label: "Instructores",
      content: (
        <BranchInstructorPanel mode={mode} branchId={branch.branch_id} />
      ),
    },
    {
      value: "equipment",
      label: "Equipamiento",
      content: <BranchEquipmentPanel mode={mode} branchId={branch.branch_id} />,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "edit" ? "Modificar Sucursal" : "Detalles de sucursal"}
          </h1>
          <p className="text-gray-500">Información de {formData.name}</p>
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
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <TabSelector tabs={tabs} defaultValue="basic" />
    </div>
  );
}
