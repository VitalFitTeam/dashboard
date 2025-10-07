"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation/loginSchema";
import type { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

import Input from "@/components/input";
import PasswordInput from "@/components/passwordInput";
import { colors, montserrat } from "@/styles/styles";
import Button from "../button";
import { fetchAPI } from "@/lib/api";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      console.log("Login exitoso:", result);
      localStorage.setItem("token", result.token);
      window.location.href = "/profile";
    } catch (err) {
      alert("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className={`bg-white border border-gray-200 shadow-2xl rounded-2xl p-10 w-full max-w-md ${montserrat.className}`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo/isotipo.png"
            alt="VitalFit Logo"
            width={140}
            height={140}
            className="rounded-full"
          />
        </div>

        <h2
          className={`text-center text-[1.5rem] font-semibold text-[${colors.complementary.black}] mb-2`}
        >
          Bienvenido
        </h2>
        <p className="text-center text-gray-600 text-base mb-8">
          Por favor introduce tus datos para iniciar sesión
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="albanibarragan@vitalfit.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Contraseña
            </label>
            <PasswordInput
              placeholder="Ingresa tu contraseña"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          <div className={"text-center text-[1rem]"}>
            <a
              href="#"
              style={{ color: colors.primary }}
              className="font-semibold hover:no-underline transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit">Iniciar sesion</Button>
        </form>
      </div>
    </div>
  );
}
