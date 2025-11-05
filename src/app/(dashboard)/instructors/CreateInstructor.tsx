"use client";
import { Instructor } from "@/models/instructor";
import { PageHeader } from "@/components/ui/PageHeader";
import InstructorForm from "./InstructorForm";
import { Notification } from "@/components/ui/Notification";
import { useState } from "react";
import { api } from "@/lib/sdk-config";

interface CreateInstructorProps {
  onBack: () => void;
}

export default function CreateInstructor({ onBack }: CreateInstructorProps) {
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const [formData, setFormData] = useState<Instructor>({
    id: "",
    instructor_id: "",
    user_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    identity_document: "",
    biography: "",
    profile_picture_url: "",
  });

  const handleChange = (field: keyof Instructor, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    const payload: Instructor = {
      biography: formData.biography,
      birth_date: formData.birth_date,
      email: formData.email,
      first_name: formData.first_name,
      gender: formData.gender,
      identity_document: formData.identity_document,
      last_name: formData.last_name,
      phone: formData.phone,
      profile_picture_url: formData.profile_picture_url,
      user_id: formData.user_id,
      instructor_id: "",
      id: "",
    };

    if (!token) {
      console.error("Token no disponible");
      return;
    }

    try {
      const response = await api.instructor.createInstructor(payload, token);
      console.log("Instructor creado:", response);
      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
        onBack();
      }, 4000);
    } catch (err) {
      console.error("Error creando instructor:", err);
      setShowErrorNotification(true);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="CREAR INSTRUCTOR"></PageHeader>
        <p className="text-sm text-muted-foreground">
          Ingrese la información de un Instructor
        </p>
        {showSuccessNotification && (
          <Notification
            variant="success"
            title="Registro exitoso"
            description="El instructor ha sido creado correctamente."
            onClose={() => setShowSuccessNotification(false)}
          />
        )}

        {showErrorNotification && (
          <Notification
            variant="destructive"
            title="Error al registrar"
            description="No se pudo crear el instructor. Intenta nuevamente."
            onClose={() => setShowErrorNotification(false)}
          />
        )}

        <InstructorForm
          formData={formData}
          onChange={handleChange}
          onBack={onBack}
        />
      </form>
    </div>
  );
}
