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
import LocaleSwitcher from "@/components/layout/localeSwitcher/LocaleSwitcher";

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
  <div className={`relative bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-8 md:p-12 w-full max-w-md ${montserrat.className}`}>
    <div className="absolute top-4 right-4">
      <LocaleSwitcher />
    </div>
    <div className="flex flex-col items-center mb-10">
      <div className="bg-gray-50 p-2 rounded-full mb-6 ring-8 ring-gray-50/50">
        <Image
          src="/logo/isotipo.png"
          alt="VitalFit Logo"
          width={100}
          height={100}
          className="rounded-full"
          priority
        />
      </div>
      
      <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
        {t("title")}
      </h2>
      <p className="text-center text-gray-500 text-base max-w-[280px]">
        {t("subtitle")}
      </p>
    </div>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        <InputField
          label={t("emailLabel")}
          type="email"
          placeholder={t("emailPlaceholder")}
          {...register("email")}
          error={errors.email?.message}
          className="hover:border-gray-300 transition-colors"
        />

        <div className="space-y-1">
          <InputField
            label={t("passwordLabel")}
            type="password"
            placeholder={t("passwordPlaceholder")}
            {...register("password")}
            error={errors.password?.message}
            className="hover:border-gray-100 transition-colors"
          />
          <div className="flex justify-end">
            <Link
              href="/forgotPassword"
              style={{ color: colors.primary }}
              className="text-sm font-semibold hover:opacity-80 transition-opacity duration-200"
            >
              {t("forgotPasswordLink")}
            </Link>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
        variant="primary"
        size="lg"
        className="py-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
      >
        {t("accessButton")}
      </Button>
    </form>
    {errorMessage && (
      <div
        className="mt-6 p-4 text-center text-red-600 bg-red-50 border border-red-100 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2"
        role="alert"
      >
        {errorMessage}
      </div>
    )}
  </div>
);
}
