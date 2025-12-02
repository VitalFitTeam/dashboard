"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

// Mock data
const weeklyVentasData = [
    { day: "Lun", ventas: 12000 },
    { day: "Mar", ventas: 15000 },
    { day: "Mié", ventas: 18000 },
    { day: "Jue", ventas: 16000 },
    { day: "Vie", ventas: 19000 },
    { day: "Sab", ventas: 17000 },
    { day: "Dom", ventas: 14000 },
];

const claseOcupacionData = [
    { name: "Yoga", ocupacion: 85 },
    { name: "Spinning", ocupacion: 92 },
    { name: "CrossFit", ocupacion: 78 },
    { name: "Pilates", ocupacion: 88 },
    { name: "Funcional", ocupacion: 80 },
    { name: "Zumba", ocupacion: 75 },
];

// Mapa de calor - datos de actividad por hora y día
const heatmapData = [
    { hora: "6am", lun: 20, mar: 25, mie: 30, jue: 28, vie: 35, sab: 40, dom: 15 },
    { hora: "8am", lun: 60, mar: 65, mie: 70, jue: 68, vie: 75, sab: 80, dom: 45 },
    { hora: "10am", lun: 85, mar: 90, mie: 88, jue: 92, vie: 95, sab: 70, dom: 50 },
    { hora: "12pm", lun: 95, mar: 98, mie: 96, jue: 100, vie: 99, sab: 75, dom: 60 },
    { hora: "3pm", lun: 88, mar: 92, mie: 90, jue: 94, vie: 91, sab: 85, dom: 70 },
    { hora: "6pm", lun: 92, mar: 95, mie: 93, jue: 97, vie: 96, sab: 88, dom: 75 },
    { hora: "9pm", lun: 45, mar: 50, mie: 48, jue: 52, vie: 55, sab: 60, dom: 35 },
];

// Función para obtener el color basado en la intensidad
const getHeatColor = (value: number) => {
    if (value < 20) {
        return "bg-blue-100";
    }
    if (value < 40) {
        return "bg-blue-200";
    }
    if (value < 60) {
        return "bg-blue-300";
    }
    if (value < 80) {
        return "bg-blue-400";
    }
    return "bg-blue-600";
};

export default function BranchDashboard() {
    const [period, setPeriod] = useState("mensual");

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">DASHBOARD ADMIN</h1>

                    <Tabs defaultValue="mensual" className="w-[400px]" onValueChange={setPeriod}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="diario">Día</TabsTrigger>
                            <TabsTrigger value="mensual">Mensual</TabsTrigger>
                            <TabsTrigger value="anual">Anual</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <Tabs value={period}>
                    <TabsContent value="diario" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Ventas Totales (Día)"
                                value="$45,200"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+12.5% vs. día anterior</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="Miembros Hoy"
                                value="+156"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+8.7% vs. día anterior</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="Ocupación Pico"
                                value="92%"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+5% vs. día anterior</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="NPS del Día"
                                value="4.2"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+0.8 vs. día anterior</span>}
                                bottomMarkup={false}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="mensual" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Ventas Totales (Mes)"
                                value="$1.250.000"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+20.1% desde el mes pasado</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="Miembros Activos"
                                value="+2,350"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+180.7% desde el mes pasado</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="NPS (Satisfacción)"
                                value="3.2"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+1 vs. mes anterior</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="Ocupación Promedio"
                                value="78%"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+20.1% desde el mes pasado</span>}
                                bottomMarkup={false}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="anual" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Ventas Totales (Año)"
                                value="$14.500.000"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+25.3% desde el año pasado</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="Miembros Totales"
                                value="+12,350"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+15.7% desde el año pasado</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="NPS Promedio"
                                value="4.1"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+0.5 vs. año anterior</span>}
                                bottomMarkup={false}
                            />
                            <StatCard
                                title="Ocupación Anual"
                                value="82%"
                                icon={<CurrencyDollarIcon className="h-4 w-4" />}
                                description={<span className="text-green-600">+8.4% desde el año pasado</span>}
                                bottomMarkup={false}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Ventas de la Semana</CardTitle>
                            <CardDescription>Comparativo con meses anteriores</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={weeklyVentasData}>
                                    <defs>
                                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="ventas"
                                        stroke="hsl(var(--chart-1))"
                                        fillOpacity={1}
                                        fill="url(#colorVentas)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Mapa de Calor de Actividad</CardTitle>
                            <CardDescription>Distribución de intensidad por hora y día</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {heatmapData.map((row) => (
                                    <div key={row.hora} className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">{row.hora}</p>
                                        <div className="flex gap-1">
                                            <div className={`w-8 h-8 rounded ${getHeatColor(row.lun)}`} />
                                            <div className={`w-8 h-8 rounded ${getHeatColor(row.mar)}`} />
                                            <div className={`w-8 h-8 rounded ${getHeatColor(row.mie)}`} />
                                            <div className={`w-8 h-8 rounded ${getHeatColor(row.jue)}`} />
                                            <div className={`w-8 h-8 rounded ${getHeatColor(row.vie)}`} />
                                            <div className={`w-8 h-8 rounded ${getHeatColor(row.sab)}`} />
                                            <div className={`w-8 h-8 rounded ${getHeatColor(row.dom)}`} />
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-4 text-xs">
                                    <span className="text-muted-foreground">Menos actividad</span>
                                    <div className="flex gap-1">
                                        <div className="w-6 h-6 rounded bg-blue-100" />
                                        <div className="w-6 h-6 rounded bg-blue-300" />
                                        <div className="w-6 h-6 rounded bg-blue-500" />
                                        <div className="w-6 h-6 rounded bg-blue-600" />
                                    </div>
                                    <span className="text-muted-foreground">Más actividad</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Ocupación de Clases</CardTitle>
                            <CardDescription>Promedio de ocupación por tipo de clase</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={claseOcupacionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Bar dataKey="ocupacion" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Resumen Financiero</CardTitle>
                            <CardDescription>Flujo de caja proyectado vs real</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Ingresos Membresías</p>
                                <p className="text-2xl font-bold text-green-600">$85,200</p>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-1">Servicios Adicionales (PT, Nutrición)</p>
                                <p className="text-2xl font-bold text-green-600">$24,500</p>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-1">Venta Productos</p>
                                <p className="text-2xl font-bold text-green-600">$14,800</p>
                            </div>
                            <div className="pt-4">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Neto</p>
                                <p className="text-3xl font-bold">$124,500</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}