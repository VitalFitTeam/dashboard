"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { Roles } from "@/models/roles";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "./RolesForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Notification } from "@/components/ui/Notification";
import { updateRoleSchema } from "@/lib/validation/roleSchema";

interface EditRolesProps {
  roles: Roles;
  onBack: () => void;
}

interface DataResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  count?: number;
}

interface Permission {
  permission_id?: string;
  id?: string;
  name?: string;
  description?: string;
}

interface RoleResponse {
  role_id: string;
  name: string;
  description: string;
  permissions?: Permission[];
}

export default function EditRoles({ roles, onBack }: EditRolesProps) {
  const { token } = useAuth();

  const [formData, setFormData] = useState<Roles>({
    id: roles.id,
    name: roles.name,
    description: roles.description
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRolePermissions = async () => {
      if (!token) {
        setIsLoadingPermissions(false);
        return;
      }

      try {
        const roleResponse: DataResponse<RoleResponse> = await api.RBAC.getRoleByID(roles.id, token);

        if (roleResponse.success && roleResponse.data) {
          const roleData = roleResponse.data;

          setFormData({
            id: roleData.role_id,
            name: roleData.name,
            description: roleData.description
          });

          if (roleData.permissions && Array.isArray(roleData.permissions)) {
            const permissionIds = roleData.permissions
              .map(permission => permission.permission_id || permission.id)
              .filter((id): id is string => !!id);

            setSelectedPermissions(permissionIds);
          } else {
            setSelectedPermissions([]);
          }
        } else {
          throw new Error(roleResponse.message || "Error al cargar los datos del rol");
        }
      } catch (error) {
        console.error("Error al cargar permisos del rol:", error);
        setError("No se pudieron cargar los permisos existentes del rol");
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadRolePermissions();
  }, [roles.id, token]);

  const validateForm = () => {
    try {
      updateRoleSchema.parse({
        name: formData.name,
        description: formData.description,
        permissionsID: selectedPermissions
      });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleChange = (field: keyof Roles, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handlePermissionChange = (permissionId: string, isChecked: boolean) => {
    setSelectedPermissions(prev => {
      const newPermissions = isChecked 
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId);
      
      if (formErrors.permissionsID) {
        setFormErrors(prev => ({ ...prev, permissionsID: "" }));
      }
      
      return newPermissions;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!token) {
      setError("No hay token de autenticación disponible");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const updateRoleData = {
        name: formData.name,
        description: formData.description,
        permissionsID: selectedPermissions
      };

      const response = await api.RBAC.updateRole(roles.id, updateRoleData, token);
      console.warn(response);

      setSuccess(true);
      setShowNotification(true);

      setTimeout(() => {
        onBack();
      }, 3000);

    } catch (error) {
      console.error("Error al actualizar rol:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "Error desconocido al actualizar el rol"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPermissions) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
        <PageHeader title="MODIFICAR ROL" />
        <div className="flex justify-center items-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando datos del rol...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader title="MODIFICAR ROL" />
        <p className="text-sm text-muted-foreground">Información del rol</p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Rol actualizado exitosamente! Redirigiendo...
            </AlertDescription>
          </Alert>
        )}

        <RolesForm
          formData={formData}
          onChange={handleChange}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
          errors={formErrors}
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            className="w-full"
            variant="secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>

      {showNotification && (
        <Notification
          variant="success"
          title="¡Éxito!"
          description="El rol ha sido actualizado correctamente"
          onClose={() => setShowNotification(false)}
          autoCloseDuration={3000}
        />
      )}
    </div>
  );
}