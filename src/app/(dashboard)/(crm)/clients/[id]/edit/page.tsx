"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import ClientsForm, { ClientData } from "../../ClientsForm";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { GetUserResponse, UpdateUserStaffRequest } from "@vitalfit/sdk";
import { APIError, isAPIError } from "@vitalfit/sdk";
import { toast } from "sonner";

function formatPhoneNumber(phone: string): string {
    if (!phone) { return ""; }

    if (phone.startsWith("+") && /^\+[0-9]+$/.test(phone)) {
        return phone;
    }

    let cleaned = phone.replace(/[-\s]/g, "");

    if (!cleaned.startsWith("+")) {
        if (cleaned.startsWith("58")) {
            cleaned = "+" + cleaned;
        } else if (cleaned.startsWith("0")) {
            cleaned = "+58" + cleaned.substring(1);
        } else {
            cleaned = "+58" + cleaned;
        }
    }

    return cleaned;
}

function validateClientData(client: ClientData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!client.first_name?.trim()) { errors.push("El nombre es requerido"); }
    if (!client.last_name?.trim()) { errors.push("El apellido es requerido"); }
    if (!client.email?.trim()) { errors.push("El correo electrónico es requerido"); }
    if (!client.identity_document?.trim()) { errors.push("El documento de identidad es requerido"); }
    if (!client.birth_date) { errors.push("La fecha de nacimiento es requerida"); }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (client.email && !emailRegex.test(client.email)) {
        errors.push("El correo electrónico no es válido");
    }

    if (client.birth_date) {
        const birthDate = new Date(client.birth_date);
        const today = new Date();
        if (birthDate > today) {
            errors.push("La fecha de nacimiento no puede ser futura");
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export default function EditClient() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [client, setClient] = useState<ClientData>({
        first_name: "",
        last_name: "",
        email: "",
        birth_date: "",
        gender: "",
        identity_document: "",
        phone: "",
        category: "",
        status: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadClient = async () => {
            if (!params.id || !token) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await api.user.GetUserByID(params.id as string, token);
                const userData: GetUserResponse = response.data;

                const formattedPhone = formatPhoneNumber(userData.phone || "");

                const clientData: ClientData = {
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    email: userData.email || "",
                    birth_date: userData.birth_date ? new Date(userData.birth_date).toISOString().split("T")[0] : "",
                    gender: userData.gender || "",
                    identity_document: userData.identity_document || "",
                    phone: formattedPhone,
                    category: "",
                    status: "active",
                };

                setClient(clientData);

            } catch (error) {
                console.error("Error loading client:", error);
                if (isAPIError(error)) {
                    setError(`Error: ${error.messages.join(", ")}`);
                } else {
                    setError("Error al cargar los datos del cliente");
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadClient();
    }, [params.id, token]);

    const handleSave = async () => {
        if (!token || !params.id) {
            setError("Token o ID de usuario no disponible");
            return;
        }

        const validation = validateClientData(client);
        if (!validation.isValid) {
            setError(`Error de validación: ${validation.errors.join(", ")}`);
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const updateData: UpdateUserStaffRequest = {
                first_name: client.first_name,
                last_name: client.last_name,
                email: client.email,
                birth_date: client.birth_date,
                gender: client.gender,
                identity_document: client.identity_document,
                phone: client.phone,
            };

            Object.keys(updateData).forEach(key => {
                const typedKey = key as keyof UpdateUserStaffRequest;
                if (updateData[typedKey] === undefined || updateData[typedKey] === "") {
                    delete updateData[typedKey];
                }
            });

            await api.user.updateUserStaff(params.id as string, updateData, token);

            toast.success("Cliente actualizado exitosamente");

            setTimeout(() => {
                router.replace("/clients");
            }, 1000);

        } catch (error) {
            console.error("Error updating client:", error);

            let errorMessage = "Error al guardar los cambios del cliente";

            if (isAPIError(error)) {
                errorMessage = `Error: ${error.messages.join(", ")}`;

                if (error.status === 400) {
                    errorMessage = "Datos inválidos. Por favor verifica la información.";
                } else if (error.status === 401) {
                    errorMessage = "Sesión expirada. Por favor inicia sesión nuevamente.";
                    router.push("/login");
                } else if (error.status === 403) {
                    errorMessage = "No tienes permisos para editar este cliente.";
                } else if (error.status === 404) {
                    errorMessage = "Cliente no encontrado.";
                } else if (error.status === 409) {
                    errorMessage = "El correo electrónico ya está en uso.";
                }
            }

            setError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.replace("/clients");
    };

    if (isLoading) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Cargando datos del cliente...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <PageHeader
                    title="ERROR"
                    subtitle="Ocurrió un error al cargar los datos del cliente"
                >
                    <Button variant="outline" onClick={() => router.replace("/clients")}>
                        Volver
                    </Button>
                </PageHeader>
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader
                title="EDITAR CLIENTE"
                subtitle={`Modifica la información del cliente ${client.first_name} ${client.last_name}`}
            >
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <span className="mr-2">Guardando...</span>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        </>
                    ) : (
                        "Guardar Cambios"
                    )}
                </Button>
            </PageHeader>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <ClientsForm
                client={client}
                onChange={(field, value) => {
                    setClient(prev => ({ ...prev, [field]: value }));
                }}
                mode="edit"
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
}