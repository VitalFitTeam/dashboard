import React from "react";
import InputField from "@/components/InputField";
import { Branches } from "@/types/branches";

interface GeneralPanelProps {
  formData: Branches;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode: "view" | "edit";
}

export default function GeneralPanel({
  formData,
  handleChange,
  mode,
}: GeneralPanelProps) {
  const isDisabled = mode === "view";

  return (
    <div>
      <div>
        <h2 className="font-semibold text-gray-800">Información General</h2>
        <p className="pt-4 text-sm text-gray-600">
          {isDisabled
            ? `Visualizando la información general de la sucursal ${formData.name}.`
            : `Edita la información general para la sucursal ${formData.name}.`}
        </p>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
        <InputField
          id="name"
          name="name"
          label="Razón social"
          value={formData.name}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <InputField
          id="taxId"
          name="taxId"
          label="RIF"
          value={formData.taxId}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <div className="col-span-2">
          <InputField
            id="address"
            name="address"
            label="Dirección"
            value={formData.address || ""}
            onChange={handleChange}
            disabled={isDisabled}
          />
        </div>
        <InputField
          id="latitude"
          name="latitude"
          label="Latitud GPS"
          type="number"
          value={formData.latitude ?? ""}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <InputField
          id="longitude"
          name="longitude"
          label="Longitud GPS"
          type="number"
          value={formData.longitude ?? ""}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <InputField
          id="city"
          name="city"
          label="Ciudad"
          value={formData.city || ""}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <InputField
          id="administrator"
          name="administrator"
          label="Gerente Responsable"
          value={formData.administrator || ""}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <InputField
          id="phone"
          name="phone"
          label="Teléfono"
          value={formData.phone || ""}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <InputField
          id="maxCapacity"
          name="maxCapacity"
          label="Capacidad máxima"
          type="number"
          value={formData.maxCapacity ?? ""}
          onChange={handleChange}
          disabled={isDisabled}
        />
      </form>
    </div>
  );
}
