"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import RolesForm from "../RolesForm";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { Roles } from "@/models/roles";
import {
  validateRole,
  validateRoleField,
  RoleFormData,
} from "@/lib/validation/roleSchema";
import type { CreateRole } from "@vitalfit/sdk";

export default function CreateRole() {
  const t = useTranslations("roles.create");
  const tForm = useTranslations("roles.form");
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

    if (!token) {
      toast.error(t("auth_error"));
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

    const payload: CreateRole = {
      name: formData.name,
      description: formData.description,
      permissions: selectedPermissions,
    };

    setIsLoading(true);
    try {
      await api.RBAC.createRole(payload, token);

      toast.success(t("success"));
      setTimeout(() => {
        router.push("/users/roles");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error al crear rol:", err);

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
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actionButton={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.push("/users/roles")}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? t("loading") : t("button")}
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
