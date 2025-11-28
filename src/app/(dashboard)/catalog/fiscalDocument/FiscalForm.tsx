"use client";

import { Input } from "@/components/ui/Input";
import { FiscalDocument } from "./data";

interface FiscalFormProps {
  document: FiscalDocument;
  onChange?: (field: keyof FiscalDocument, value: string) => void;
  mode?: "view" | "edit" | "create";
  errors?: Partial<Record<keyof FiscalDocument, string>>;
}

export default function FiscalForm({
  document,
  errors = {},
  onChange = () => {},
  mode = "view",
}: FiscalFormProps) {
  const disabled = mode === "view";

  const handleChange = (field: keyof FiscalDocument, value: string) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2">Nombre</label>
        <Input
          value={document.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ingrese el nombre del documento"
          disabled={disabled}
          className="max-w-md"
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2">Prefijo o Serie</label>
        <Input
          value={document.prefix}
          onChange={(e) => handleChange("prefix", e.target.value)}
          placeholder="Ingrese el prefijo o serie"
          disabled={disabled}
          className="max-w-md"
        />
        {errors.prefix && <p className="text-sm text-red-500 mt-1">{errors.prefix}</p>}
      </div>
    </div>
  );
}