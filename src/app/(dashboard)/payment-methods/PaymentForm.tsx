"use client";

import { PaymentMethod } from "@vitalfit/sdk";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";

interface PaymentFormProps {
  formData:
    | PaymentMethod
    | {
        name: string;
        type: string;
        processing_type: string;
        description?: string;
        global_status?: boolean;
      };
  errors?: {
    name?: string;
    type?: string;
    processing_type?: string;
    description?: string;
  };
  onChange: (field: string, value: string) => void;
  onBlur?: (field: string) => void;
  disabled?: boolean;
}

export default function PaymentForm({
  formData,
  errors,
  onChange,
  onBlur,
  disabled = false,
}: PaymentFormProps) {
  const getTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      Cash: "Efectivo",
      Card: "Tarjeta",
      Transfer: "Transferencia",
      Other: "Otro",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Nombre</label>
        <Input
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          onBlur={() => onBlur?.("name")}
          placeholder="Nombre del método de pago"
          disabled={disabled}
          required
        />
        {errors?.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="flex flex-col" onBlur={() => onBlur?.("type")}>
        <label className="text-sm font-medium mb-1">Tipo</label>
        <Select
          value={formData.type}
          onValueChange={(value) => onChange("type", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Efectivo</SelectItem>
            <SelectItem value="Card">Tarjeta</SelectItem>
            <SelectItem value="Transfer">Transferencia</SelectItem>
            <SelectItem value="Other">Otro</SelectItem>
          </SelectContent>
        </Select>
        {errors?.type && (
          <p className="text-red-500 text-xs mt-1">{errors.type}</p>
        )}
      </div>

      <div className="flex flex-col" onBlur={() => onBlur?.("global_status")}>
        <label className="text-sm font-medium mb-1">Estado</label>
        <Select
          value={formData.global_status?.toString() || "true"}
          onValueChange={(value) => onChange("global_status", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Activo</SelectItem>
            <SelectItem value="false">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col" onBlur={() => onBlur?.("processing_type")}>
        <label className="text-sm font-medium mb-1">
          Tipo de Procesamiento
        </label>
        <Select
          value={formData.processing_type || "Offline"}
          onValueChange={(value) => onChange("processing_type", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar procesamiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Gateway">Gateway</SelectItem>
            <SelectItem value="Offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        {errors?.processing_type && (
          <p className="text-red-500 text-xs mt-1">{errors.processing_type}</p>
        )}
      </div>

      <div className="flex flex-col col-span-1 md:col-span-2">
        <label className="text-sm font-medium mb-1">Descripción</label>
        <Textarea
          value={formData.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          onBlur={() => onBlur?.("description")}
          placeholder="Descripción del método de pago"
          rows={3}
          disabled={disabled}
        />
        {errors?.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description}</p>
        )}
      </div>
    </div>
  );
}
