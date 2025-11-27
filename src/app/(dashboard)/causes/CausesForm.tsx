"use client";

import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";

interface Cause {
  causes_id?: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

interface CausesFormProps {
  cause: Cause;
  onChange?: (field: keyof Cause, value: string) => void;
  mode?: "view" | "edit" | "create";
  errors?: Partial<Record<keyof Cause, string>>;
}

export default function CausesForm({
  cause,
  errors = {},
  onChange = () => { },
  mode = "view",
}: CausesFormProps) {
  const disabled = mode === "view";

  const handleChange = (field: keyof Cause, value: string) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6 p-6">

      <div className="grid grid-cols-2">

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Nombre de la causal</label>
          <Input
            value={cause.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ingrese el nombre de la causal"
            disabled={disabled}
            className="max-w-md"
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Estado</label>
          <Select
            value={cause.status}
            onValueChange={(value: "active" | "inactive") => handleChange("status", value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
        </div>

      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2">Descripción</label>
        <Textarea
          value={cause.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Ingrese la descripción de la causal"
          disabled={disabled}
          className="min-h-[120px] max-w-2xl"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description}</p>
        )}
      </div>
    </div>
  );
}