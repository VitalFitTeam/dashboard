"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StepNotification from "./StepNotification";
type StepProps = {
  formData: any;
  onChange: (field: string, value: string) => void;
};

export default function Step1({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Razón Social *
            </span>
            <input
              type="text"
              value={formData.razonSocial || ""}
              onChange={(e) => onChange("razonSocial", e.target.value)}
              placeholder="Ej: mca2Plaza"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">RIF *</span>
            <input
              type="text"
              value={formData.rif || ""}
              onChange={(e) => onChange("rif", e.target.value)}
              placeholder="J-XXXXXXXXX-X"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Ciudad *</span>
            <Select
              value={formData.ciudad || ""}
              onValueChange={(value) => onChange("ciudad", value)}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Seleccione Ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caracas">Caracas</SelectItem>
                <SelectItem value="valencia">Valencia</SelectItem>
                <SelectItem value="maracaibo">Maracaibo</SelectItem>
                <SelectItem value="barquisimeto">Barquisimeto</SelectItem>
                <SelectItem value="maracay">Maracay</SelectItem>
                <SelectItem value="barcelona">Barcelona</SelectItem>
                <SelectItem value="maturin">Maturín</SelectItem>
                <SelectItem value="puerto-la-cruz">Puerto La Cruz</SelectItem>
                <SelectItem value="ciudad-bolivar">Ciudad Bolívar</SelectItem>
                <SelectItem value="merida">Mérida</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <div className="mt-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Teléfono
              </span>
              <input
                type="tel"
                value={formData.telefono || ""}
                onChange={(e) => onChange("telefono", e.target.value)}
                placeholder="+58424-5978752"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </label>
          </div>
        </div>
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Estado de Sucursal *
            </span>
            <Select
              value={formData.estadoSucursal || "activa"}
              onValueChange={(value) => onChange("estadoSucursal", value)}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Activa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="inactiva">Inactiva</SelectItem>
                <SelectItem value="suspendida">Suspendida</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </div>
      <StepNotification
        title="Próximos pasos"
        description="En los siguientes pasos configuraremos la ubicación, contacto, horarios y empleados de la nueva sucursal."
      />
    </div>
  );
}
