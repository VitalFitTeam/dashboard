"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TabSelector } from "@/components/ui/TabSelector";
import BranchBasicDataPanel from "./BranchBasicDataPanel";
import BranchServicePanel, { BranchPanelRef } from "./BranchServicesPanel";
import BranchInstructorPanel from "./BranchInstructorsPanel";
import BranchEquipmentPanel from "./BranchEquipmentPanel";
import BranchPaymentMethodPanel from "./BranchPaymentMethodsPanel";
import { Button } from "@/components/ui/button";
import {
  BranchDetails,
  BranchServicePrice,
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
  const [formData, setFormData] = useState<
    BranchDetails & { services: BranchServicePrice[] }
  >({
    ...branch,
    services: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [allServicesFromApi, setAllServicesFromApi] = useState<
    ServiceFullDetail[]
  >([]);
  const { token } = useAuth();

  const serviceSaveRef = useRef<BranchPanelRef | null>(null);
  const paymentSaveRef = useRef<BranchPanelRef | null>(null);
  const instructorsSaveRef = useRef<BranchPanelRef | null>(null);
  const equipmentSaveRef = useRef<BranchPanelRef | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      if (!token) {
        return;
      }
      try {
        const response = await api.products.getServices(token);
        setAllServicesFromApi(response.data || []);
      } catch (err) {
        console.error("❌ Error cargando servicios:", err);
      }
    };
    fetchServices();
  }, [token]);

  const handleSaveAll = async () => {
    if (!token) {
      alert("Error: Sesión no válida.");
      return;
    }

    setIsSaving(true);

    try {
      // 1️⃣ Guardar datos básicos de la sucursal
      console.log("1. Guardando datos básicos...");
      const transformedData = transformDataForAPI(formData);
      await api.branch.updateBranch(branch.branch_id, transformedData, token);

      // 2️⃣ Guardar servicios
      if (serviceSaveRef.current) {
        console.log("2. Guardando servicios...");
        await serviceSaveRef.current.saveData();
      }

      // 3️⃣ Guardar métodos de pago
      if (paymentSaveRef.current) {
        console.log("3. Guardando métodos de pago...");
        await paymentSaveRef.current.saveData();
      }

      // 4️⃣ Guardar instructores
      if (instructorsSaveRef.current) {
        console.log("4. Guardando instructores...");
        await instructorsSaveRef.current.saveData();
      }

      // 5️⃣ Guardar equipamiento
      if (equipmentSaveRef.current) {
        console.log("5. Guardando equipamiento...");
        await equipmentSaveRef.current.saveData();
      }

      alert("✅ Sucursal guardada con éxito");
      router.push(`/branches/${branch.branch_id}`);
      router.refresh();
    } catch (err) {
      console.error("❌ Error al guardar la sucursal:", err);
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
      content: <BranchPaymentMethodPanel mode={mode} ref={paymentSaveRef} />,
    },
    {
      value: "services",
      label: "Servicios",
      content: (
        <BranchServicePanel
          formData={formData}
          setFormData={setFormData}
          allServices={allServicesFromApi}
          mode={mode}
          ref={serviceSaveRef}
        />
      ),
    },
    {
      value: "instructors",
      label: "Instructores",
      content: (
        <BranchInstructorPanel
          mode={mode}
          ref={instructorsSaveRef}
          branchId={branch.branch_id}
        />
      ),
    },
    {
      value: "equipment",
      label: "Equipamiento",
      content: (
        <BranchEquipmentPanel
          mode={mode}
          ref={equipmentSaveRef}
          branchId={branch.branch_id}
        />
      ),
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
              <Button onClick={handleSaveAll} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </>
          )}
        </div>
      </div>

      <TabSelector tabs={tabs} defaultValue="basic" />
    </div>
  );
}
