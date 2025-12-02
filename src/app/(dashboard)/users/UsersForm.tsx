"use client";
import { Users } from "@/models/users";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/phone-input";

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
  const roles = [
    {
      id: "super_admin",
      title: "Super Administrador",
      description: [
        "Acceso total al sistema con permisos de configuración",
        "Gestión de todas las sedes",
        "Configuración avanzada del sistema",
      ],
    },
    {
      id: "branch_admin",
      title: "Administrador de sede",
      description: [
        "Gestión de una sede específica",
        "Control de personal y operaciones locales",
        "Acceso limitado a configuraciones generales",
      ],
    },
    {
      id: "accountant",
      title: "Contador",
      description: [
        "Gestión financiera y contable del sistema",
        "Control de pagos y facturación",
        "Acceso a reportes contables",
      ],
    },
    {
      id: "data_analyst",
      title: "Analista de datos",
      description: [
        "Acceso a dashboards y reportes",
        "Análisis de métricas y KPIs",
        "Generación de reportes estratégicos",
      ],
    },
    {
      id: "instructor",
      title: "Instructor",
      description: [
        "Gestión de horarios de entrenamiento",
        "Control de rutinas y asistencia",
        "Seguimiento de progreso de miembros",
      ],
    },
    {
      id: "recepcionist",
      title: "Recepcionista",
      description: [
        "Gestión de miembros y asistencia",
        "Atención al cliente en sede",
        "Acceso limitado a funciones administrativas",
      ],
    },
    {
      id: "client",
      title: "Cliente",
      description: [
        "Acceso a su perfil personal",
        "Consulta de rutinas y horarios",
        "Gestión de pagos y asistencia",
      ],
    },
  ];

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
              Apellido*
            </label>
            <Input
              id="apellido"
              name="apellido"
              placeholder="Apellido"
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
            Número de teléfono*
          </label>
          <PhoneInput
            id="telefono"
            value={formData.phone}
            defaultCountry="VE"
            onChange={(value) => onChange("phone", value)}
            disabled={disabled}
          />
        </div>
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
            Fecha de Nacimiento*
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
            Género*
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="masculino"
              checked={formData.gender === "masculino" || formData.gender === "male"}
              onChange={() => onChange("gender", "male")}
              className="form-radio h-4 w-4 text-primary"
              disabled={disabled}
            />
            <span className="ml-2">Masculino</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="femenino"
              checked={formData.gender === "femenino" || formData.gender === "female"}
              onChange={() => onChange("gender", "female")}
              className="form-radio h-4 w-4 text-primary"
              disabled={disabled}
            />
            <span className="ml-2">Femenino</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="genero"
              value="prefer-not-to-say"
              checked={formData.gender === "prefer-not-to-say"}
              onChange={() => onChange("gender", "prefer-not-to-say")}
              className="form-radio h-4 w-4 text-primary"
              disabled={disabled}
            />
            <span className="ml-2">Prefiero no especificarlo</span>
          </label>
        </div>
      </div>

      {/* Sección de Rol - Ahora visible tanto en creación como edición */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:text-base text-left">
          Rol del Usuario*
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => !disabled && onChange("rol", role.id)}
              className={`cursor-pointer border rounded-lg p-4 shadow-sm transition-all ${formData.rol === role.id
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {role.title}
                {formData.rol === role.id && (
                  <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                    Seleccionado
                  </span>
                )}
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {role.description.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {!edit && (
        <div className="my-4 cursor-pointer border rounded-lg p-4 shadow-sm transition-all border-primary bg-primary/10">
          <span className="block text-sm font-medium text-gray-700 mb-2 sm:text-base text-left">
            Próximos Pasos
          </span>
          <ul className="list-disc pl-8 text-sm text-gray-600 space-y-1">
            <li>
              Se enviará un email de verificación a {" "}
              <strong>{formData.email}</strong>
            </li>
            <li>El usuario debe verificar su email para activar la cuenta</li>
            <li>Después podrá establecer su contraseña inicial</li>
            <li>
              El estado será <em>"Pendiente"</em> hasta completar la
              verificación
            </li>
          </ul>
        </div>
      )}
    </>
  );
}