"use client";
import { Roles, PERMITS_ROLES } from "@/models/roles";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
// En RolesForm, agrega esta interface y usa las props de error
interface RolesFormProps {
  formData: Roles;
  onChange: (field: keyof Roles, value: string) => void;
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string, isChecked: boolean) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

export default function RolesForm({
  formData,
  onChange,
  selectedPermissions = [],
  onPermissionChange,
  disabled = false,
  errors = {}
}: RolesFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left">
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
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1 mb-3">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left">
            Descripción*
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
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="mt-6 w-full">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Permisos</h3>
          <div className="space-y-2">
            {PERMITS_ROLES.map(({ key, label }) => {
              const isChecked = selectedPermissions.includes(key);
              return (
                <label key={key} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={disabled}
                    onChange={(e) => onPermissionChange(key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800">{label}</span>
                </label>
              );
            })}
          </div>
          {errors.permissionsID && <p className="text-red-500 text-sm mt-2">{errors.permissionsID}</p>}
        </div>
      </div>
    </>
  );
}