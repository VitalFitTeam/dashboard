"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import ClientsForm, { ClientData } from "../../ClientsForm";
import { Button } from "@/components/ui/button";
import { clientsData } from "../../data";

export default function EditClient() {
    const params = useParams();
    const router = useRouter();
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

    useEffect(() => {
        const loadClient = async () => {
            if (!params.id) { return; }
            setIsLoading(true);
            try {
                const foundClient = clientsData.find(c => c.client_id === params.id);
                if (foundClient) {
                    setClient(foundClient);
                } else {
                    console.error("Client not found");
                }
            } catch (error) {
                console.error("Error loading client:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadClient();
    }, [params.id]);

    const handleSave = async () => {
        try {
            console.warn("Saving client", client);
            router.replace("/clients");
        } catch (error) {
            console.error("Error updating client:", error);
        }
    };

    const handleCancel = () => {
        router.replace("/clients");
    };

    if (isLoading) { return <div>Cargando...</div>; }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader
                title="EDITAR CLIENTE"
                subtitle={`Modifica la información del cliente ${client.first_name} ${client.last_name}`}
            >
                <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar Cambios</Button>
            </PageHeader>
            <ClientsForm
                client={client}
                onChange={(field, value) => setClient(prev => ({ ...prev, [field]: value }))}
                mode="edit"
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </div>
    );
}
