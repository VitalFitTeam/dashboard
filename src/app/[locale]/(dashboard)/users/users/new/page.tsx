"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import UsersForm from "../UsersForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Users } from "@/models/users";
import { api } from "@/lib/sdk-config";
import { SignUpRequest, UserGender } from "@vitalfit/sdk";

export default function CreateUserPage() {
    const router = useRouter();
    const { token } = useAuth();

    const [formData, setFormData] = useState<Users>({
        id: "",
        name: "",
        lastname: "",
        email: "",
        phone: "",
        document: "",
        date: "",
        gender: "",
        rol: "client",
        status: "active",
        uacceso: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (field: keyof Users, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Si se cambia el documento, actualizar la contraseña automáticamente
        if (field === "document" && value.trim()) {
            // La contraseña por defecto será el documento de identidad
            // Podrías agregar aquí lógica adicional si necesitas
        }
    };

    const normalizeGenderForAPI = (gender: string): UserGender | null => {
        const genderMap: Record<string, UserGender> = {
            "masculino": UserGender.male,
            "femenino": UserGender.female,
            "prefiero no especificarlo": UserGender.preferNotToSay,
            "M": UserGender.male,
            "F": UserGender.female,
            "O": UserGender.preferNotToSay,
            "male": UserGender.male,
            "female": UserGender.female,
            "prefer-not-to-say": UserGender.preferNotToSay,
        };

        return genderMap[gender] || null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validaciones básicas
        if (!formData.name.trim()) {
            setError("El nombre es requerido");
            return;
        }

        if (!formData.lastname.trim()) {
            setError("El apellido es requerido");
            return;
        }

        if (!formData.email.trim()) {
            setError("El correo electrónico es requerido");
            return;
        }

        if (!formData.document.trim()) {
            setError("El documento de identidad es requerido");
            return;
        }

        if (!formData.date) {
            setError("La fecha de nacimiento es requerida");
            return;
        }

        // Validar token
        if (!token) {
            setError("No estás autenticado");
            return;
        }

        setIsLoading(true);

        try {
            // La contraseña por defecto será el documento de identidad
            const defaultPassword = formData.document.trim();

            const signUpData: SignUpRequest = {
                first_name: formData.name.trim(),
                last_name: formData.lastname.trim(),
                email: formData.email.trim(),
                password: defaultPassword,
                identity_document: formData.document.trim(),
                phone: formData.phone.trim() || null,
                birth_date: formData.date,
                gender: normalizeGenderForAPI(formData.gender),
                profile_picture_url: null,
                role_name: formData.rol || null,
            };

            console.log("Datos de registro:", signUpData);

            const response = await api.auth.signUpStaff(signUpData, token);

            setSuccess("Usuario creado exitosamente. Se ha enviado un correo de verificación.");

            setTimeout(() => {
                router.replace("/users");
            }, 2000);

        } catch (err: any) {
            console.error("Error al crear usuario:", err);
            setError(err.message || "No se pudo crear el usuario. Por favor, inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
                <PageHeader
                    title="CREAR NUEVO USUARIO"
                    subtitle="Complete la información del nuevo usuario"
                />

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}

                <UsersForm formData={formData} onChange={handleChange} edit={false} />

                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.replace("/users")}
                        className="flex-1"
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? "Creando..." : "Crear Usuario"}
                    </Button>
                </div>
            </form>
        </div>
    );
}