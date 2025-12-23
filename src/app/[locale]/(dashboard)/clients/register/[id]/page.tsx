"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, CreditCard, Eye, FileText, Activity, BarChart } from "lucide-react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { GetUserResponse, User, APIError, isAPIError } from "@vitalfit/sdk";

function formatDate(dateString: string): string {
    if (!dateString) { return "N/A"; }
    try {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch {
        return dateString;
    }
}

function formatPhoneForDisplay(phone: string): string {
    if (!phone) { return "N/A"; }

    if (phone.startsWith("+58")) {
        const number = phone.substring(3);
        if (number.length === 10) {
            return `+58 ${number.substring(0, 4)}-${number.substring(4, 7)}-${number.substring(7)}`;
        }
    }

    return phone;
}

export default function ClientDetails() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [client, setClient] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

                const clientData: Partial<User> = {
                    user_id: userData.user_id,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    email: userData.email,
                    birth_date: userData.birth_date,
                    gender: userData.gender,
                    identity_document: userData.identity_document,
                    phone: userData.phone,
                    profile_picture_url: userData.profile_picture_url,
                    role_id: userData.role_id,
                };

                setClient(clientData as User);

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

    const getClientCategory = () => {
        if (client?.ClientProfile?.category) {
            return client.ClientProfile.category;
        }
        if (client?.client_membership) {
            return "Membresía Activa";
        }

        return "Cliente Regular";
    };

    const getScoring = () => {
        if (client?.ClientProfile?.scoring) {
            return client.ClientProfile.scoring.toString();
        }
        return "N/A";
    };

    const getCreatedAt = () => {
        if (client?.created_at) {
            return formatDate(client.created_at);
        }
        return "N/A";
    };

    if (isLoading) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <PageHeader title="CARGANDO..." subtitle="Obteniendo información del cliente" />
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Cargando datos del cliente...</div>
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <PageHeader title="ERROR" subtitle="No se pudo cargar la información del cliente" />
                <Card>
                    <CardContent className="pt-6">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700">{error || "Cliente no encontrado"}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => router.replace("/clients")}
                            >
                                Volver a la lista
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader
                title="DETALLES DEL CLIENTE"
                subtitle={`Información detallada de ${client.first_name} ${client.last_name}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Código Cliente</p>
                            <p className="font-medium">{client.user_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Categoría</p>
                            <Badge className="bg-white border-2 border-yellow-500 text-yellow-500">
                                {getClientCategory()}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Nombre Completo</p>
                            <p className="font-medium">{client.first_name} {client.last_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{formatPhoneForDisplay(client.phone)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Correo electrónico</p>
                            <p className="font-medium">{client.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Documento de identidad</p>
                            <p className="font-medium">{client.identity_document}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                            <p className="font-medium">{formatDate(client.birth_date)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Género</p>
                            <p className="font-medium">{client.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Rol</p>
                            <p className="font-medium">{client.role?.name || client.role_id || "Cliente"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Scoring</p>
                            <p className="font-medium">{getScoring()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fecha de creación</p>
                            <p className="font-medium">{getCreatedAt()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Estado</p>
                            <Badge variant={client.status === "active" ? "success" : "error"}>
                                {client.status === "active" ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => router.push(`/clients/${client.user_id}/edit`)}
                        >
                            <Pencil className="mr-2 h-4 w-4" /> Editar Cliente
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-sm">
                            <CreditCard className="mr-2 h-4 w-4" /> Historial de Membresías y Pago
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-sm">
                            <Eye className="mr-2 h-4 w-4" /> Historial de asistencia
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <FileText className="mr-2 h-4 w-4" /> Ver Quejas y Sugerencias
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Activity className="mr-2 h-4 w-4" /> Ver Actividad y Scoring
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <BarChart className="mr-2 h-4 w-4" /> Ver Análisis RFM
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Sección adicional de membresía si está disponible */}
            {client.client_membership && (
                <Card>
                    <CardHeader>
                        <CardTitle>Información de Membresía</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Tipo de Membresía</p>
                                <p className="font-medium">{client.client_membership.membership_type_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha Inicio</p>
                                <p className="font-medium">{formatDate(client.client_membership.start_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha Fin</p>
                                <p className="font-medium">{formatDate(client.client_membership.end_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Estado</p>
                                <Badge variant={client.client_membership.status === "active" ? "success" : "error"}>
                                    {client.client_membership.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}