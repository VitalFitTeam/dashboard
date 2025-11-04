"use client";
import { EquipmentCategory, Equipment } from "@/models/equipment";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface EquipmentFormProps {
  formData: Equipment;
  onChange: (field: keyof Equipment, value: string) => void;
  disabled?: boolean;
}

export default function EquipmentForm({
  formData,
  onChange,
  disabled = false,
}: EquipmentFormProps) {
  const categories: EquipmentCategory[] = [
    "Cardio",
    "Strength",
    "FreeWeight",
    "Functional",
    "Accessory",
  ];

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
          value={formData.category}
          onValueChange={(value) => onChange("category", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
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

      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Modelo</label>
        <Input
          value={formData.model ?? ""}
          onChange={(e) => onChange("model", e.target.value)}
          placeholder=""
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Marca</label>
        <Input
          value={formData.brand ?? ""}
          onChange={(e) => onChange("brand", e.target.value)}
          placeholder=""
          disabled={disabled}
        />
      </div>
    </div>
  );
}
