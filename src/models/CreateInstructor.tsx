"use client";
import { Instructor } from "@/models/instructor";
import { PageHeader } from "@/components/ui/PageHeader";
import InstructorForm from "./InstructorForm";
import { useState } from "react";

interface CreateInstructorProps {
    onBack: () => void;
}

export default function CreateInstructor({ onBack }: CreateInstructorProps) {

    const [formData, setFormData] = useState<Instructor>({
        id: "",
        name: "",
        lastname: "",
        user_id: "",
        specialty: "",
        biography: "",
        email: "",
        phone: "",
        document: "",
        date: "",
        gender: "",
        status:"active",
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
                <PageHeader title="CREAR INSTRUCTOR"></PageHeader>
                <p className="text-sm text-muted-foreground">
                    Ingrese la información de un Instructor
                </p>

                <InstructorForm formData={formData} onChange={handleChange} onBack={onBack} />
            </form>
        </div>
    );
}
