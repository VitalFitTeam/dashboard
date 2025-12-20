"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "../../RolesForm";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Roles } from "@/models/roles";
import {
  validateRole,
  validateRoleField,
  RoleFormData,
} from "@/lib/validation/roleSchema";
import { RoleResponse, CreateRole, DataResponse } from "@vitalfit/sdk";

export default function EditRolePage() {
  const t = useTranslations("roles.edit");
  const tForm = useTranslations("roles.form");
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
  const [errors, setErrors] = useState<
    Partial<Record<keyof RoleFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadRole = async () => {
      if (!id || !token) {
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
          toast.error(t("load_error"));
        }
      } catch (err) {
        console.error("Error cargando rol:", err);
        toast.error(t("load_error"));
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [id, token]);

  const handleChange = (field: keyof Roles, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof RoleFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof Roles, value: string) => {
    const result = validateRoleField(field, value, tForm);
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

    const result = validateRoleField("permissionsID", newPermissions, tForm);
    if (!result.success && result.error) {
      setErrors((prev) => ({ ...prev, permissionsID: result.error }));
    } else {
      setErrors((prev) => ({ ...prev, permissionsID: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !token) {
      return;
    }

    const formDataToValidate = {
      name: formData.name,
      description: formData.description,
      permissionsID: selectedPermissions,
    };

    const validationResult = validateRole(formDataToValidate, tForm);
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

    setIsSaving(true);
    try {
      const payload: CreateRole = {
        name: formData.name,
        description: formData.description,
        permissions: [],
      };

      await api.RBAC.updateRole(formData.id, payload, token);

      if (selectedPermissions.length > 0) {
        await api.RBAC.addPermission(formData.id, selectedPermissions, token);
      }

      toast.success(t("success"));
      setTimeout(() => {
        router.push("/users/roles");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error al actualizar rol:", err);

      if (err && typeof err === "object" && "messages" in err) {
        const error = err as { messages: string[]; error?: string };
        if (error.messages[0] === "conflict") {
          toast.error(t("conflict_error"));
        } else {
          toast.error(error.error || t("error"));
        }
      } else {
        toast.error(t("error"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle", { name: formData.name })}
          actionButton={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.push("/users/roles")}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" variant="default" disabled={isSaving}>
                {isSaving ? t("loading") : t("button")}
              </Button>
            </div>
          }
        />

        <RolesForm
          formData={formData}
          onChange={handleChange}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
          onFieldBlur={handleFieldBlur}
          errors={errors}
        />
      </form>
    </div>
  );
}
