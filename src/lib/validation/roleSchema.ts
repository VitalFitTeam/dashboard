// @/lib/validation/roleSchema.ts
import { z } from "zod";

const baseRoleSchema = {
  name: z.string().min(1, "El nombre del rol es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  permissionsID: z.array(z.string()).min(1, "Se debe seleccionar al menos un permiso")
};

export const createRoleSchema = z.object(baseRoleSchema);
export const updateRoleSchema = z.object(baseRoleSchema);
