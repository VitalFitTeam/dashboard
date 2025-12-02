"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import UsersForm from "../../UsersForm";
import { useAuth } from "@/context/AuthContext";
import { Users } from "@/models/users";
import { api } from "@/lib/sdk-config";
import { GetUserResponse, UpdateUserStaffRequest } from "@vitalfit/sdk";

type UserRole = Users["rol"];

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const normalizePhone = (phone: string) => phone.replace(/\s+/g, "");

    // Función para normalizar el género según lo que espera tu UI
    const normalizeGender = (gender: string): string => {
        const genderMap: Record<string, string> = {
            "M": "masculino",
            "F": "femenino",
            "O": "prefiero no especificarlo",
            "masculino": "masculino",
            "femenino": "femenino",
            "prefiero no especificarlo": "prefiero no especificarlo",
            "male": "masculino",
            "female": "femenino",
            "other": "prefiero no especificarlo",
        };

        return genderMap[gender] || "prefiero no especificarlo";
    };

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

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const mapRoleNameToValidRole = (roleName: string): UserRole => {
        const roleMapping: Record<string, UserRole> = {
            "super_admin": "super_admin",
            "branch_admin": "branch_admin",
            "accountant": "accountant",
            "data_analyst": "data_analyst",
            "instructor": "instructor",
            "recepcionist": "recepcionist",
            "client": "client",
            "Super Administrador": "super_admin",
            "Administrador de sede": "branch_admin",
            "Contador": "accountant",
            "Analista de datos": "data_analyst",
            "Instructor": "instructor",
            "Recepcionista": "recepcionist",
            "Cliente": "client",
        };

        return roleMapping[roleName] || "client";
    };

    useEffect(() => {
        const loadUser = async () => {
            if (!id || !token) {
                if (!token) {
                    setError("No estás autenticado");
                    setIsLoading(false);
                    return;
                }
                setError("No se pudo cargar el usuario");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const response = await api.user.GetUserByID(id, token);
                const userData = response.data as GetUserResponse;

                if (userData) {
                    const roleName = userData.role_name || "";
                    const validRole = mapRoleNameToValidRole(roleName);
                    const normalizedGender = normalizeGender(userData.gender || "");

                    setFormData({
                        id: userData.user_id || "",
                        name: userData.first_name || "",
                        lastname: userData.last_name || "",
                        email: userData.email || "",
                        phone: normalizePhone(userData.phone || ""),
                        document: userData.identity_document || "",
                        date: userData.birth_date || "",
                        gender: normalizedGender,
                        rol: validRole,
                        status: "active",
                        uacceso: "",
                    });
                } else {
                    setError("No se encontró el usuario solicitado");
                }
            } catch (err) {
                console.error("Error cargando usuario:", err);
                setError("No se pudo cargar la información del usuario.");
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [id, token]);

    const handleChange = (field: keyof Users, value: string) => {
        if (field === "rol") {
            const validRoles: UserRole[] = ["super_admin", "branch_admin", "accountant", "data_analyst", "instructor", "recepcionist", "client"];
            const isValidRole = validRoles.includes(value as UserRole);

            setFormData((prev) => ({
                ...prev,
                [field]: isValidRole ? value as UserRole : "client"
            }));
        } else if (field === "status") {
            // Validar que status sea solo "active" o "inactive"
            const isValidStatus = value === "active" || value === "inactive";
            setFormData((prev) => ({
                ...prev,
                [field]: isValidStatus ? value as "active" | "inactive" : "active"
            }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError("No estás autenticado");
            return;
        }

        if (!id) {
            setError("ID de usuario no válido");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updateData: UpdateUserStaffRequest = {
                first_name: formData.name.trim() || undefined,
                last_name: formData.lastname.trim() || undefined,
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                identity_document: formData.document.trim() || undefined,
                birth_date: formData.date || undefined,
                gender: formData.gender || undefined,
                role_name: formData.rol || undefined,
            };

            console.log("Enviando datos de actualización:", updateData);

            // Llamar al API para actualizar el usuario
            const response = await api.user.updateUserStaff(id, updateData, token);

            setSuccess("Usuario actualizado correctamente");

            setTimeout(() => {
                router.replace(`/users/${id}`);
            }, 1500);


        } catch (err: any) {
            console.error("Error al actualizar usuario:", err);
            setError(err.message || "No se pudo actualizar el usuario. Por favor, inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <div>Cargando usuario...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <PageHeader
                    title="MODIFICAR USUARIO"
                    subtitle={`Editar información del usuario: ${formData.name} ${formData.lastname}`}
                />

                <UsersForm
                    formData={formData}
                    onChange={handleChange}
                    edit={true}
                />

                <div className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.replace(`/users/${id}`)}
                        className="flex-1"
                        disabled={isSaving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSaving}
                        className="flex-1"
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center">
                                Guardando...
                            </span>
                        ) : "Guardar Cambios"}
                    </Button>
                </div>
            </form>
        </div>
    );
}