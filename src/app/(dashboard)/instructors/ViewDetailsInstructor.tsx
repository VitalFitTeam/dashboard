"use client";
import type { Instructor } from "@/models/instructor";
import { PageHeader } from "@/components/ui/PageHeader";
import InstructorForm from "./InstructorForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ViewDetailsInstructorProps {
  instructor: Instructor;
  onBack: () => void;
}

export default function ViewDetailsInstructor({
  instructor,
  onBack,
}: ViewDetailsInstructorProps) {
  const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, "");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.warn("enviar formulario");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="DETALLES">
          <Button className="flex-1" variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          información del instructor
        </p>

        <InstructorForm
          formData={formData}
          onChange={() => {}}
          onBack={onBack}
          disabled={true}
        />
      </form>
    </div>
  );
}
