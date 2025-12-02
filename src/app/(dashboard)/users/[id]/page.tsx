"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { Users, roleLabels } from "@/models/users";
import { api } from "@/lib/sdk-config";
import { GetUserResponse } from "@vitalfit/sdk";
import {
    EyeIcon,
    PencilIcon,
    ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

// Tipo para los valores válidos de rol
type UserRole = Users["rol"];

export default function ViewUserPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const [user, setUser] = useState<Users | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const normalizePhone = (phone: string) => phone.replace(/\s+/g, "");

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

                    const mappedUser: Users = {
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
                    };
                    setUser(mappedUser);
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

    const handleEdit = () => {
        router.replace(`/users/${id}/edit`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="flex flex-col items-center">
                    <div>Cargando usuario...</div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="text-red-500 text-center p-4">{error || "Usuario no encontrado"}</div>
                <div className="flex justify-center">
                    <Button variant="primary" onClick={() => router.replace("/users")}>
                        Volver a la lista
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
            <PageHeader
                title="DETALLES DE USUARIO"
                subtitle={`Información completa del usuario: ${user.name} ${user.lastname}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Información Personal
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                            <strong>ID Usuario:</strong> {user.id}
                        </div>
                        <div>
                            <strong>Estado:</strong>{" "}
                            <span className="px-2 py-1 rounded-full border border-green-100 text-green-700 text-xs">
                                {user.status === "active" ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                        <div>
                            <strong>Nombre:</strong> {user.name}
                        </div>
                        <div>
                            <strong>Apellido:</strong> {user.lastname}
                        </div>
                        <div>
                            <strong>Rol Asignado:</strong>
                            <span className="px-2 py-1 rounded-full border border-orange-100 text-orange-700 text-xs">
                                {roleLabels[user.rol] ?? user.rol}
                            </span>
                        </div>
                        <div>
                            <strong>Correo electrónico:</strong> {user.email}
                        </div>
                        <div>
                            <strong>Teléfono:</strong> {user.phone}
                        </div>
                        <div>
                            <strong>Documento:</strong> {user.document}
                        </div>
                        <div>
                            <strong>Género:</strong> {user.gender}
                        </div>
                        <div>
                            <strong>Fecha de Nacimiento:</strong> {user.date}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Acciones Rápidas
                    </h2>
                    <div className="border rounded-lg p-4 space-y-3">
                        <Button variant="outline" className="w-full">
                            <EyeIcon className="h-4 w-4" />
                            Ver Registros de Actividades
                        </Button>
                        <Button variant="outline" className="w-full">
                            <ComputerDesktopIcon className="h-4 w-4" />
                            Ver Sesiones
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleEdit}>
                            <PencilIcon className="h-4 w-4" />
                            Editar Usuario
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Información de sesiones
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 p-4 rounded shadow">
                        <div className="text-sm text-gray-500">Sesiones Activas</div>
                        <div className="text-2xl font-bold text-gray-800">2</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded shadow">
                        <div className="text-sm text-gray-500">Total inicio de sesión</div>
                        <div className="text-2xl font-bold text-gray-800">247</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded shadow">
                        <div className="text-sm text-gray-500">Promedio Diario</div>
                        <div className="text-2xl font-bold text-gray-800">3.5</div>
                    </div>
                </div>
            </div>
        </div>
    );
}