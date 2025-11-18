"use client";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassFormData } from "@/lib/validation/class";

interface Branch {
  branch_id: string;
  name: string;
}

interface Service {
  service_id: string;
  name: string;
  description: string;
  duration_minutes: number;
}

interface Instructor {
  instructor_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ClassFormProps {
  formData: ClassFormData;
  errors: Partial<Record<keyof ClassFormData, string>>;
  onChange: (field: string, value: string) => void;
  onBlur: (field: string) => void;
  branches?: Branch[];
  services?: Service[];
  instructors?: Instructor[];
}

const capacities = [
  { id: "10", name: "10 personas" },
  { id: "15", name: "15 personas" },
  { id: "20", name: "20 personas" },
  { id: "25", name: "25 personas" },
  { id: "30", name: "30 personas" },
];

export default function ClassForm({
  formData,
  errors,
  onChange,
  onBlur,
  branches = [],
  services = [],
  instructors = [],
}: ClassFormProps) {
  const handleServiceChange = (value: string) => {
    onChange("service_id", value);
  };

  const handleBranchChange = (value: string) => {
    onChange("branch_id", value);
  };

  const handleInstructorChange = (value: string) => {
    onChange("instructor_id", value);
  };

  const handleCapacityChange = (value: string) => {
    onChange("max_capacity", value);
  };

  const handleDateChange = (field: string, value: string) => {
    onChange(field, value);
  };

  const handleTimeChange = (field: string, value: string) => {
    onChange(field, value);
  };

  const handleInputBlur = (field: string) => {
    onBlur(field);
  };

  // Usar branches dinámicas o estáticas como fallback
  const branchOptions =
    branches.length > 0
      ? branches
      : [
          { branch_id: "branch1", name: "Sucursal Norte" },
          { branch_id: "branch2", name: "Sucursal Sur" },
          { branch_id: "branch3", name: "Sucursal Centro" },
        ];

  // Usar servicios dinámicos o estáticos como fallback
  const serviceOptions =
    services.length > 0
      ? services
      : [
          {
            service_id: "service1",
            name: "Yoga",
            description: "Clase de yoga",
            duration_minutes: 60,
          },
          {
            service_id: "service2",
            name: "Pilates",
            description: "Clase de pilates",
            duration_minutes: 60,
          },
          {
            service_id: "service3",
            name: "CrossFit",
            description: "Clase de crossfit",
            duration_minutes: 60,
          },
          {
            service_id: "service4",
            name: "Spinning",
            description: "Clase de spinning",
            duration_minutes: 45,
          },
        ];

  // Usar instructores dinámicos o estáticos como fallback
  const instructorOptions =
    instructors.length > 0
      ? instructors
      : [
          {
            instructor_id: "instructor1",
            first_name: "Juan",
            last_name: "Pérez",
            email: "juan@email.com",
          },
          {
            instructor_id: "instructor2",
            first_name: "María",
            last_name: "García",
            email: "maria@email.com",
          },
          {
            instructor_id: "instructor3",
            first_name: "Carlos",
            last_name: "López",
            email: "carlos@email.com",
          },
        ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg font-semibold text-gray-900 mb-4">
          Información Básica de la Clase
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="service_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Servicio
            </label>
            <Select
              onValueChange={handleServiceChange}
              value={formData.service_id}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((service) => (
                  <SelectItem
                    key={service.service_id}
                    value={service.service_id}
                  >
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_id && (
              <p className="mt-1 text-sm text-red-600">{errors.service_id}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="instructor_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Instructor Asignado
            </label>
            <Select
              onValueChange={handleInstructorChange}
              value={formData.instructor_id}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructorOptions.map((instructor) => (
                  <SelectItem
                    key={instructor.instructor_id}
                    value={instructor.instructor_id}
                  >
                    {`${instructor.first_name} ${instructor.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.instructor_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.instructor_id}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="branch_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sucursal
            </label>
            <Select
              onValueChange={handleBranchChange}
              value={formData.branch_id}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((branch) => (
                  <SelectItem key={branch.branch_id} value={branch.branch_id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branch_id && (
              <p className="mt-1 text-sm text-red-600">{errors.branch_id}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="max_capacity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Capacidad Máxima
            </label>
            <Select
              onValueChange={handleCapacityChange}
              value={formData.max_capacity}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar capacidad" />
              </SelectTrigger>
              <SelectContent>
                {capacities.map((capacity) => (
                  <SelectItem key={capacity.id} value={capacity.id}>
                    {capacity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.max_capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.max_capacity}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <p className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de Horario
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora de Inicio
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    handleDateChange("start_date", e.target.value)
                  }
                  onBlur={() => handleInputBlur("start_date")}
                  className="w-full"
                  placeholder="Seleccionar fecha"
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.start_date}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    handleTimeChange("start_time", e.target.value)
                  }
                  onBlur={() => handleInputBlur("start_time")}
                  className="w-full"
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.start_time}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora de Fin
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleDateChange("end_date", e.target.value)}
                  onBlur={() => handleInputBlur("end_date")}
                  className="w-full"
                  placeholder="Seleccionar fecha"
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                )}
              </div>
              <div>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleTimeChange("end_time", e.target.value)}
                  onBlur={() => handleInputBlur("end_time")}
                  className="w-full"
                />
                {errors.end_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
