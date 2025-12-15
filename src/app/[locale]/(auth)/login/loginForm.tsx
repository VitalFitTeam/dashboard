"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginFormData,
  LoginPayload,
  loginSchema,
} from "@/lib/validation/loginSchema";
import { Button } from "@/components/ui/button";
import { colors, montserrat } from "@/styles/styles";
import InputField from "@/components/ui/InputField";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const t = useTranslations("LoginPage");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const payload: LoginPayload = {
      ...data,
      context: "dashboard",
    };

    try {
      const response = await api.auth.login(payload);
      const token = response.token;

      if (!token) {
        throw new Error("Token no recibido");
      }

      await login(token);
      router.replace("/");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      if (err instanceof Error) {
        if ("status" in err && err.status === 401) {
          setErrorMessage(t("errorCredentials"));
        } else {
          setErrorMessage(t("errorUnexpected"));
        }
      } else {
        setErrorMessage(t("errorGeneric"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className={`bg-white border border-gray-200 shadow-2xl rounded-2xl p-10 w-full max-w-md ${montserrat.className}`}
      >
         <div className="flex justify-center mb-4">

          <Image

            src="/logo/isotipo.png"

            alt="VitalFit Logo"

            width={120}

            height={120}

            className="rounded-full"

          />

        </div>
        
        <h2
          className={`text-center text-[1.6rem] font-bold text-[${colors.complementary.black}] mb-2`}
        >
          {t("title")}
        </h2>
        <p className="text-center text-gray-600 text-sm mb-8">
          {t("subtitle")}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField
            label={t("emailLabel")}
            type="email"
            placeholder={t("emailPlaceholder")}
            {...register("email")}
            error={errors.email?.message}
          />

          <InputField
            label={t("passwordLabel")}
            type="password"
            placeholder={t("passwordPlaceholder")}
            {...register("password")}
            error={errors.password?.message}
          />

          <div className="text-right text-[0.9rem] mb-6">
            <Link
              href="/forgotPassword"
              style={{ color: colors.primary }}
              className="font-semibold hover:underline transition-colors duration-200"
            >
              {t("forgotPasswordLink")}
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="lg"
          >
            {t("accessButton")}
          </Button>
        </form>

        {errorMessage && (
          <div
            className="mb-10 p-4 text-center text-red-700 bg-red-50 border border-red-300 rounded-lg font-medium"
            role="alert"
          >
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
