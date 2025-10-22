"use client";

import InputField from "@/components/InputField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Branches } from "@/types/branches";
import { City, State } from "@/types/location";
import { BranchAdmin } from "@/types/users";

interface GeneralPanelProps {
  formData: Branches;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  mode: "view" | "edit";
  allCities: City[];
  allStates: State[];
  allBranchAdmins: BranchAdmin[];
}

const statusOptions = [
  { label: "Activa", value: "active" },
  { label: "Inactiva", value: "inactive" },
  { label: "En mantenimiento", value: "maintenance" },
];

export default function GeneralPanel({
  formData,
  handleChange,
  handleSelectChange,
  mode,
  allCities,
  allStates,
  allBranchAdmins
}: GeneralPanelProps) {
  const isDisabled = mode === "view";


  const admin = allBranchAdmins.find(
    (a) => a.id === formData.administrator,
  );

  const adminName = admin
    ? `${admin.firstName} ${admin.lastName}`
    : formData.administrator || "No asignado";
    
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">
        Información Básica
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Datos legales y básicos de la sucursal
      </p>

      <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <InputField
          id="name"
          name="name"
          label="Razón social"
          value={formData.name}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder="GymPro Sucursal Centro"
        />

        <InputField
          id="taxId"
          name="taxId"
          label="RIF"
          value={formData.taxId}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder="J-12345678-9"
        />

        <InputField
          id="administrator"
          name="administrator"
          label="Gerente Responsable"
          value={adminName || ""}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder="Placeholder"
        />

        <InputField
          id="phone"
          name="phone"
          label="Teléfono"
          value={formData.phone || ""}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder="Placeholder"
        />

        <InputField
          id="maxCapacity"
          name="maxCapacity"
          label="Capacidad máxima"
          type="number"
          value={formData.capacity ?? ""}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder="Placeholder"
        />
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Estado de la sucursal
          </label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
            disabled={isDisabled}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select an item" />
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
    </div>
  );
}
