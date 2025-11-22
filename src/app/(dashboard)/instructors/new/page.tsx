"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import InstructorForm from "../InstructorForm";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { InstructorDataList, UserGender } from "@vitalfit/sdk";
import {
  validateInstructor,
  validateInstructorField,
  InstructorFormData,
} from "@/lib/validation/instructorSchema";
import { ZodError } from "zod";

interface CreateInstructorProps {
  onBack: () => void;
}

export default function CreateInstructor({ onBack }: CreateInstructorProps) {
  const router = useRouter();
  const { token } = useAuth();

  const [formData, setFormData] = useState<InstructorDataList>({
    instructor_id: "",
    user_id: "",
    first_name: "",
    last_name: "",
    email: "",
    identity_document: "",
    phone: "",
    birth_date: "",
    gender: "",
    biography: "",
    profile_picture_url: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof InstructorFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showServerError, setShowServerError] = useState({
    visible: false,
    message: "",
  });
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [servicesOptions, setServicesOptions] = useState<
    Array<{ service_id: string; name: string }>
  >([]);

  const handleChange = (field: keyof InstructorDataList, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field as keyof InstructorFormData]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof InstructorDataList, value: string) => {
    // Validación en tiempo real al perder el foco
    const result = validateInstructorField(field, value);
    if (!result.success && result.error) {
      setErrors((prev) => ({ ...prev, [field]: result.error }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.products.getServices(token, {
          page: 1,
          limit: 1000,
        });
        const services = (res?.data ?? []) as Array<any>;
        if (!mounted) {
          return;
        }
        setServicesOptions(
          services.map((s) => ({
            service_id: s.service_id ?? s.serviceId ?? s.id ?? String(s),
            name: s.name ?? s.service_name ?? "",
          })),
        );
      } catch (err) {
        console.warn(
          "No se pudieron cargar servicios para especialidades:",
          err,
        );
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowServerError({ visible: false, message: "" });
    setShowConnectionError(false);

    // Validar token usando el contexto
    if (!token) {
      setShowServerError({
        visible: true,
        message: "No estás autenticado. Por favor, inicia sesión nuevamente.",
      });
      return;
    }

    // Validar formulario completo con Zod
    const validationResult = validateInstructor(formData);
    if (!validationResult.success) {
      const newErrors: Partial<Record<keyof InstructorFormData, string>> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path.length > 0 && typeof issue.path[0] === "string") {
          const field = issue.path[0] as keyof InstructorFormData;
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Si pasa la validación, limpiar errores
    setErrors({});

    const mapGenderToEnum = (gender: string): UserGender => {
      switch (gender) {
        case "male":
          return UserGender.male;
        case "female":
          return UserGender.female;
        case "prefer-not-to-say":
          return UserGender.preferNotToSay;
        default:
          return UserGender.preferNotToSay;
      }
    };

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      identity_document: formData.identity_document,
      phone: formData.phone,
      birth_date: formData.birth_date,
      gender: mapGenderToEnum(formData.gender),
      biography: formData.biography || "",
      profile_picture_url: formData.profile_picture_url || "",
    };

    setIsLoading(true);
    try {
      await api.instructor.createInstructor(payload, token);

      try {
        const searchKey =
          formData.email || formData.identity_document || formData.first_name;
        const list = await api.instructor.getInstructors(
          { limit: 10, page: 1, search: searchKey },
          token,
        );
        const created = (list.data || []).find(
          (i: any) =>
            i.email === formData.email ||
            i.identity_document === formData.identity_document,
        );
        if (created) {
          const specialtyVal = (formData as any).specialties;
          if (specialtyVal) {
            const specialtiesArray = Array.isArray(specialtyVal)
              ? specialtyVal
              : [specialtyVal];
            const idsArray = specialtiesArray
              .map((s: any) =>
                typeof s === "string"
                  ? s
                  : (s?.specialty_id ?? s?.service_id ?? String(s)),
              )
              .filter(Boolean);
            try {
              await api.instructor.addSpecialty(
                created.instructor_id,
                idsArray as any,
                token,
              );
            } catch (err) {
              console.error(
                "No se pudo agregar especialidad automáticamente:",
                err,
              );
            }
          }
        }
      } catch (err) {
        console.warn("No se pudo buscar instructor recién creado:", err);
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/instructors");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error al crear instructor:", err);
      if (err && typeof err === "object" && "messages" in err) {
        const error = err as { messages: string[]; error?: string };
        if (error.messages[0] === "conflict") {
          setShowServerError({
            visible: true,
            message:
              "Ya existe un instructor registrado con estas credenciales. Verifica los datos ingresados.",
          });
        } else {
          setShowServerError({
            visible: true,
            message: error.error || "Error desconocido al crear instructor",
          });
        }
      } else {
        setShowServerError({
          visible: true,
          message: "Error desconocido al crear instructor",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title="Crear Instructor"
          subtitle="Complete la información del nuevo instructor"
        />

        <InstructorForm
          formData={formData}
          onChange={handleChange}
          onFieldBlur={handleFieldBlur}
          errors={errors}
          mode="edit"
          services={servicesOptions}
        />

        <Button
          type="button"
          variant="primary"
          disabled={isLoading}
          className="flex-1 relative w-full"
          style={{ position: "relative" }}
          onClick={() => {
            handleSubmit({ preventDefault: () => {} } as React.FormEvent);
          }}
        >
          {isLoading ? "Creando..." : "Crear"}
        </Button>
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="¡Instructor creado exitosamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showConnectionError && (
        <Notification
          variant="destructive"
          title="Error de conexión"
          description="No se pudo conectar con el servidor. Intenta más tarde."
          onClose={() => setShowConnectionError(false)}
        />
      )}
      {showServerError.visible && (
        <Notification
          variant="destructive"
          title="Error al crear instructor"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
