"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";

export const PasswordForm: React.FC = () => {
  const [form, setForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    if (!form.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida.";
    }
    if (!form.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida.";
    }
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white space-y-6 rounded-xl shadow-sm"
    >
      <div className="space-y-4">
        <InputField
          label="Contraseña Actual*"
          type="password"
          name="currentPassword"
          placeholder="Ingresa tu contraseña actual"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />

        <InputField
          label="Nueva Contraseña*"
          type="password"
          name="newPassword"
          placeholder="Ingresa una nueva contraseña"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />

        <InputField
          label="Confirmar Nueva Contraseña*"
          type="password"
          name="confirmPassword"
          placeholder="Confirma la nueva contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
      </div>

      <div className="pt-4">
        <Button fullWidth variant="default" type="submit">
          Actualizar Contraseña
        </Button>
      </div>
    </form>
  );
};
