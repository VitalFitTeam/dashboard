import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { StatCard } from "@/components/ui/StatCard";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTopBranches, useTotalActiveBranches } from "@/hooks/useReports";
import { BuildingOffice2Icon } from "@heroicons/react/24/solid";
import { FranchisePerformanceItem } from "../analytics/FranchisePerformanceItem";

import { TotalClients } from "../analytics/clients/ClientsStat";

export default function SuperAdminDashboard() {
    const { token } = useAuth();

    const { data: totalActiveBranch, isLoading: isLoadingBranches } = useTotalActiveBranches(token);
    const { data: topActiveBranch, isLoading: isLoadingTopBranches } = useTopBranches(token);

    const normalizeTrend = (value?: string) =>
        value?.toLowerCase() === "up" || value?.toLowerCase() === "down"
            ? (value.toLowerCase() as "up" | "down")
            : undefined;

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* <StatCard
                        title="Ventas globales"
                        value={"$ 1,250,000"}
                        icon={CurrencyDollarIcon}
                        description={<span className="text-green-600">+20.1% vs mes pasado</span>}
                    /> */}

                    {/* <StatCard
                        title="Sucursales Activas"
                        value={isLoadingBranches ? "-" : totalActiveBranch}
                        icon={BuildingOffice2Icon}
                    /> */}

                    {/* <TotalClients token={token}/> */}

                    {/* <StatCard
                        title="NPS Global"
                        value={<h3 className="ml-1.5 font-normal">8.63</h3>}
                        icon={CurrencyDollarIcon}
                        description={<span className="text-red-600">-1.2% vs mes anterior</span>}
                    /> */}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Rendimiento por Franquicia
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                Top {isLoadingTopBranches ? "-" : topActiveBranch?.length ?? 0} sedes por volumen de ventas
                            </p>
                        </CardHeader>

                        <CardContent>
                            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                                {topActiveBranch?.map((branch, index) => (
                                    <FranchisePerformanceItem
                                        key={branch.label}
                                        name={branch.label}
                                        status={branch.status}
                                        revenue={branch.value}
                                        growth={branch.percent_change}
                                        trend={normalizeTrend(branch.trend)}
                                        withBorder={index !== topActiveBranch.length - 1}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Alertas del Sistema
                            </CardTitle>
                            <p className="text-sm text-gray-500">Notificaciones críticas</p>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        color: "text-yellow-600",
                                        title: "Baja ocupación crítica",
                                        desc: "Sede Querétaro - Clases < 30%",
                                        time: "2h",
                                    },
                                    {
                                        color: "text-red-600",
                                        title: "Reporte financiero pendiente",
                                        desc: "Sede Cancún - Cierre Mes",
                                        time: "5h",
                                    },
                                    {
                                        color: "text-blue-600",
                                        title: "Nuevo franquiciado",
                                        desc: "Proceso de onboarding iniciado",
                                        time: "1d",
                                    },
                                    {
                                        color: "text-blue-600",
                                        title: "Error de sincronización",
                                        desc: "API de pagos",
                                        time: "1d",
                                    },
                                ].map((alert, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <AlertTriangle className={`h-5 w-5 ${alert.color} mt-0.5`} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{alert.title}</p>
                                            <p className="text-xs text-gray-600">{alert.desc}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">{alert.time}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
