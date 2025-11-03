"use client";

import BranchSchedule from "@/components/features/branches/details/BranchSchedule";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InputField from "@/components/ui/InputField";
import MapboxPicker from "@/components/ui/MapboxPicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { MapPin } from "lucide-react";
import { BranchDetails } from "@vitalfit/sdk";

interface BasicDataPanelProps {
  mode?: "view" | "edit";
  formData: BranchDetails;
  setFormData: React.Dispatch<React.SetStateAction<BranchDetails>>;
}
const statusOptions: { label: string; value: BranchDetails["status"] }[] = [
  { label: "Activa", value: "Active" },
  { label: "Inactiva", value: "Inactive" },
  { label: "En mantenimiento", value: "Maintenance" },
];

interface MapSelectData {
  latitud: string;
  longitud: string;
  address: string;
  state: string;
  country: string;
}

export default function BranchBasicDataPanel({
  mode,
  formData,
  setFormData,
}: BasicDataPanelProps) {
  const handleMapSelect = (data: MapSelectData) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(data.latitud) || 0,
      longitude: Number(data.longitud) || 0,
      address: data.address ?? prev.address,
      state: data.state ?? prev.state,
      country: data.country ?? prev.country,
    }));
  };

  const handleScheduleChange = (updatedSchedule: any) => {
    setFormData((prev) => ({
      ...prev,
      operating_hours: updatedSchedule,
    }));
  };

  const isViewMode = mode === "view";

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Información básica
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Datos legales y generales de la sucursal
        </p>

        <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <InputField
            id="name"
            name="name"
            label="Razón social"
            placeholder="GymPro Sucursal Centro"
            value={formData.name ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            readOnly={isViewMode}
          />

          <InputField
            id="taxId"
            name="taxId"
            label="RIF"
            placeholder="J-12345678-9"
            value={formData.tax_id ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tax_id: e.target.value }))
            }
            readOnly={isViewMode}
          />

          <InputField
            id="administrator"
            name="administrator"
            label="Gerente Responsable"
            placeholder="Ej. María Pérez"
            value={
              `${formData.manager_first_name ?? ""} ${formData.manager_last_name ?? ""}`.trim() ||
              "No asignado"
            }
            readOnly
            disabled
            className="bg-gray-100"
          />

          <InputField
            id="phone"
            name="phone"
            label="Teléfono"
            placeholder="Num. de contacto"
            value={formData.phone ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            readOnly={isViewMode}
          />

          <InputField
            id="maxCapacity"
            name="maxCapacity"
            label="Capacidad máxima"
            type="number"
            placeholder="50"
            value={formData.max_capacity ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                max_capacity: Number(e.target.value),
              }))
            }
            readOnly={isViewMode}
          />
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Estado de la sucursal
            </label>
            <Select
              value={formData.status ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as "Active" | "Inactive" | "Maintenance",
                }))
              }
              disabled={isViewMode}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <Alert variant="default" className="mt-6">
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Estos datos deben corresponder con la documentación legal de la
            sucursal.
          </AlertDescription>
        </Alert>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Ubicación</h2>
        <p className="text-sm text-gray-600 mb-4">
          Visualizando la ubicación de la sucursal
        </p>

        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6">
            <InputField
              label="Dirección Completa*"
              id="address"
              name="address"
              placeholder="Av. Principal, Edificio Centro..."
              value={formData.address ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              readOnly={isViewMode}
            />
          </div>
          <div className="col-span-6 md:col-span-3">
            <InputField
              label="Estado"
              id="state"
              name="state"
              value={formData.state ?? ""}
              placeholder="Se rellena con el mapa"
              readOnly={isViewMode || !formData.state}
              className={isViewMode ? "bg-gray-100" : ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, state: e.target.value }))
              }
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            <InputField
              label="País"
              id="country"
              name="country"
              value={formData.country ?? ""}
              placeholder="Se rellena con el mapa"
              readOnly={isViewMode || !formData.country}
              className={isViewMode ? "bg-gray-100" : ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
            />
          </div>

          <div className="col-span-6 flex items-center gap-2 mt-4">
            <MapPin className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              Coordenadas GPS
            </span>
          </div>

          <div className="col-span-6 md:col-span-3">
            <InputField
              label="Latitud"
              id="latitude"
              name="latitude"
              readOnly
              className="bg-gray-100 border-gray-300"
              value={formData.latitude ?? ""}
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            <InputField
              label="Longitud"
              id="longitude"
              name="longitude"
              readOnly
              className="bg-gray-100 border-gray-300"
              value={formData.longitude ?? ""}
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-1 block">
            Posición en el mapa
          </h3>
          <MapboxPicker
            lat={formData.latitude ? String(formData.latitude) : "0"}
            lng={formData.longitude ? String(formData.longitude) : "0"}
            onSelect={handleMapSelect}
            //readOnly={isViewMode}
          />
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Horarios de operación
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Horarios de apertura y cierre de la sucursal
        </p>
        <BranchSchedule
          schedule={formData.operating_hours || []}
          onScheduleChange={handleScheduleChange}
          mode="edit"
        />
      </section>
    </div>
  );
}
