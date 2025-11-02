"use client";
import { Instructor } from "@/models/instructor";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Label } from "@/components/ui/Label";

interface InstructorFormProps {
  formData: Instructor;
  onChange: (field: keyof Instructor, value: string) => void;
  onBack: (field: keyof Instructor, value: string) => void;
  disabled?: boolean;
}

export default function InstructorForm({ formData, onChange,onBack, disabled = false }: InstructorFormProps) {

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
              placeholder="Nombre"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="bg-white w-full"
            />
          </div>
        </div>
        <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
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
              value={formData.lastname}
              onChange={(e) => onChange("lastname", e.target.value)}
              className="bg-white w-full"
            />


          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              placeholder="Documento"
              value={formData.document}
              onChange={(e) => onChange("document", e.target.value)}
              className="bg-white w-full"
            />


          </div>
          <div className="flex-1">
            <Label htmlFor="specialty">Especialidad *</Label>
            <Select value={formData.specialty || "0"}>
              <SelectTrigger id="category" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona un Item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Selecciona un Item</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>

      <div className="flex flex-col mb-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
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
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="bg-white w-full"
          />


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
            value={formData.phone}
            defaultCountry="VE"
            onChange={(value) => onChange("phone", value)}
          />

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
            value={formData.date}
            onChange={(e) => onChange("date", e.target.value)}
            className="bg-white w-full"
          />


        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:text-base text-left">
            Género*
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="masculino"
              checked={formData.gender === "masculino"}
              onChange={() => onChange("gender", "masculino")}
              className="form-radio h-4 w-4 text-primary"
            />
            <span className="ml-2">Masculino</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="femenino"
              checked={formData.gender === "femenino"}
              onChange={() => onChange("gender", "femenino")}
              className="form-radio h-4 w-4 text-primary"
            />
            <span className="ml-2">Femenino</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="prefiero no especificarlo"
              checked={formData.gender === "prefiero no especificarlo"}
              onChange={() => onChange("gender", "prefiero no especificarlo")}
              className="form-radio h-4 w-4 text-primary"
            />
            <span className="ml-2">Prefiero no especificarlo</span>
          </label>

        </div>
      </div>
      {!disabled && (
      <div className="flex flex-col my-4 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button className="flex-1" variant="secondary" onClick={() => onBack("name", "")}>
              Cancelar
          </Button>
          <Button className="flex-1" type="submit" variant="primary">
              Guardar Cambios
          </Button>
      </div>
      )}
    </>
  );
}