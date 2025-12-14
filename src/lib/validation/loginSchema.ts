// src/lib/validation/loginSchema.ts (BASE)

import { z, ZodType } from "zod";

// 1. Definición base
export const loginSchemaBase = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty().min(8).max(20),
});

// 2. Exportamos el tipo de Zod de la forma que RHF/Resolver lo esperan.
export type LoginFormData = z.infer<typeof loginSchemaBase>;

// 3. Exportamos un tipo de ZodType fuertemente tipado para el hook.
// Esto nos permite usarlo como tipo de retorno en el hook.
export type TLoginSchema = ZodType<LoginFormData>;

export type LoginPayload = LoginFormData & {
  context: "dashboard";
};
