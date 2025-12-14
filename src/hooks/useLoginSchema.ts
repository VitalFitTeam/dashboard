"use client";

import { useTranslations } from "next-intl";
import { z, ZodType } from "zod";
import { LoginFormData, } from "@/lib/validation/loginSchema"; 

export const useLoginSchema = () => {
  const t = useTranslations("Auth");

  // Definimos el esquema traducido
  const schema = z.object({
    email: z
      .string()
      .nonempty(t("validation_email_required"))
      .email(t("validation_email_invalid")),
    password: z
      .string()
      .nonempty(t("validation_password_required"))
      .min(8, { message: t("validation_password_min", { min: 8 }) })
      .max(20, { message: t("validation_password_max", { max: 20 }) }),
  });

  // 🛑 LA SOLUCIÓN CLAVE: Devolvemos el esquema con el tipo Zod fuertemente tipado (TLoginSchema)
  // Esto resuelve la ambigüedad del sobrecarga de funciones del resolver.
  return schema as ZodType<LoginFormData>;
};