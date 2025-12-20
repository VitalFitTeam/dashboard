"use client";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "../RolesForm";
import { useAuth } from "@/context/AuthContext";
import { Roles } from "@/models/roles";
import { RoleResponse, DataResponse } from "@vitalfit/sdk";

export default function ViewRolePage() {
  const t = useTranslations("roles");
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
        setError(t("edit.load_error"));
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
          setError(t("view.error_not_found"));
        }
      } catch (err) {
        console.error("Error cargando rol:", err);
        setError(t("edit.load_error"));
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
        <div>{t("edit.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="text-red-500 text-center p-4">{error}</div>
        <div className="flex justify-center">
          <Button variant="default" onClick={() => router.push("/users/roles")}>
            {t("view.back_button")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <PageHeader
        title={t("view.title")}
        subtitle={t("view.subtitle", { name: formData.name })}
        actionButton={
          <div className="flex gap-2">
            <Button type="button" variant="default" onClick={handleEdit}>
              {t("view.button_edit")}
            </Button>
          </div>
        }
      />

      <RolesForm
        formData={formData}
        onChange={() => { }}
        selectedPermissions={selectedPermissions}
        onPermissionChange={() => { }}
        disabled={true}
      />
    </div>
  );
}
