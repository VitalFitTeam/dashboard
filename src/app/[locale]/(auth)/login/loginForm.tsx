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
import { api } from "@/lib/sdk-config"; // <--- VOLVEMOS A USAR EL SDK
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/layout/localeSwitcher/LocaleSwitcher";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Login ahora acepta (access, refresh)
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
      // 1. USAMOS EL SDK
      // Truco: Usamos 'as any' temporalmente. 
      // ¿Por qué? Porque si el SDK no han actualizado sus archivos de definición (.d.ts),
      // TypeScript gritará que "refresh_token" no existe en la respuesta.
      // Pero sabemos que el backend SÍ lo envía (runtime).
      const response = await api.auth.login(payload) as any;

      console.log("Respuesta del SDK:", response); // Para depurar

      // 2. EXTRAEMOS LOS TOKENS
      // Buscamos 'access_token' (lo que dice Swagger) O 'token' (lo que usaba antes el SDK)
      // para ser compatibles con ambos casos.
      const accessToken = response.access_token || response.token;
      const refreshToken = response.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error("Faltan tokens en la respuesta del servidor");
      }

      // 3. ENVIAMOS AL CONTEXTO
      await login(accessToken, refreshToken);
      
      router.replace("/");

    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      // El manejo de errores del SDK suele venir encapsulado,
      // así que mantenemos tu lógica original para leer el status.
      if (err instanceof Error) {
        // A veces Axios/SDK guarda el status dentro de response
        const status = (err as any).response?.status || (err as any).status;
        
        if (status === 401) {
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
      {/* ... (Todo el JSX visual sigue igual) ... */}
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
          disabled={isLoading}
          variant="default"
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