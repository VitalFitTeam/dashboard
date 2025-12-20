"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { GetUserResponse, UpdateUserRequest } from "@vitalfit/sdk";
import { isAPIError } from "@vitalfit/sdk";
import { toast } from "sonner";
import ClientsForm, { ClientData } from "../../ClientsForm";
import { useTranslations } from "next-intl";

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

function validateClientData(client: ClientData, t: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!client.first_name?.trim()) { errors.push(t("first_name_required")); }
    if (!client.last_name?.trim()) { errors.push(t("last_name_required")); }
    if (!client.email?.trim()) { errors.push(t("email_required")); }
    if (!client.identity_document?.trim()) { errors.push(t("identity_document_required")); }
    if (!client.birth_date) { errors.push(t("birth_date_required")); }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (client.email && !emailRegex.test(client.email)) {
        errors.push(t("email_invalid"));
    }

    if (client.birth_date) {
        const birthDate = new Date(client.birth_date);
        const today = new Date();
        if (birthDate > today) {
            errors.push(t("birth_date_future"));
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export default function EditClient() {
    const t = useTranslations("clients.edit");
    const tForm = useTranslations("clients.form.validations");
    const tNotifications = useTranslations("clients.notifications");
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
                    setError(t("load_error"));
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadClient();
    }, [params.id, token, router, t, tNotifications]);

    const handleSave = async () => {
        if (!token || !params.id) {
            setError(t("auth_error"));
            return;
        }

        const validation = validateClientData(client, tForm);
        if (!validation.isValid) {
            setError(t("validation_error", { errors: validation.errors.join(", ") }));
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const updateData: UpdateUserRequest = {
                first_name: client.first_name,
                last_name: client.last_name,
                email: client.email,
                birth_date: client.birth_date,
                gender: client.gender,
                identity_document: client.identity_document,
                phone: client.phone,
            };

            Object.keys(updateData).forEach(key => {
                const typedKey = key as keyof UpdateUserRequest;
                if (updateData[typedKey] === undefined || updateData[typedKey] === "") {
                    delete updateData[typedKey];
                }
            });

            await api.user.updateUserClient(params.id as string, updateData, token);

            toast.success(t("success"));

            setTimeout(() => {
                router.replace("/clients/register");
            }, 1000);

        } catch (error) {
            console.error("Error updating client:", error);

            let errorMessage = t("save_error");

            if (isAPIError(error)) {
                errorMessage = `Error: ${error.messages.join(", ")}`;

                if (error.status === 400) {
                    errorMessage = t("invalid_data");
                } else if (error.status === 401) {
                    errorMessage = tNotifications("session_expired");
                    router.replace("/login");
                } else if (error.status === 403) {
                    errorMessage = tNotifications("permission_error");
                } else if (error.status === 404) {
                    errorMessage = t("not_found");
                } else if (error.status === 409) {
                    errorMessage = t("email_in_use");
                }
            }

            setError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.replace("/clients/register");
    };

    if (isLoading) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">{t("loading")}</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <PageHeader
                    title={t("error_title")}
                    subtitle={t("error_subtitle")}
                >
                    <Button variant="outline" onClick={() => router.replace("/clients")}>
                        {t("back_button")}
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
                title={t("title")}
                subtitle={t("subtitle", { name: `${client.first_name} ${client.last_name}` })}
            >
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    {t("cancel_button")}
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <span className="mr-2">{t("saving")}</span>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        </>
                    ) : (
                        t("save_button")
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