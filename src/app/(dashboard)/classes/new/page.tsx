"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import ClassForm from "../ClassesForm";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { ClassFormData, ClassFormSchema } from "@/lib/validation/class";

export default function NewClassPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    console.warn("enviar clase");
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

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
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando..." : "Crear Clase"}
        </Button>
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
