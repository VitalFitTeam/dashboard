"use client";
import { useState, useEffect } from "react";
import { Users } from "@/models/users";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { RoleResponse } from "@vitalfit/sdk";
import { useTranslations } from "next-intl";

import { ScrollArea } from "@/components/ui/scroll-area";

interface UsersFormProps {
  formData: Users;
  onChange: (field: keyof Users, value: string) => void;
  disabled?: boolean;
  edit?: boolean;
}

export default function UsersForm({
  formData,
  onChange,
  disabled = false,
  edit = false,
}: UsersFormProps) {
  const { token } = useAuth();
  const t = useTranslations("user.management");
  const tRoles = useTranslations("user.UserSelectionCard.roles");
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);


  useEffect(() => {
    const loadRoles = async () => {
      if (!token) {
        return;
      }
      setIsLoadingRoles(true);



      try {
        const response = await api.RBAC.getRoles(
          {
            page: 1,
            limit: 100,
            search: undefined,
            sort: "desc",
          },
          token,
        );
        setRoles(response.data || []);
      } catch (error) {
        console.error("Error loading roles:", error);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadRoles();
  }, [token]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
            >
              {t("form.name")}
            </label>
            <Input
              id="nombre"
              name="nombre"
              placeholder={t("form.name").replace("*", "")}
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="bg-white w-full"
              disabled={disabled}
            />

          </div>
        </div>
        <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
            >
              {t("form.lastname")}
            </label>
            <Input
              id="apellido"
              name="apellido"
              placeholder={t("form.lastname").replace("*", "")}
              value={formData.lastname}
              onChange={(e) => onChange("lastname", e.target.value)}
              className="bg-white w-full"
              disabled={disabled}
            />

          </div>
        </div>
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1 mb-3">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            {t("form.email")}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("form.email_placeholder")}
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="bg-white w-full"
            disabled={disabled}
          />

        </div>
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label
            htmlFor="telefono"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            {t("form.phone")}
          </label>
          <PhoneInput
            id="telefono"
            value={formData.phone ? (formData.phone.startsWith("+") ? formData.phone : `+${formData.phone}`) : ""}
            defaultCountry="VE"
            onChange={(value) => onChange("phone", value || "")}
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="documento"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            {t("form.document")}
          </label>
          <Input
            id="documento"
            name="documento"
            placeholder={t("form.document").replace("*", "")}
            value={formData.document}
            onChange={(e) => onChange("document", e.target.value)}
            className="bg-white w-full"
            disabled={disabled}
          />
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex-1">
          <label
            htmlFor="nacimiento"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            {t("form.birth_date")}
          </label>
          <Input
            id="nacimiento"
            type="date"
            name="nacimiento"
            value={formData.date}
            onChange={(e) => onChange("date", e.target.value)}
            className="bg-white w-full"
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left">
            {t("form.gender")}
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="male"
              checked={formData.gender === "male" || formData.gender === "masculino"}
              onChange={() => onChange("gender", "male")}
              className="form-radio h-4 w-4 text-primary"
              disabled={disabled}
            />
            <span className="ml-2">{t("form.genders.male")}</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="female"
              checked={formData.gender === "female" || formData.gender === "femenino"}
              onChange={() => onChange("gender", "female")}
              className="form-radio h-4 w-4 text-primary"
              disabled={disabled}
            />
            <span className="ml-2">{t("form.genders.female")}</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="other"
              checked={formData.gender === "other" || formData.gender === "prefer-not-to-say"}
              onChange={() => onChange("gender", "other")}
              className="form-radio h-4 w-4 text-primary"
              disabled={disabled}
            />
            <span className="ml-2">{t("form.genders.other")}</span>
          </label>
        </div>

      </div>

      {/* Sección de Rol - Ahora visible tanto en creación como edición */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:text-base text-left">
          {t("form.role")}
        </label>
        {isLoadingRoles ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div
                key={role.role_id}
                onClick={() => !disabled && onChange("rol", role.name)}
                className={`cursor-pointer border rounded-lg p-4 shadow-sm transition-all ${formData.rol === role.name
                  ? "border-primary bg-primary/10"
                  : "border-gray-300 hover:border-primary"
                  } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {tRoles(role.name.toLowerCase()) || role.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  {formData.rol === role.name && (
                    <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                      ✓
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 italic">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>


      {!edit && (
        <div className="my-4 cursor-pointer border rounded-lg p-4 shadow-sm transition-all border-primary bg-primary/10">
          <span className="block text-sm font-medium text-gray-700 mb-2 sm:text-base text-left">
            {t("form.next_steps.title")}
          </span>
          <ul className="list-disc pl-8 text-sm text-gray-600 space-y-1">
            <li>
              {t("form.next_steps.email_sent", { email: formData.email })}
            </li>
            <li>{t("form.next_steps.verify")}</li>
            <li>{t("form.next_steps.password")}</li>
            <li>
              {t("form.next_steps.pending")}
            </li>
          </ul>
        </div>
      )}

    </>
  );
}