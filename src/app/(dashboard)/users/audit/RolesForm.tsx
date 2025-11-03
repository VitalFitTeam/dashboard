"use client";
import { Roles, PERMITS_ROLES } from "@/models/roles";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface RolesFormProps {
  formData: Roles;
  onChange: (field: keyof Roles, value: string) => void;
  disabled?: boolean;
}

export default function RolesForm({
  formData,
  onChange,
  disabled = false,
}: RolesFormProps) {
  function togglePermits(key: string) {
    const current = formData.permits
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const exists = current.includes(key);
    const updated = exists
      ? current.filter((p) => p !== key)
      : [...current, key];

    onChange("permits", updated.join("\n"));
  }

  const selectedPermits = formData.permits
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

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

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">permits</h3>

          {PERMITS_ROLES.map(({ key, label }) => {
            const isChecked = selectedPermits.includes(key);
            return (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() => togglePermits(key)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-800">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}
