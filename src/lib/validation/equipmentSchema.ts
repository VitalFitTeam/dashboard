import { z } from "zod";

export const equipmentSchema = z.object({
  // ✅ CORRECCIÓN: Hacemos el ID opcional.
  // Así no falla cuando estás creando un equipo nuevo (que aún no tiene ID).
  equipment_id: z.string().optional(),

  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  brand: z.string().min(1, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  category: z.enum(
    ["Cardio", "Strength", "FreeWeight", "Functional", "Accessory"],
    {
      errorMap: () => ({ message: "La categoría es obligatoria" }),
    },
  ),
});

export type EquipmentSchema = z.infer<typeof equipmentSchema>;
