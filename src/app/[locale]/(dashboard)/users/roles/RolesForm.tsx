"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Roles } from "@/models/roles";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RoleFormData } from "@/lib/validation/roleSchema";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { Permission } from "@vitalfit/sdk";

interface RolesFormProps {
  formData: Roles;
  onChange: (field: keyof Roles, value: string) => void;
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string, isChecked: boolean) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof RoleFormData, string>>;
  onFieldBlur?: (field: keyof Roles, value: string) => void;
}

interface PermissionOption {
  key: string;
  label: string;
}

export default function RolesForm({
  formData,
  onChange,
  selectedPermissions = [],
  onPermissionChange,
  disabled = false,
  errors = {},
  onFieldBlur,
}: RolesFormProps) {
  const t = useTranslations("roles.form");
  const { token } = useAuth();
  const [permissions, setPermissions] = useState<PermissionOption[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  const handleBlur = (field: keyof Roles, value: string) => {
    if (onFieldBlur) {
      onFieldBlur(field, value);
    }
  };

  const getFieldError = (field: keyof RoleFormData): string | undefined => {
    return errors[field];
  };

  useEffect(() => {
    const loadPermissions = async () => {
      if (!token) {
        setPermissionsError(t("errors.no_token"));
        setIsLoadingPermissions(false);
        return;
      }

      try {
        setIsLoadingPermissions(true);
        setPermissionsError(null);

        const response = await api.RBAC.getPermissions(token);

        if (response && Array.isArray(response.data)) {
          const mappedPermissions: PermissionOption[] = response.data.map(
            (permission: Permission) => ({
              key: permission.permission_id,
              label: permission.name || permission.permission_id,
            }),
          );
          setPermissions(mappedPermissions);
        } else {
          setPermissionsError(t("errors.load_permissions_failed"));
          setPermissions([]);
        }
      } catch (error) {
        console.error("Error al cargar permisos:", error);
        setPermissionsError(t("errors.server_error"));
        setPermissions([]);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [token]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
            >
              {t("fields.name")}
            </label>
            <Input
              id="nombre"
              name="nombre"
              placeholder={t("fields.name_placeholder")}
              disabled={disabled}
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              onBlur={(e) => handleBlur("name", e.target.value)}
              className={`bg-white w-full ${getFieldError("name") ? "border-red-500" : ""}`}
            />
            {getFieldError("name") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("name")}
              </p>
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
            {t("fields.description")}
          </label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            placeholder={t("fields.description_placeholder")}
            disabled={disabled}
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            onBlur={(e) => handleBlur("description", e.target.value)}
            className={`bg-white w-full ${getFieldError("description") ? "border-red-500" : ""}`}
          />
          {getFieldError("description") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("description")}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="mt-6 w-full">
          <span className="font-semibold text-gray-700 mb-4">{t("fields.permissions")}</span>

          {isLoadingPermissions && (
            <div className="text-sm text-gray-500 mb-4">
              {t("fields.loading_permissions")}
            </div>
          )}

          {permissionsError && (
            <div className="text-red-500 text-sm mb-4">{permissionsError}</div>
          )}

          {!isLoadingPermissions &&
            !permissionsError &&
            permissions.length === 0 && (
              <div className="text-sm text-gray-500 mb-4">
                {t("fields.no_permissions")}
              </div>
            )}

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-2">
              {permissions.map(({ key, label }) => {
                const isChecked = selectedPermissions.includes(key);
                return (
                  <label
                    key={key}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={(e) =>
                        onPermissionChange(key, e.target.checked)
                      }
                      className={`h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 ${getFieldError("permissionsID") ? "border-red-500" : ""
                        }`}
                    />
                    <span className="text-sm text-gray-800 flex-1">
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {!isLoadingPermissions &&
            !permissionsError &&
            permissions.length > 0 && (
              <div className="text-sm text-gray-600 mt-2">
                {t("fields.permissions_selected", { selected: selectedPermissions.length, total: permissions.length })}
              </div>
            )}

          {getFieldError("permissionsID") && (
            <p className="text-red-500 text-sm mt-2">
              {getFieldError("permissionsID")}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
