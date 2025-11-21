import { z } from "zod";

export const equipmentSchema = z.object({
  // Mantenemos equipment_id opcional (crucial para Crear Equipo)
  equipment_id: z.string().optional(),

  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  brand: z.string().min(1, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),

  // ✅ CORRECCIÓN: Eliminamos el objeto { errorMap: ... }
  // Dejamos solo el array de opciones.
  category: z.enum([
    "Cardio",
    "Strength",
    "FreeWeight",
    "Functional",
    "Accessory",
  ]),
});

export type EquipmentSchema = z.infer<typeof equipmentSchema>;
