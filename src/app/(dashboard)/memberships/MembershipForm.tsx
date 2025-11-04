"use client";
import { Membership } from "@/models/membership";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

interface MembershipFormProps {
  formData: Membership;
  onChange: (field: keyof Membership, value: string) => void;
  edit: boolean;
  disabled?: boolean;
}

export default function MembershipForm({
  formData,
  onChange,
  edit = false,
  disabled = false,
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
              placeholder="Nombre"
              disabled={disabled}
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="bg-white w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1 mb-3">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Descripcion*
          </label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            disabled={disabled}
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            className="bg-white w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        <div className="flex-1">
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Duración (Días)
          </label>
          <Input
            id="duration"
            name="duration"
            disabled={disabled}
            value={formData.duration}
            onChange={(e) => onChange("duration", e.target.value)}
            className="bg-white w-full"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Precio ($)
          </label>
          <Input
            id="price"
            name="price"
            disabled={disabled}
            value={formData.price}
            onChange={(e) => onChange("price", e.target.value)}
            className="bg-white w-full"
          />
        </div>
      </div>

      {edit && (
        <div className="flex-1">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Status
          </label>
          <Select
            name="status"
            onValueChange={(value) => onChange("status", value)}
            value={formData.status || "active"}
          >
            <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue>
                {formData.status === "Active"
                  ? "Activa"
                  : formData.status === "Inactive"
                    ? "Inactiva"
                    : "Status"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="inactive">Inactiva</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
