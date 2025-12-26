// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import ClassForm from "../../ClassesForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { ClassFormData, ClassFormSchema } from "@/lib/validation/class";
import { useRouter } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";

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

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Estados para los parámetros de la URL
  const [branchId, setBranchId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");

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
    const branch = searchParams.get("branch");
    const id = params.id as string;

    if (branch) {
      setBranchId(branch);
      setFormData((prev) => ({ ...prev, branch_id: branch }));
    }

    if (id) {
      setClassId(id);
    }
  }, [params.id, searchParams]);

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

        // Cargar datos de la clase si tenemos branchId y classId
        if (branchId && classId) {
          const classResponse = await api.schedule.GetClassByID(classId, token);

          if (classResponse.data) {
            const classData = classResponse.data;

            // Formatear las fechas y horas para el formulario
            const startDate = new Date(classData.starts_at);
            const endDate = new Date(classData.ends_at);

            setFormData({
              service_id: classData.service_id || "",
              branch_id: classData.branch_id || branchId,
              instructor_id: classData.instructor_id || "",
              max_capacity: classData.max_capacity?.toString() || "",
              start_date: startDate.toISOString().split("T")[0],
              start_time:
                startDate.toTimeString().split(" ")[0].substring(0, 5) + ":00",
              end_date: endDate.toISOString().split("T")[0],
              end_time:
                endDate.toTimeString().split(" ")[0].substring(0, 5) + ":00",
            });
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setNotification({
          isVisible: true,
          description: "Error al cargar los datos",
          title: "Error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token, classId, branchId]);

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

    if (!branchId || !classId) {
      setNotification({
        isVisible: true,
        description: "Falta información necesaria para actualizar la clase",
        title: "Error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData = {
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

      // Llamar a la API para actualizar la clase
      await api.schedule.UpdateClass(classId, updateData, token);
      setNotification({
        isVisible: true,
        description: "Clase actualizada exitosamente",
        title: "Éxito",
      });

      // Redirigir después de actualizar exitosamente
      setTimeout(() => {
        router.push(`/calendar/${classId}?branch=${branchId}`);
      }, 2000);
    } catch (error) {
      console.error("Error actualizando clase:", error);
      setNotification({
        isVisible: true,
        description: "Error al actualizar la clase. Intenta nuevamente.",
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
          subtitle="Modifique la información de la clase"
          title="EDITAR CLASE"
        >
          <Button
            type="button"
            className="bg-transparent text-black border border-gray-100"
            onClick={() => {
              router.push(`/calendar/${classId}?branch=${branchId}`);
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="dafault" disabled={isSubmitting}>
            {isSubmitting ? "Actualizando..." : "Guardar Cambios"}
          </Button>
        </PageHeader>
        <ClassForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          branches={branches}
          services={services}
          instructors={instructors}
        />
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
