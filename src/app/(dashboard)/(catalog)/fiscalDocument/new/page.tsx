"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import FiscalForm from "../FiscalForm";

export default function NewFiscalDocumentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [newDocument, setNewDocument] = useState({
        name: "",
        prefix: "",
        status: "active" as "active" | "inactive"
    });

    const handleChange = (field: string, value: string) => {
        setNewDocument(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        if (!newDocument.name.trim()) {
            newErrors.name = "El nombre es requerido";
        }

        if (!newDocument.prefix.trim()) {
            newErrors.prefix = "El prefijo es requerido";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            console.warn("Creando documento:", newDocument);
            router.push("/catalog/fiscalDocument");
        } catch (error) {
            console.error("Error creando documento:", error);
            setErrors({ submit: "Error al crear el documento" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader title="AGREGAR UN NUEVO DOCUMENTO FISCAL" />

            {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errors.submit}
                </div>
            )}

            <form className="bg-white rounded shadow p-6" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                <FiscalForm
                    document={newDocument}
                    onChange={handleChange}
                    mode="create"
                    errors={errors}
                />
                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creando..." : "Crear"}
                </Button>
            </form>
        </div>
    );
}