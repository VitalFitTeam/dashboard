"use client";

import { EquipmentCategory } from "@/models/equipment";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { EquipmentInfo } from "@vitalfit/sdk";

type EquipmentWithBrand = EquipmentInfo & { brand?: string };

interface EquipmentFormProps {
  equipment: EquipmentWithBrand;
  onChange?: (field: keyof EquipmentWithBrand, value: string) => void;
  mode?: "view" | "edit";
}

export default function EquipmentForm({
  equipment,
  onChange = () => {},
  mode = "view",
}: EquipmentFormProps) {
  const disabled = mode === "view";

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
          value={equipment.name ?? ""}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Agrega un nombre"
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Categoría</label>
        <Select
          value={equipment.category ?? ""}
          onValueChange={(value) => onChange("category", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione una categoría" />
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
        <Textarea
          value={equipment.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Agrega una descripción"
          disabled={disabled}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Modelo</label>
        <Input
          value={equipment.model ?? ""}
          onChange={(e) => onChange("model", e.target.value)}
          placeholder="Agrega un modelo"
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Marca</label>
        <Input
          value={equipment.brand ?? ""}
          onChange={(e) => onChange("brand", e.target.value)}
          placeholder="Agrega una marca"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
