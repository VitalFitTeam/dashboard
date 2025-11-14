"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "../RolesForm";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Roles } from "@/models/roles";
import {
  validateRole,
  validateRoleField,
  RoleFormData,
} from "@/lib/validation/roleSchema";
import type { CreateRole } from "@vitalfit/sdk";

export default function CreateRole() {
  const router = useRouter();
  const { token } = useAuth();

  const [formData, setFormData] = useState<Roles>({
    id: "",
    name: "",
    description: "",
    Permission: [],
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RoleFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showServerError, setShowServerError] = useState({
    visible: false,
    message: "",
  });

  const handleChange = (field: keyof Roles, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field as keyof RoleFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof Roles, value: string) => {
    // Validación en tiempo real al perder el foco
    const result = validateRoleField(field, value);
    if (!result.success && result.error) {
      setErrors((prev) => ({ ...prev, [field]: result.error }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePermissionChange = (permissionId: string, isChecked: boolean) => {
    const newPermissions = isChecked
      ? [...selectedPermissions, permissionId]
      : selectedPermissions.filter((id) => id !== permissionId);

    setSelectedPermissions(newPermissions);

    // Validar permisos cuando cambian
    const result = validateRoleField("permissionsID", newPermissions);
    if (!result.success && result.error) {
      setErrors((prev) => ({ ...prev, permissionsID: result.error }));
    } else {
      setErrors((prev) => ({ ...prev, permissionsID: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowServerError({ visible: false, message: "" });

    // Validar token
    if (!token) {
      setShowServerError({
        visible: true,
        message: "No estás autenticado. Por favor, inicia sesión nuevamente.",
      });
      return;
    }

    const formDataToValidate = {
      name: formData.name,
      description: formData.description,
      permissionsID: selectedPermissions,
    };

    const validationResult = validateRole(formDataToValidate);
    if (!validationResult.success) {
      const newErrors: Partial<Record<keyof RoleFormData, string>> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path.length > 0 && typeof issue.path[0] === "string") {
          const field = issue.path[0] as keyof RoleFormData;
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const payload: CreateRole = {
      name: formData.name,
      description: formData.description,
      permissions: selectedPermissions,
    };

    setIsLoading(true);
    try {
      await api.RBAC.createRole(payload, token);

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/users/audit");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error al crear rol:", err);

      if (err && typeof err === "object" && "messages" in err) {
        const error = err as { messages: string[]; error?: string };
        if (error.messages[0] === "conflict") {
          setShowServerError({
            visible: true,
            message:
              "Ya existe un rol con este nombre. Verifica los datos ingresados.",
          });
        } else {
          setShowServerError({
            visible: true,
            message: error.error || "Error desconocido al crear rol",
          });
        }
      } else {
        setShowServerError({
          visible: true,
          message: "Error desconocido al crear rol",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title="CREAR NUEVO ROL"
          subtitle="Complete la información del nuevo rol"
        />

        <RolesForm
          formData={formData}
          onChange={handleChange}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
          onFieldBlur={handleFieldBlur}
          errors={errors}
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Creando..." : "Crear Rol"}
          </Button>
        </div>
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="¡Rol creado exitosamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showServerError.visible && (
        <Notification
          variant="destructive"
          title="Error al crear rol"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
