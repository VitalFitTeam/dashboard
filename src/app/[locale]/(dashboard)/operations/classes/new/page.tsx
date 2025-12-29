"use client";
import { useState, useEffect } from "react";
import {  useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import ClassForm from "../ClassesForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { ClassFormData, ClassFormSchema } from "@/lib/validation/class";
import { useRouter } from "@/i18n/navigation";

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

export default function NewClassPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [formData, setFormData] = useState<ClassFormData>({
    service_id: "",
    branch_id: "",
    instructor_id: "",
    max_capacity: "",
    start_date: "",
    start_time: "10:30:00",
    end_date: "",
    end_time: "10:30:00",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ClassFormData, string>>
  >({});

  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
  });

  // Extraer parámetros de la URL al montar el componente
  useEffect(() => {
    const date = searchParams.get("date");
    const branch = searchParams.get("branch");

    if (date) {
      setFormData((prev) => ({
        ...prev,
        start_date: date,
        end_date: date,
      }));
    }

    if (branch) {
      setFormData((prev) => ({ ...prev, branch_id: branch }));
    }
  }, [searchParams]);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Cargar sucursales
        const branchesResponse = await api.branch.getBranches(
          { page: 1, limit: 100 },
          token,
        );
        if (branchesResponse.data) {
          setBranches(branchesResponse.data);
        }

        // Cargar servicios
        const servicesResponse = await api.products.getServices(token, {
          page: 1,
          limit: 100,
        });
        if (servicesResponse.data) {
          const servicesData = servicesResponse.data.map((service: any) => ({
            service_id: service.service_id,
            name: service.name,
            description: service.description,
            duration_minutes: service.duration_minutes,
          }));
          setServices(servicesData);
        }

        // Cargar instructores
        const instructorsResponse = await api.instructor.getInstructors(
          { page: 1, limit: 100 },
          token,
        );
        if (instructorsResponse.data) {
          const instructorsData = instructorsResponse.data.map(
            (instructor: any) => ({
              instructor_id: instructor.instructor_id,
              first_name: instructor.first_name,
              last_name: instructor.last_name,
              email: instructor.email,
            }),
          );
          setInstructors(instructorsData);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setNotification({
          isVisible: true,
          description: "Error al cargar los datos necesarios",
          title: "Error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (!token) {
    return null;
  }

  const validateForm = (): boolean => {
    const result = ClassFormSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<Record<keyof ClassFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as keyof ClassFormData] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validateField = (field: keyof ClassFormData): boolean => {
    const fieldSchema = ClassFormSchema.pick({ [field]: true });
    const result = fieldSchema.safeParse({ [field]: formData[field] });

    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || "Error de validación";
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));
      return false;
    }

    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return true;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof ClassFormData]) {
      setErrors((prev) => ({
        ...prev,
        [field as keyof ClassFormData]: undefined,
      }));
    }
  };

  const handleBlur = (field: string) => {
    validateField(field as keyof ClassFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        isVisible: true,
        description: "Por favor corrige los errores en el formulario",
        title: "Error de validación",
      });
      return;
    }

    if (!formData.branch_id) {
      setNotification({
        isVisible: true,
        description: "Por favor selecciona una sucursal",
        title: "Error",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Preparar los datos para la API según CreateClassPayload
      const classData = {
        service_id: formData.service_id,
        instructor_id: formData.instructor_id,
        max_capacity: parseInt(formData.max_capacity),
        starts_at: new Date(
          `${formData.start_date}T${formData.start_time}`,
        ).toISOString(),
        ends_at: new Date(
          `${formData.end_date}T${formData.end_time}`,
        ).toISOString(),
        is_visible: true,
        notes: "",
      };

      // Llamar a la API para crear la clase
      await api.schedule.CreateClass(formData.branch_id, classData, token);

      setNotification({
        isVisible: true,
        description: "Clase creada exitosamente",
        title: "Éxito",
      });

      // Redirigir después de crear exitosamente
      setTimeout(() => {
        router.push("/classes");
      }, 2000);
    } catch (error) {
      console.error("Error creando clase:", error);
      setNotification({
        isVisible: true,
        description: "Error al crear la clase. Intenta nuevamente.",
        title: "Error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
        <div className="text-center p-10">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader
          subtitle="Programa las clases que estarán disponibles"
          title="CREAR CLASE"
        />
        <ClassForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          branches={branches}
          services={services}
          instructors={instructors}
        />
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              router.push("/classes");
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando..." : "Crear Clase"}
          </Button>
        </div>
      </form>

      {notification.isVisible && (
        <Notification
          title={notification.title}
          description={notification.description}
          onClose={hideNotification}
          autoCloseDuration={3000}
          variant={notification.title === "Error" ? "destructive" : "success"}
        />
      )}
    </div>
  );
}
