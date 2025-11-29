"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, CreditCard, Eye, FileText, Activity, BarChart } from "lucide-react";
import { clientsData } from "../data";

export default function ClientDetails() {
    const params = useParams();
    const router = useRouter();
    const [client, setClient] = useState<any>(null);
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

    if (isLoading) { return <div>Cargando...</div>; }
    if (!client) { return <div>Cliente no encontrado</div>; }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader title="DETALLES DEL CLIENTE" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Codigo Cliente</p>
                            <p className="font-medium">{client.client_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Categoria</p>
                            <Badge className="bg-white border-2 border-yellow-500 text-yellow-500">
                                {client.category}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Nombre Completo</p>
                            <p className="font-medium">{client.first_name} {client.last_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{client.phone}</p>
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
                            <p className="font-medium">{client.birth_date}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Género</p>
                            <p className="font-medium">{client.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sucursal</p>
                            <p className="font-medium">{client.branch_name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Scoring</p>
                            <p className="font-medium">{client.scoring || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Fecha de creación</p>
                            <p className="font-medium">{client.created_at}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Último Acceso</p>
                            <p className="font-medium">{client.last_access || "N/A"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => router.replace(`/clients/${client.client_id}/edit`)}>
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
        </div>
    );
}
