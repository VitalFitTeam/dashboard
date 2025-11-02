"use client";

import type { Instructor } from "@/models/instructor";
import { PageHeader } from "@/components/ui/PageHeader";
import InstructorForm from "./InstructorForm";
import { useState } from "react";

interface EditInstructorProps {
  instructor: Instructor;
  onBack: () => void;
}

export default function EditInstructor({ instructor, onBack }: EditInstructorProps) {
    const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, "");

    const [formData, setFormData] = useState<Instructor>({
        id: instructor.id,
        name: instructor.name,
        lastname: instructor.lastname,
        user_id: instructor.user_id,
        specialty: instructor.specialty,
        biography: instructor.biography,
        email: instructor.email,
        phone: normalizePhone(instructor.phone),
        document: instructor.document,
        date: instructor.date,
        gender:instructor.gender,
        status:instructor.status,
    });

    const handleChange = (field: keyof Instructor, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.warn("enviar formulario");
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
            <form onSubmit={handleSubmit} className="space-y-2">
            <PageHeader title="MODIFICAR INSTRUCTOR"></PageHeader>
            <p className="text-sm text-muted-foreground">
                Modifica la información de un Instructor
            </p>

            <InstructorForm formData={formData} onBack={onBack} onChange={handleChange} />
            
            </form>
        </div>
    );
}
