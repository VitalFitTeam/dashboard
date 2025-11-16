import { z } from "zod";

export const roleSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre del rol es requerido" })
    .max(50, { message: "El nombre no puede tener más de 50 caracteres" }),

  description: z
    .string()
    .min(1, { message: "La descripción es requerida" })
    .max(200, {
      message: "La descripción no puede tener más de 200 caracteres",
    }),

  permissionsID: z
    .array(z.string())
    .min(1, { message: "Debe seleccionar al menos un permiso" })
    .max(20, { message: "No puede seleccionar más de 20 permisos" }),
});

export type RoleFormData = z.infer<typeof roleSchema>;

export const createRoleSchema = roleSchema;

export const updateRoleSchema = roleSchema.partial();

export const realTimeRoleSchema = roleSchema.partial();

export const validateRole = (data: any) => {
  return roleSchema.safeParse(data);
};

// Función de validación por campo
export const validateRoleField = (field: string, value: any) => {
  try {
    roleSchema.pick({ [field]: true }).parse({ [field]: value });
    return { success: true, error: undefined };
  } catch (error: any) {
    return {
      success: false,
      error: error.issues?.[0]?.message || "Error de validación",
    };
  }
};
