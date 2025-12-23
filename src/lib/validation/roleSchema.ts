import { z } from "zod";

export const getRoleSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t("validations.name_required") })
      .max(50, { message: t("validations.name_max") }),

    description: z
      .string()
      .min(1, { message: t("validations.description_required") })
      .max(200, {
        message: t("validations.description_max"),
      }),

    permissionsID: z
      .array(z.string())
      .min(1, { message: t("validations.permissions_min") })
      .max(20, { message: t("validations.permissions_max") }),
  });

export type RoleFormData = {
  name: string;
  description: string;
  permissionsID: string[];
};

export const validateRole = (data: any, t: (key: string) => string) => {
  return getRoleSchema(t).safeParse(data);
};

// Función de validación por campo
export const validateRoleField = (
  field: string,
  value: any,
  t: (key: string) => string,
) => {
  try {
    getRoleSchema(t)
      .pick({ [field as keyof RoleFormData]: true } as any)
      .parse({ [field]: value });
    return { success: true, error: undefined };
  } catch (error: any) {
    return {
      success: false,
      error: error.issues?.[0]?.message || "Error de validación",
    };
  }
};
