"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { MembershipType } from "@vitalfit/sdk";

// Tipo extendido que permite strings en campos numéricos
type MembershipFormData = Omit<MembershipType, "duration_days" | "price"> & {
  duration_days: number | string;
  price: number | string;
};

interface MembershipFormProps {
  formData: MembershipFormData;
  onChange: (field: keyof MembershipType, value: string) => void;
  edit: boolean;
  disabled?: boolean;
  errors?: Partial<Record<keyof MembershipType, string>>;
}

export default function MembershipForm({
  formData,
  onChange,
  edit = false,
  disabled = false,
  errors = {},
}: MembershipFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
            >
              Nombre*
            </label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Membresía Premium"
              disabled={disabled}
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="bg-white w-full"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1 mb-3">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Descripción*
          </label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Ej: Acceso ilimitado a todas las instalaciones"
            disabled={disabled}
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            className="bg-white w-full"
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        <div className="flex-1">
          <label
            htmlFor="duration_days"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Duración (Días)*
          </label>
          <Input
            id="duration_days"
            name="duration_days"
            type="number"
            min="0"
            max="3650"
            placeholder="Ej: 30"
            disabled={disabled}
            value={formData.duration_days}
            onChange={(e) => onChange("duration_days", e.target.value)}
            className="bg-white w-full"
          />
          {errors.duration_days && (
            <p className="text-sm text-red-600 mt-1">{errors.duration_days}</p>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Precio ($)*
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            max="999999.99"
            placeholder="Ej: 99.99"
            disabled={disabled}
            value={formData.price}
            onChange={(e) => onChange("price", e.target.value)}
            className="bg-white w-full"
          />
          {errors.price && (
            <p className="text-sm text-red-600 mt-1">{errors.price}</p>
          )}
        </div>
      </div>

      {edit && (
        <div className="flex-1">
          <label
            htmlFor="is_active"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Status
          </label>
          <Select
            name="is_active"
            onValueChange={(value) => onChange("is_active", value)}
            value={formData.is_active ? "active" : "inactive"}
          >
            <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue>
                {formData.is_active ? "Activa" : "Inactiva"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="inactive">Inactiva</SelectItem>
            </SelectContent>
          </Select>
          {errors.is_active && (
            <p className="text-sm text-red-600 mt-1">{errors.is_active}</p>
          )}
        </div>
      )}
    </>
  );
}
