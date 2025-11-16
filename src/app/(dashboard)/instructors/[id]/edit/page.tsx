"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import InstructorForm from "../../InstructorForm";
import { UserGender, InstructorDataList } from "@vitalfit/sdk";
import { Instructor } from "@/models/instructor";
import { useAuth } from "@/context/AuthContext";
import {
  validateInstructor,
  validateInstructorField,
  InstructorFormData,
} from "@/lib/validation/instructorSchema";
import { Notification } from "@/components/ui/Notification";

export default function EditInstructorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [instructor, setInstructor] = useState<InstructorDataList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof InstructorFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showServerError, setShowServerError] = useState({
    visible: false,
    message: "",
  });

  useEffect(() => {
    if (!id || !token) {
      return;
    }

    const loadInstructor = async () => {
      try {
        setLoading(true);
        const response = await api.instructor.getInstructorById(id, token);
        setInstructor(response.data ?? response);
      } catch (err) {
        console.error("Error cargando instructor:", err);
        setError("No se pudo cargar el instructor.");
      } finally {
        setLoading(false);
      }
    };

    loadInstructor();
  }, [id, token]);

  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) {
      return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toISOString().split("T")[0];
  };

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

  const handleChange = (field: keyof InstructorDataList, value: string) => {
    if (instructor) {
      setInstructor((prev) => (prev ? { ...prev, [field]: value } : prev));
      if (errors[field as keyof InstructorFormData]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructor || !token) {
      return;
    }

    setShowServerError({ visible: false, message: "" });

    const validationResult = validateInstructor(instructor);
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

    setErrors({});

    const payload: Instructor = {
      biography: instructor.biography,
      birth_date: formatDateForBackend(instructor.birth_date),
      email: instructor.email,
      first_name: instructor.first_name,
      gender: mapGenderToEnum(instructor.gender),
      identity_document: instructor.identity_document,
      instructor_id: instructor.instructor_id,
      last_name: instructor.last_name,
      phone: instructor.phone,
      profile_picture_url: instructor.profile_picture_url,
    };

    setIsLoading(true);
    try {
      await api.instructor.updateInstructor(
        instructor.instructor_id,
        payload,
        token,
      );
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/instructors");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error al guardar cambios:", err);

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
            message:
              error.error || "Error desconocido al actualizar instructor",
          });
        }
      } else {
        setShowServerError({
          visible: true,
          message: "Error desconocido al actualizar instructor",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (instructor && instructor.birth_date) {
      const formattedDate = formatDateForBackend(instructor.birth_date);
      if (formattedDate !== instructor.birth_date) {
        setInstructor((prev) =>
          prev ? { ...prev, birth_date: formattedDate } : null,
        );
      }
    }
  }, [instructor]);

  if (loading) {
    return <div className="p-6">Cargando Instructor...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  if (!instructor) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PageHeader
          title="Editar Instructor"
          subtitle={`Modifica los datos del Instructor: ${instructor.first_name} ${instructor.last_name}`}
          actionButton={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.push("/instructors")}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          }
        />

        <InstructorForm
          mode="edit"
          formData={instructor}
          onChange={handleChange}
          onFieldBlur={handleFieldBlur}
          errors={errors}
        />
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="¡Instructor actualizado exitosamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showServerError.visible && (
        <Notification
          variant="destructive"
          title="Error al actualizar instructor"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
