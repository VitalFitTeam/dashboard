"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputField from "@/components/ui/InputField";
import StepNotification from "../../StepNotification";

type StepProps = {
  formData: any; // Considera usar un tipo más específico
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleCustomChange: (field: string, value: string) => void;
  formErrors?: Record<string, string>;
};

export default function Step1({
  formData,
  handleChange,
  handleCustomChange,
  formErrors = {},
}: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
        Información Básica de la Sucursal
      </h3>
      <p className="text-sm text-gray-600 -mt-4">
        Comience ingresando los datos fundamentales de la nueva sucursal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="name"
          name="name"
          label="Razón Social *"
          type="text"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="Ej: FitnesPlaza"
          error={formErrors["name"]}
        />

        <InputField
          id="taxId"
          name="taxId"
          label="RIF *"
          type="text"
          value={formData.taxId || ""}
          onChange={handleChange}
          placeholder="J-402456696-3"
          error={formErrors["taxId"]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="phone"
          name="phone"
          label="Teléfono"
          type="tel"
          value={formData.phone || ""}
          onChange={handleChange}
          placeholder="Placeholder"
          error={formErrors["phone"]}
        />

        <div>
          <label htmlFor="status">Estado de Sucursal *</label>
          <Select
            value={formData.status || "active"}
            onValueChange={(value) => handleCustomChange("status", value)}
          >
            <SelectTrigger id="status" className="mt-1 w-full">
              <SelectValue placeholder="Activa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="inactive">Inactiva</SelectItem>
              <SelectItem value="maintenance">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
          {formErrors["status"] && (
            <p className="text-sm text-red-500 mt-1">{formErrors["status"]}</p>
          )}
        </div>
      </div>
      <StepNotification
        title="Próximos pasos"
        description="En los siguientes pasos configuraremos la ubicación, contacto, horarios y empleados de la nueva sucursal."
      />
    </div>
  );
}
