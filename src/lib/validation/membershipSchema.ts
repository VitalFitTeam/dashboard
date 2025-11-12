import { z } from "zod";

export const membershipSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres"),

  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción no puede tener más de 500 caracteres"),

  duration_days: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) {return 0;}
      const num = Number(val);
      return isNaN(num) ? 0 : Math.max(0, num);
    })
    .pipe(
      z
        .number()
        .int("La duración debe ser un número entero")
        .min(1, "La duración no puede ser cero (0) o negativa")
        .max(3650, "La duración máxima es 3650 días (10 años)"),
    ),

  price: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) {return 0;}
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    })
    .pipe(
      z
        .number()
        .min(1, "El precio no puede cero (0) o negativo")
        .max(999999.99, "El precio máximo es 999,999.99"),
    ),

  is_active: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "string") {
        return val === "active" || val === "true";
      }
      return Boolean(val);
    })
    .pipe(z.boolean()),
});

export type MembershipFormData = z.infer<typeof membershipSchema>;
