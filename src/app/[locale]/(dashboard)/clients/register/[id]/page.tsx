"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, CreditCard, Eye, FileText, Activity, BarChart } from "lucide-react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { GetUserResponse, User, APIError, isAPIError } from "@vitalfit/sdk";

<<<<<<< HEAD
function formatDate(dateString: string, locale: string): string {
=======
function formatDate(dateString: string): string {
>>>>>>> development
    if (!dateString) { return "N/A"; }
    try {
        return new Date(dateString).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
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
    const t = useTranslations("clients.view");
    const tStatus = useTranslations("clients.table.status");
    const tNotifications = useTranslations("clients.notifications");
    const locale = useLocale();
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
                    status: (userData as any).status,
                    ClientProfile: (userData as any).ClientProfile,
                    client_membership: (userData as any).client_membership,
                    created_at: (userData as any).created_at,
                };

                setClient(clientData as User);

            } catch (error) {
                console.error("Error loading client:", error);

                if (isAPIError(error)) {
                    let errorMessage = `Error: ${error.messages.join(", ")}`;
                    if (error.status === 400) {
                        errorMessage = t("invalid_data");
                    } else if (error.status === 401) {
                        errorMessage = tNotifications("session_expired");
                        router.replace("/login");
                    } else if (error.status === 403) {
                        errorMessage = tNotifications("permission_error");
                    } else if (error.status === 404) {
                        errorMessage = t("not_found");
                    }
                    setError(errorMessage);
                } else {
                    setError(t("loading_message"));
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadClient();
    }, [params.id, token, router, t, tNotifications]);

    const getClientCategory = () => {
        if (client?.ClientProfile?.category) {
            return client.ClientProfile.category;
        }
        if (client?.client_membership) {
            return t("category_active_membership");
        }

        return t("category_regular");
    };

    const getScoring = () => {
        if (client?.ClientProfile?.scoring) {
            return client.ClientProfile.scoring.toString();
        }
        return "N/A";
    };

    const getCreatedAt = () => {
        if (client?.created_at) {
            return formatDate(client.created_at, locale);
        }
        return "N/A";
    };

    if (isLoading) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <PageHeader title={t("loading")} subtitle={t("loading_subtitle")} />
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">{t("loading_message")}</div>
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <PageHeader title={t("error_title")} subtitle={t("error_subtitle")} />
                <Card>
                    <CardContent className="pt-6">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-700">{error || t("not_found")}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => router.replace("/clients/register")}
                            >
                                {t("back_button")}
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
                title={t("title")}
                subtitle={t("subtitle", { name: `${client.first_name} ${client.last_name}` })}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t("sections.personal")}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.id")}</p>
                            <p className="font-medium">{client.user_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.category")}</p>
                            <Badge className="bg-white border-2 border-yellow-500 text-yellow-500">
                                {getClientCategory()}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.full_name")}</p>
                            <p className="font-medium">{client.first_name} {client.last_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.phone")}</p>
                            <p className="font-medium">{formatPhoneForDisplay(client.phone)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.email")}</p>
                            <p className="font-medium">{client.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.identity")}</p>
                            <p className="font-medium">{client.identity_document}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.birth_date")}</p>
                            <p className="font-medium">{formatDate(client.birth_date, locale)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.gender")}</p>
                            <p className="font-medium">{client.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.role")}</p>
                            <p className="font-medium">{client.role?.name || client.role_id || "Cliente"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.scoring")}</p>
                            <p className="font-medium">{getScoring()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("fields.created_at")}</p>
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
                        <CardTitle>{t("sections.actions")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => router.push(`/clients/register/${client.user_id}/edit`)}
                        >
                            <Pencil className="mr-2 h-4 w-4" /> {t("actions.edit")}
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-sm">
                            <CreditCard className="mr-2 h-4 w-4" /> {t("actions.membership_history")}
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-sm">
                            <Eye className="mr-2 h-4 w-4" /> {t("actions.attendance_history")}
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <FileText className="mr-2 h-4 w-4" /> {t("actions.complaints")}
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Activity className="mr-2 h-4 w-4" /> {t("actions.activity")}
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <BarChart className="mr-2 h-4 w-4" /> {t("actions.rfm")}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Sección adicional de membresía si está disponible */}
            {client.client_membership && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("sections.membership")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Tipo de Membresía</p>
                                <p className="font-medium">{client.client_membership.membership_type_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha Inicio</p>
                                <p className="font-medium">{formatDate(client.client_membership.start_date, locale)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha Fin</p>
                                <p className="font-medium">{formatDate(client.client_membership.end_date, locale)}</p>
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