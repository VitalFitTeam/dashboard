"use client";

import type { Instructor } from "@/models/instructor";
import { PageHeader } from "@/components/ui/PageHeader";
import InstructorForm from "./InstructorForm";
import { Notification } from "@/components/ui/Notification";
import { api } from "@/lib/sdk-config";
import { useState } from "react";

interface EditInstructorProps {
  instructor: Instructor;
  onBack: () => void;
}

export default function EditInstructor({
  instructor,
  onBack,
}: EditInstructorProps) {
  const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, "");

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const [formData, setFormData] = useState<Instructor>({
    id: instructor.id,
    instructor_id: instructor.instructor_id,
    user_id: instructor.user_id,
    first_name: instructor.first_name,
    last_name: instructor.last_name,
    email: instructor.email,
    phone: normalizePhone(instructor.phone),
    birth_date: instructor.birth_date?.slice(0, 10) ?? "", // formato YYYY-MM-DD
    gender: instructor.gender ?? "prefer-not-to-say", // normalizado para los radio buttons
    identity_document: instructor.identity_document,
    biography: instructor.biography ?? "",
    profile_picture_url: instructor.profile_picture_url,
  });

  const handleChange = (field: keyof Instructor, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email) {
      console.error("Campos obligatorios faltantes");
      setShowErrorNotification(true);
      return;
    }
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
      instructor_id: formData.instructor_id,
      id: formData.id,
    };

    if (!token) {
      console.error("Token no disponible");
      return;
    }

    try {
      const response = await api.instructor.updateInstructor(
        formData.instructor_id,
        payload,
        token,
      );
      console.log("Instructor actualizado:", response);
      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
        onBack(); // este debe actualizar la tabla en el padre
      }, 4000);
    } catch (err) {
      console.error("Error actualizando instructor:", err);
      setShowErrorNotification(true);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="MODIFICAR INSTRUCTOR"></PageHeader>
        <p className="text-sm text-muted-foreground">
          Modifica la información de un Instructor
        </p>

        {showSuccessNotification && (
          <Notification
            variant="success"
            title="Modificación exitosa"
            description="El instructor ha sido Modificado."
            onClose={() => setShowSuccessNotification(false)}
          />
        )}

        {showErrorNotification && (
          <Notification
            variant="destructive"
            title="Error al Modificar"
            description="No se pudo Modificar el instructor. Intenta nuevamente."
            onClose={() => setShowErrorNotification(false)}
          />
        )}

        <InstructorForm
          formData={formData}
          onBack={onBack}
          onChange={handleChange}
        />
      </form>
    </div>
  );
}
