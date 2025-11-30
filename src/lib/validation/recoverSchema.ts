import { z } from "zod";
export const recoverSchema = z.object({
  usuario: z.string().email("Correo inválido"),
});
