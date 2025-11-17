import { z } from "zod";

// Definir los valores del enum primero
const genderEnum = ["male", "female", "prefer-not-to-say"] as const;

export const instructorSchema = z.object({
  first_name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(50, { message: "El nombre no puede tener más de 50 caracteres" })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    }),

  last_name: z
    .string()
    .min(1, { message: "El apellido es requerido" })
    .max(50, { message: "El apellido no puede tener más de 50 caracteres" })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "El apellido solo puede contener letras y espacios",
    }),

  email: z
    .string()
    .min(1, { message: "El email es requerido" })
    .email({ message: "El formato del email es inválido" })
    .max(100, { message: "El email no puede tener más de 100 caracteres" }),

  identity_document: z
    .string()
    .min(1, { message: "El documento de identidad es requerido" })
    .max(20, { message: "El documento no puede tener más de 20 caracteres" }),

  phone: z
    .string()
    .min(1, { message: "El teléfono es requerido" })
    .max(20, { message: "El teléfono no puede tener más de 20 caracteres" }),

  birth_date: z
    .string()
    .min(1, { message: "La fecha de nacimiento es requerida" })
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age - 1 >= 18;
        }
        return age >= 18;
      },
      { message: "El instructor debe ser mayor de 18 años" },
    )
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        return birthDate <= today;
      },
      { message: "La fecha de nacimiento no puede ser futura" },
    ),

  gender: z
    .string()
    .min(1, { message: "El género es requerido" })
    .refine(
      (value) => ["male", "female", "prefer-not-to-say"].includes(value),
      {
        message: "El género debe ser: male, female o prefer-not-to-say",
      },
    ),

  biography: z
    .string()
    .max(500, { message: "La biografía no puede tener más de 500 caracteres" })
    .optional(),

  profile_picture_url: z
    .string()
    .url({ message: "La URL de la foto debe ser válida" })
    .optional()
    .or(z.literal("")),
});

export type InstructorFormData = z.infer<typeof instructorSchema>;

export const validateInstructor = (data: any) => {
  return instructorSchema.safeParse(data);
};

export const validateInstructorField = (field: string, value: any) => {
  try {
    instructorSchema.pick({ [field]: true }).parse({ [field]: value });
    return { success: true, error: undefined };
  } catch (error: any) {
    return {
      success: false,
      error: error.issues?.[0]?.message || "Error de validación",
    };
  }
};

export type GenderEnum = (typeof genderEnum)[number];
