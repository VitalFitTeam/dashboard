"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { SignUpRequest, UserGender, isAPIError } from "@vitalfit/sdk";
import { toast } from "sonner";
import ClientsForm, { ClientData } from "../ClientsForm";
import { getClientSchema } from "@/lib/validation/clientSchema";
import { useTranslations } from "next-intl";

function normalizeGenderForAPI(gender: string): UserGender | null {
    const genderMap: Record<string, UserGender> = {
        "male": UserGender.male,
        "female": UserGender.female,
        "prefer-not-to-say": UserGender.preferNotToSay,
        "masculino": UserGender.male,
        "femenino": UserGender.female,
        "prefiero no especificarlo": UserGender.preferNotToSay,
    };

    return genderMap[gender] || null;
}

export default function NewClient() {
    const t = useTranslations("clients.create");
    const tForm = useTranslations("clients.form.validations");
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
        status: "active",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof ClientData, string>>>({});

    const handleCreate = async () => {
        if (!token) {
            setError(t("auth_error"));
            return;
        }

        const schema = getClientSchema(tForm);
        const result = schema.safeParse(client);

        if (!result.success) {
            const formattedErrors: Partial<Record<keyof ClientData, string>> = {};
            const errorMessages: string[] = [];

            result.error.issues.forEach(issue => {
                const path = issue.path[0] as keyof ClientData;
                formattedErrors[path] = issue.message;
                errorMessages.push(issue.message);
            });

            setFormErrors(formattedErrors);
            setError(t("validation_error", { errors: errorMessages.join(", ") }));
            return;
        }

        setFormErrors({});
        setIsSaving(true);
        setError(null);

        try {
            const defaultPassword = `Vital.${client.identity_document.trim()}!`;

            const createData: SignUpRequest = {
                first_name: client.first_name,
                last_name: client.last_name,
                email: client.email,
                password: defaultPassword,
                identity_document: client.identity_document,
                phone: client.phone || null,
                birth_date: client.birth_date,
                gender: normalizeGenderForAPI(client.gender),
                role_name: "client",
                profile_picture_url: null
            };

            await api.auth.signUpStaff(createData, token);

            toast.success(t("success"));

            setTimeout(() => {
                router.replace("/clients/register");
            }, 1000);

        } catch (error: any) {
            console.error("Error creating client:", error);

            let errorMessage = t("error");

            if (isAPIError(error)) {
                errorMessage = `Error: ${error.messages.join(", ")}`;

                if (error.status === 400) {
                    errorMessage = t("invalid_data");
                } else if (error.status === 409) {
                    errorMessage = t("email_in_use");
                }
            } else if (error.message) {
                errorMessage = error.message;
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

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader
                title={t("title")}
                subtitle={t("subtitle")}
            >
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    {t("cancel_button")}
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
                    if (formErrors[field]) {
                        setFormErrors(prev => ({ ...prev, [field]: undefined }));
                    }
                }}
                errors={formErrors}
                mode="create"
                onSave={handleCreate}
                onCancel={handleCancel}
            />
            <Button className="mt-4 w-full" onClick={handleCreate} disabled={isSaving}>
                {isSaving ? (
                    <>
                        <span className="mr-2">{t("creating")}</span>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </>
                ) : (
                    t("create_button")
                )}
            </Button>
        </div>
    );
}
