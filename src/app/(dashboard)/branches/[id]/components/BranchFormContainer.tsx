"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TabSelector } from "@/components/ui/TabSelector";
import BranchBasicDataPanel from "./BranchBasicDataPanel";
import BranchServicePanel from "./BranchServicesPanel";
import BranchInstructorPanel from "./BranchInstructorsPanel";
import BranchEquipmentPanel from "./BranchEquipmentPanel";
import BranchPaymentMethodPanel from "./BranchPaymentMethodsPanel";
import { Button } from "@/components/ui/button";
import {
  BranchDetails,
  UpdateBranchRequest,
  UpdateOperatingHour,
} from "@vitalfit/sdk";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";

interface BranchFormContainerProps {
  mode?: "view" | "edit";
  branch: BranchDetails;
}

const toHHMMSS = (input?: string | null) => {
  if (!input) {
    return "00:00:00";
  }
  const s = input.trim();

  if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) {
    return s;
  }
  const hm = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (hm) {
    return `${hm[1].padStart(2, "0")}:${hm[2]}:00`;
  }
  const ampm = /^(\d{1,2}):(\d{2})(?:\s*)(AM|PM)$/i.exec(s);
  if (ampm) {
    let hh = Number(ampm[1]);
    const mm = ampm[2];
    const period = ampm[3].toUpperCase();
    if (period === "PM" && hh < 12) {
      hh += 12;
    }
    if (period === "AM" && hh === 12) {
      hh = 0;
    }
    return `${hh.toString().padStart(2, "0")}:${mm}:00`;
  }
  return "00:00:00";
};

function transformDataForAPI(data: BranchDetails): UpdateBranchRequest {
  const opHours: UpdateOperatingHour[] = data.operating_hours.map((h) => ({
    day_of_week: h.day_of_week,
    open_time: h.is_closed ? "00:00:00" : toHHMMSS(h.open_time),
    close_time: h.is_closed ? "00:00:00" : toHHMMSS(h.close_time),
    is_closed: h.is_closed,
  }));

  return {
    name: data.name,
    tax_id: data.tax_id,
    address: data.address,
    phone: data.phone,
    status: data.status,
    state: data.state,
    country: data.country,
    latitude: data.latitude,
    longitude: data.longitude,
    max_capacity: data.max_capacity,
    manager_id: data.manager,
    operating_hours: opHours,
    payment_methods: [],
  };
}

export default function BranchFormContainer({
  mode,
  branch,
}: BranchFormContainerProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BranchDetails>(branch);
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();

  const serviceSaveRef = useRef<BranchPanelRef | null>(null);
  const paymentSaveRef = useRef<BranchPanelRef | null>(null);
  const instructorsSaveRef = useRef<BranchPanelRef | null>(null);
  const equipmentSaveRef = useRef<BranchPanelRef | null>(null);

  const handleSave = async () => {
    if (!token) {
      alert("Error: Sesión no válida.");
      return;
    }

    setIsSaving(true);
    try {
      // **A. GUARDAR DATOS BÁSICOS (Lógica centralizada)**
      console.log("1. Guardando datos básicos de la sucursal...");
      const transformedData = transformDataForAPI(formData);
      await api.branch.updateBranch(branch.branch_id, transformedData, token);

      if (serviceSaveRef.current) {
        console.log("2. Llamando al guardado de Servicios...");
        await serviceSaveRef.current.saveData();
      }

      if (paymentSaveRef.current) {
        console.log("3. Llamando al guardado de Métodos de Pago...");
        await paymentSaveRef.current.saveData();
      }

      if (instructorsSaveRef.current) {
        console.log("4. Llamando al guardado de Instructores...");
        await instructorsSaveRef.current.saveData();
      }
      if (equipmentSaveRef.current) {
        console.log("4. Llamando al guardado de Instructores...");
        await instructorsSaveRef.current.saveData();
      }

      alert("Sucursal guardada con éxito");
      router.push(`/branches/${branch.branch_id}`);
      router.refresh();
    } catch (err) {
      console.error("Error al guardar la sucursal (un paso falló):", err);
      alert("Error: No se pudo guardar la sucursal.");
    } finally {
      setIsSaving(false);
    }
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
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}{" "}
                {/* 6. Texto de carga */}
              </Button>
            </>
          )}
        </div>
      </div>

      <TabSelector tabs={tabs} defaultValue="basic" />
    </div>
  );
}
