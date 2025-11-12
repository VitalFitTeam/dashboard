"use client";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/phone-input";
import { InstructorDataList } from "@vitalfit/sdk";
import {
  InstructorFormData,
  validateInstructorField,
} from "@/lib/validation/instructorSchema";

interface InstructorFormProps {
  formData: InstructorDataList;
  onChange: (field: keyof InstructorDataList, value: string) => void;
  mode?: "view" | "edit";
  disabled?: boolean;
  errors?: Partial<Record<keyof InstructorFormData, string>>;
  onFieldBlur?: (field: keyof InstructorDataList, value: string) => void;
}

export default function InstructorForm({
  formData,
  onChange,
  mode = "view",
  errors = {},
  onFieldBlur,
}: InstructorFormProps) {
  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) {return "";}

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toISOString().split("T")[0];
  };

  const handleBlur = (field: keyof InstructorDataList, value: string) => {
    if (onFieldBlur) {
      onFieldBlur(field, value);
    }
  };

  const getFieldError = (
    field: keyof InstructorFormData,
  ): string | undefined => {
    return errors[field];
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
            >
              Nombre*
            </label>
            <Input
              id="nombre"
              name="nombre"
              disabled={mode === "view" ? true : false}
              placeholder="Nombre"
              value={formData.first_name}
              onChange={(e) => onChange("first_name", e.target.value)}
              onBlur={(e) => handleBlur("first_name", e.target.value)}
              className={`bg-white w-full ${getFieldError("first_name") ? "border-red-500" : ""}`}
            />
            {getFieldError("first_name") && (
              <p className="text-red-500 text-xs mt-1 text-left">
                {getFieldError("first_name")}
              </p>
            )}
          </div>
        </div>
        <div className="flex-1">
          <label
            htmlFor="apellido"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Apellido*
          </label>
          <Input
            id="apellido"
            name="apellido"
            placeholder="Apellido"
            disabled={mode === "view" ? true : false}
            value={formData.last_name}
            onChange={(e) => onChange("last_name", e.target.value)}
            onBlur={(e) => handleBlur("last_name", e.target.value)}
            className={`bg-white w-full ${getFieldError("last_name") ? "border-red-500" : ""}`}
          />
          {getFieldError("last_name") && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {getFieldError("last_name")}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 mb-3">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
        >
          Correo Electrónico*
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          disabled={mode === "view" ? true : false}
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={(e) => handleBlur("email", e.target.value)}
          className={`bg-white w-full ${getFieldError("email") ? "border-red-500" : ""}`}
        />
        {getFieldError("email") && (
          <p className="text-red-500 text-xs mt-1 text-left">
            {getFieldError("email")}
          </p>
        )}
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label
            htmlFor="documento"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Documento de identidad*
          </label>
          <Input
            id="documento"
            name="documento"
            disabled={mode === "view" ? true : false}
            placeholder="Documento"
            value={formData.identity_document}
            onChange={(e) => onChange("identity_document", e.target.value)}
            onBlur={(e) => handleBlur("identity_document", e.target.value)}
            className={`bg-white w-full ${getFieldError("identity_document") ? "border-red-500" : ""}`}
          />
          {getFieldError("identity_document") && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {getFieldError("identity_document")}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor="telefono"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Número de teléfono*
          </label>
          <PhoneInput
            id="telefono"
            disabled={mode === "view" ? true : false}
            value={formData.phone}
            defaultCountry="VE"
            onChange={(value) => onChange("phone", value)}
            onBlur={() => handleBlur("phone", formData.phone)}
            className={
              getFieldError("phone") ? "border-red-500 rounded-md" : ""
            }
          />
          {getFieldError("phone") && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {getFieldError("phone")}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex-1">
          <label
            htmlFor="nacimiento"
            className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left"
          >
            Fecha de Nacimiento*
          </label>
          <Input
            id="nacimiento"
            type="date"
            name="nacimiento"
            disabled={mode === "view" ? true : false}
            value={formatDateForBackend(formData.birth_date)}
            onChange={(e) => onChange("birth_date", e.target.value)}
            onBlur={(e) => handleBlur("birth_date", e.target.value)}
            className={`bg-white w-full ${getFieldError("birth_date") ? "border-red-500" : ""}`}
          />
          {getFieldError("birth_date") && (
            <p className="text-red-500 text-xs mt-1 text-left">
              {getFieldError("birth_date")}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left">
            Género*
          </label>
          {getFieldError("gender") && (
            <p className="text-red-500 text-xs mb-2 text-left">
              {getFieldError("gender")}
            </p>
          )}

          <label className="flex items-center">
            <input
              disabled={mode === "view" ? true : false}
              type="radio"
              name="genero"
              value="male"
              checked={formData.gender === "male"}
              onChange={() => onChange("gender", "male")}
              onBlur={() => handleBlur("gender", "male")}
              className="form-radio h-4 w-4 text-primary"
            />
            <span className="ml-2">Masculino</span>
          </label>

          <label className="flex items-center">
            <input
              disabled={mode === "view" ? true : false}
              type="radio"
              name="genero"
              value="female"
              checked={formData.gender === "female"}
              onChange={() => onChange("gender", "female")}
              onBlur={() => handleBlur("gender", "female")}
              className="form-radio h-4 w-4 text-primary"
            />
            <span className="ml-2">Femenino</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              disabled={mode === "view" ? true : false}
              value="prefer-not-to-say"
              checked={formData.gender === "prefer-not-to-say"}
              onChange={() => onChange("gender", "prefer-not-to-say")}
              onBlur={() => handleBlur("gender", "prefer-not-to-say")}
              className="form-radio h-4 w-4 text-primary"
            />
            <span className="ml-2">Prefiero no especificarlo</span>
          </label>
        </div>
      </div>
    </>
  );
}
