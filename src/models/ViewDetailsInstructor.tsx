"use client";
import type { Instructor } from "@/models/instructor";
import { PageHeader } from "@/components/ui/PageHeader";
import InstructorForm from "./InstructorForm";
import {Button} from "@/components/ui/button";
import { useState } from "react";

interface ViewDetailsInstructorProps {
    instructor: Instructor;
    onBack: () => void;
}

export default function ViewDetailsInstructor({ instructor,onBack }: ViewDetailsInstructorProps) {
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
        uacceso:instructor.uacceso
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.warn("enviar formulario");
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
            <form onSubmit={handleSubmit} className="space-y-2">
                <PageHeader title="DETALLES">
                    <Button className="flex-1" variant="primary">
                        Modificar
                    </Button>
                </PageHeader>
                <p className="text-sm text-muted-foreground">
                    información del equipamiento
                </p>

                <InstructorForm onBack={onBack} formData={formData} onChange={() => { }} disabled={true} />
            </form>
        </div>
    );
}
