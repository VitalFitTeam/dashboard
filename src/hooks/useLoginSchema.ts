"use client";

import { useTranslations } from "next-intl";
import { z, ZodType } from "zod";
import { LoginFormData, } from "@/lib/validation/loginSchema"; 

export const useLoginSchema = () => {
  const t = useTranslations("Auth");

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

  return schema as ZodType<LoginFormData>;
};