import React from "react";
import InputField from "@/components/InputField";
import { Branches } from "@/types/branches";

interface GeneralPanelProps {
  formData: Branches;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function GeneralPanel({
  formData,
  handleChange,
}: GeneralPanelProps) {
  return (
    <div>
      <div>
        <h2 className="font-semibold text-gray-800">Información General</h2>
        <p className="pt-4 text-sm text-gray-600">
          Mostrando métodos de pago para {formData.name}
        </p>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
        <InputField
          id="name"
          name="name"
          label="Razón social"
          value={formData.name}
          onChange={handleChange}
        />
        <InputField
          id="taxId"
          name="taxId"
          label="RIF"
          value={formData.taxId}
          onChange={handleChange}
        />
        <div className="col-span-2">
          <InputField
            id="address"
            name="address"
            label="Dirección"
            value={formData.address || ""}
            onChange={handleChange}
          />
        </div>
        <InputField
          id="latitude"
          name="latitude"
          label="Latitud GPS"
          type="number"
          value={formData.latitude ?? ""}
          onChange={handleChange}
        />
        <InputField
          id="longitude"
          name="longitude"
          label="Longitud GPS"
          type="number"
          value={formData.longitude ?? ""}
          onChange={handleChange}
        />
        <InputField
          id="city"
          name="city"
          label="Ciudad"
          value={formData.city || ""}
          onChange={handleChange}
        />
        <InputField
          id="administrator"
          name="administrator"
          label="Gerente Responsable"
          value={formData.administrator || ""}
          onChange={handleChange}
        />
        <InputField
          id="phone"
          name="phone"
          label="Teléfono"
          value={formData.phone || ""}
          onChange={handleChange}
        />
        <InputField
          id="maxCapacity"
          name="maxCapacity"
          label="Capacidad máxima"
          type="number"
          value={formData.maxCapacity ?? ""}
          onChange={handleChange}
        />
      </form>
    </div>
  );
}
