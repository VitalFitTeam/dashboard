"use client";
import { PaymentMethod } from "@/models/paymentMethod";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

interface PaymentFormProps {
  formData: PaymentMethod;
  onChange: (field: keyof PaymentMethod, value: string) => void;
  disabled?: boolean;
}

export default function PaymentForm({
  formData,
  onChange,
  disabled = false,
}: PaymentFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Nombre</label>
        <Input
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder=""
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Categoría</label>
        <Select
          value={formData.type}
          onValueChange={(value) => onChange("type", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent></SelectContent>
        </Select>
      </div>

      <div className="flex flex-col col-span-1 md:col-span-2">
        <label className="text-sm font-medium mb-1">Descripción</label>
        <Input
          value={formData.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder=""
          disabled={disabled}
        />
      </div>
    </div>
  );
}
