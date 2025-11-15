import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,;:()]+$/,
      "El nombre contiene caracteres no permitidos",
    ),

  description: z
    .string()
    .min(1, "La descripción es requerida")
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder los 500 caracteres"),

  category_id: z
    .string()
    .min(1, "La categoría es requerida")
    .uuid("El ID de categoría no es válido"),

  duration_minutes: z
    .string()
    .min(1, "La duración es requerida")
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: "La duración debe ser un número mayor a 0",
    })
    .refine((val) => parseInt(val) <= 480, {
      message: "La duración no puede exceder las 8 horas (480 minutos)",
    }),

  priority_score: z
    .string()
    .min(1, "La prioridad es requerida")
    .refine((val) => ["1", "2", "3", "4", "5"].includes(val), {
      message: "La prioridad debe ser entre 1 y 5",
    }),

  is_featured: z.string().refine((val) => ["true", "false"].includes(val), {
    message: "El valor de destacado no es válido",
  }),

  banner_id: z
    .string()
    .optional()
    .refine((val) => !val || z.string().uuid().safeParse(val).success, {
      message: "El ID de banner no es válido",
    }),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
