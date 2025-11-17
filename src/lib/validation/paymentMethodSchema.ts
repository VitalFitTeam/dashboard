import { z } from "zod";

export const paymentMethodSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-]+$/,
      "El nombre solo puede contener letras, números y espacios",
    ),

  type: z.string().min(1, "Selecciona un tipo"),

  processing_type: z.string().min(1, "Selecciona un tipo de procesamiento"),

  description: z
    .string()
    .max(500, "La descripción no puede tener más de 500 caracteres")
    .optional(),
});

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
