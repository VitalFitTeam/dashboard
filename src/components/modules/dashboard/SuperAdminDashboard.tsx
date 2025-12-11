import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { StatCard } from "@/components/ui/StatCard";
import { AlertTriangle } from "lucide-react";

export default function SuperAdminDashboard() {
    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Ventas globales"
                            value={
                                <>
                                <h3 className="ml-1.5 font-normal \0">
                                    $ 1,250,000
                                </h3>
                                </>
                            }
                            icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                            bottomMarkup={false}
                            description={
                                <span className="text-green-600">+20.1% desde el mes pasado</span>
                            }
                        />
                        <StatCard
                            title="Franquicias Activas"
                            value={
                                <>
                                <h3 className="ml-1.5 font-normal \0">
                                    12
                                </h3>
                                </>
                            }
                            icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                            bottomMarkup={false}
                        />
                        <StatCard
                            title="Usuarios Totales"
                            value={
                                <>
                                <h3 className="ml-1.5 font-normal \0">
                                    8,543
                                </h3>
                                </>
                            }
                            icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                            bottomMarkup={false}
                        />
                        <StatCard
                            title="NPS Global"
                            value={
                                <>
                                <h3 className="ml-1.5 font-normal \0">
                                    8.63
                                </h3>
                                </>
                            }
                            icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                            bottomMarkup={false}
                            description={
                                <span className="text-red-600">-1.2% vs. mes anterior</span>
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Rendimiento por Franquicia
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    Top 5 sedes por volumen de ventas
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b">
                                        <div>
                                            <p className="font-medium">Sede Central CDMX</p>
                                            <p className="text-sm text-gray-500">Excelente</p>
                                        </div>
                                        <div className="text-right flex gap-2">
                                            <p className="font-semibold">$450,000</p>
                                            <p className="text-sm text-green-600">+12%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pb-4 border-b">
                                        <div>
                                            <p className="font-medium">Guadalajara Norte</p>
                                            <p className="text-sm text-gray-500">Bueno</p>
                                        </div>
                                        <div className="text-right flex gap-2">
                                            <p className="font-semibold">$320,000</p>
                                            <p className="text-sm text-green-600">+8%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pb-4 border-b">
                                        <div>
                                            <p className="font-medium">Monterrey Sur</p>
                                            <p className="text-sm text-gray-500">Excelente</p>
                                        </div>
                                        <div className="text-right flex gap-2">
                                            <p className="font-semibold">$280,000</p>
                                            <p className="text-sm text-green-600">+15%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pb-4 border-b">
                                        <div>
                                            <p className="font-medium">Querétaro Centro</p>
                                            <p className="text-sm text-gray-500">Atención</p>
                                        </div>
                                        <div className="text-right flex gap-2">
                                            <p className="font-semibold">$210,000</p>
                                            <p className="text-sm text-red-600">-2%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Puebla Angelópolis</p>
                                            <p className="text-sm text-gray-500">Bueno</p>
                                        </div>
                                        <div className="text-right flex gap-2">
                                            <p className="font-semibold">$180,000</p>
                                            <p className="text-sm text-green-600">+5%</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Alertas del Sistema
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    Notificaciones críticas de la red
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                Baja ocupación crítica
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Sede Querétaro - Clases &lt; 30%
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">2h</span>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                Reporte financiero pendiente
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Sede Cancún - Cierre Mes
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">5h</span>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                Nuevo franquiciado
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Proceso de onboarding iniciado
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">1d</span>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                Error de sincronización
                                            </p>
                                            <p className="text-xs text-gray-600">API de pagos</p>
                                        </div>
                                        <span className="text-xs text-gray-500">1d</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            </div>
        </div>
    );
}
