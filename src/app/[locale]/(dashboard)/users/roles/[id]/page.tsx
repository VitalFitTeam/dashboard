"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "../RolesForm";
import { useAuth } from "@/context/AuthContext";
import { Roles } from "@/models/roles";
import { RoleResponse, DataResponse } from "@vitalfit/sdk";

export default function ViewRolePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [formData, setFormData] = useState<Roles>({
    id: "",
    name: "",
    description: "",
    Permission: [],
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      if (!id || !token) {
        setError("No se pudo cargar el rol");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response: DataResponse<RoleResponse> = await api.RBAC.getRoleByID(
          id,
          token,
        );
        if (response && response.data) {
          const roleData = response.data;
          setFormData({
            id: roleData.role_id,
            name: roleData.name,
            description: roleData.description,
            Permission: roleData.permissions,
          });

          const permissionIds =
            roleData.permissions?.map((p: any) => p.permission_id) || [];
          setSelectedPermissions(permissionIds);
        } else {
          setError("No se encontró el rol solicitado");
        }
      } catch (err) {
        console.error("Error cargando rol:", err);
        setError("No se pudo cargar la información del rol.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [id, token]);

  const handleEdit = () => {
    router.push(`/users/roles/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div>Cargando rol...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="text-red-500 text-center p-4">{error}</div>
        <div className="flex justify-center">
          <Button variant="default" onClick={() => router.push("/users/roles")}>
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <PageHeader
        title="Ver Rol"
        subtitle={`Información completa del rol y sus permisos: ${formData.name}`}
        actionButton={
          <div className="flex gap-2">
            <Button type="button" variant="default" onClick={handleEdit}>
              Modificar
            </Button>
          </div>
        }
      />

      <RolesForm
        formData={formData}
        onChange={() => {}} // No-op en modo visualización
        selectedPermissions={selectedPermissions}
        onPermissionChange={() => {}} // No-op en modo visualización
        disabled={true} // Deshabilitado en modo visualización
      />
    </div>
  );
}
