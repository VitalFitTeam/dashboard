"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import FiscalForm from "../../FiscalForm";
import { mockFiscalDocuments, FiscalDocument } from "../../data";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

export default function EditFiscalDocumentPage() {
    const params = useParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [document, setDocument] = useState<FiscalDocument | null>(null);

    useEffect(() => {
        const foundDocument = mockFiscalDocuments.find(d => d.document_id === params.id);
        if (foundDocument) {
            setDocument(foundDocument);
        }
    }, [params.id]);

    const handleChange = (field: string, value: string) => {
        if (document) {
            setDocument(prev => prev ? { ...prev, [field]: value } : null);
        }
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async () => {
        if (!document) { return; }

        const newErrors: Record<string, string> = {};

        if (!document.name.trim()) {
            newErrors.name = "El nombre es requerido";
        }

        if (!document.prefix.trim()) {
            newErrors.prefix = "El prefijo es requerido";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            console.warn("Actualizando documento:", document);
            router.push(`/catalog/fiscalDocument/${params.id}`);
        } catch (error) {
            console.error("Error actualizando documento:", error);
            setErrors({ submit: "Error al actualizar el documento" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!document) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <div className="text-center p-10">Documento no encontrado</div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader title="MODIFICAR DOCUMENTO FISCAL" />

            {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errors.submit}
                </div>
            )}

            <form className="bg-white rounded-lg border p-6" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                <FiscalForm
                    document={document}
                    onChange={handleChange}
                    mode="edit"
                    errors={errors}
                />
                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
            </form>
        </div>
    );
}