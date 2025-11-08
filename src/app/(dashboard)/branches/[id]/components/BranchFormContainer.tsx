"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TabSelector } from "@/components/ui/TabSelector";
import { Button } from "@/components/ui/button";
import BranchBasicDataPanel from "./BranchBasicDataPanel";
import BranchServicePanel, { BranchPanelRef } from "./BranchServicesPanel";
import BranchInstructorPanel from "./BranchInstructorsPanel";
import BranchEquipmentPanel from "./BranchEquipmentPanel";
import BranchPaymentMethodPanel from "./BranchPaymentMethodsPanel";
import {
  BranchDetails,
  ServiceFullDetail,
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

// unicamente datos generales
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
  mode = "edit",
  branch,
}: BranchFormContainerProps) {
  const router = useRouter();
  const { token } = useAuth();

  const [formData, setFormData] = useState<BranchDetails>({
    ...branch,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [allServicesFromApi, setAllServicesFromApi] = useState<
    ServiceFullDetail[]
  >([]);

  const serviceSaveRef = useRef<BranchPanelRef | null>(null);
  const paymentSaveRef = useRef<BranchPanelRef | null>(null);
  const instructorsSaveRef = useRef<BranchPanelRef | null>(null);
  const equipmentSaveRef = useRef<BranchPanelRef | null>(null);

  const [dirtySections, setDirtySections] = useState({
    basic: false,
    services: false,
    payment: false,
    instructors: false,
    equipment: false,
  });

  const handleSaveAll = async () => {
    if (!token) {
      return alert("Error: Sesión no válida.");
    }
    setIsSaving(true);

    try {
      //Guardar datos básicos
      if (dirtySections.basic) {
        const transformedData = transformDataForAPI(formData);
        await api.branch.updateBranch(branch.branch_id, transformedData, token);
      }

      // Guardar servicios
      if (dirtySections.services && serviceSaveRef.current) {
        await serviceSaveRef.current.saveData();
      }

      // Guardar métodos de pago
      if (dirtySections.payment && paymentSaveRef.current) {
        await paymentSaveRef.current.saveData();
      }

      //  Guardar instructores
      if (dirtySections.instructors && instructorsSaveRef.current) {
        await instructorsSaveRef.current.saveData();
      }

      //  Guardar equipamiento
      if (dirtySections.equipment && equipmentSaveRef.current) {
        await equipmentSaveRef.current.saveData();
      }

      alert("✅ Cambios guardados correctamente");
      setDirtySections({
        basic: false,
        services: false,
        payment: false,
        instructors: false,
        equipment: false,
      });
      router.refresh();
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      alert("Error: No se pudo guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    {
      value: "basic",
      label: `General ${dirtySections.basic ? "•" : ""}`,
      content: (
        <BranchBasicDataPanel
          mode={mode}
          formData={formData}
          setFormData={setFormData}
          onDirtyChange={(isDirty) =>
            setDirtySections((prev) => ({ ...prev, basic: isDirty }))
          }
        />
      ),
    },
    {
      value: "payment",
      label: `Métodos de pago ${dirtySections.payment ? "•" : ""}`,
      content: (
        <BranchPaymentMethodPanel
          mode={mode}
          ref={paymentSaveRef}
          onDirtyChange={(isDirty) =>
            setDirtySections((prev) => ({ ...prev, payment: isDirty }))
          }
        />
      ),
    },
    {
      value: "services",
      label: `Servicios ${dirtySections.services ? "•" : ""}`,
      content: (
        <BranchServicePanel
          formData={formData}
          setFormData={setFormData}
          allServices={allServicesFromApi}
          mode={mode}
          ref={serviceSaveRef}
          onDirtyChange={(isDirty) =>
            setDirtySections((prev) => ({ ...prev, services: isDirty }))
          }
        />
      ),
    },
    {
      value: "instructors",
      label: `Instructores ${dirtySections.instructors ? "•" : ""}`,
      content: (
        <BranchInstructorPanel
          mode={mode}
          ref={instructorsSaveRef}
          branchId={branch.branch_id}
          onDirtyChange={(isDirty) =>
            setDirtySections((prev) => ({ ...prev, instructors: isDirty }))
          }
        />
      ),
    },
    {
      value: "equipment",
      label: `Equipamiento ${dirtySections.equipment ? "•" : ""}`,
      content: (
        <BranchEquipmentPanel
          mode={mode}
          ref={equipmentSaveRef}
          branchId={branch.branch_id}
          onDirtyChange={(isDirty) =>
            setDirtySections((prev) => ({ ...prev, equipment: isDirty }))
          }
        />
      ),
    },
  ];

  /* 🔹 Renderizado principal */
  return (
    <div className="p-6">
      {/* Header con acciones */}
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
              <Button onClick={handleSaveAll} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar todo"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs de contenido */}
      <TabSelector tabs={tabs} defaultValue="basic" />
    </div>
  );
}
