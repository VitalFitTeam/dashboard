"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import { SessionUser } from "@/context/AuthContext";
import { BranchStaff } from "@vitalfit/sdk";

// --- Props del Componente ---
interface BranchDashboardProps {
  user: SessionUser;
  activeBranch?: BranchStaff;
}

// Mock data (En una fase siguiente, estos se filtrarían por activeBranch?.id)
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

const heatmapData = [
  {
    hora: "6am",
    lun: 20,
    mar: 25,
    mie: 30,
    jue: 28,
    vie: 35,
    sab: 40,
    dom: 15,
  },
  {
    hora: "8am",
    lun: 60,
    mar: 65,
    mie: 70,
    jue: 68,
    vie: 75,
    sab: 80,
    dom: 45,
  },
  {
    hora: "10am",
    lun: 85,
    mar: 90,
    mie: 88,
    jue: 92,
    vie: 95,
    sab: 70,
    dom: 50,
  },
  {
    hora: "12pm",
    lun: 95,
    mar: 98,
    mie: 96,
    jue: 100,
    vie: 99,
    sab: 75,
    dom: 60,
  },
  {
    hora: "3pm",
    lun: 88,
    mar: 92,
    mie: 90,
    jue: 94,
    vie: 91,
    sab: 85,
    dom: 70,
  },
  {
    hora: "6pm",
    lun: 92,
    mar: 95,
    mie: 93,
    jue: 97,
    vie: 96,
    sab: 88,
    dom: 75,
  },
  {
    hora: "9pm",
    lun: 45,
    mar: 50,
    mie: 48,
    jue: 52,
    vie: 55,
    sab: 60,
    dom: 35,
  },
];

const getHeatColor = (value: number) => {
  if (value < 20){
     return "bg-blue-100";
  }
  if (value < 40) {
    return "bg-blue-200";
  }
  if (value < 60) {
    return "bg-blue-300";
  }
  if (value < 80){
     return "bg-blue-400";
  }
  return "bg-blue-600";
};

export default function BranchAdminDashboard({
  user,
  activeBranch,
}: BranchDashboardProps) {
  const [period, setPeriod] = useState("mensual");

  return (
    <div className="space-y-8 p-2">
      {/* Header dinámico basado en la sucursal seleccionada en el Sidebar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Panel: {activeBranch?.name || "Todas las sedes"}
          </h1>
          <p className="text-muted-foreground">
            Bienvenido, {user.first_name}. Estas son las métricas de hoy.
          </p>
        </div>

        <Tabs
          defaultValue="mensual"
          className="w-full md:w-[400px]"
          onValueChange={setPeriod}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diario">Día</TabsTrigger>
            <TabsTrigger value="mensual">Mensual</TabsTrigger>
            <TabsTrigger value="anual">Anual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Estadísticas Rápidas */}
      <Tabs value={period} className="w-full">
        <TabsContent
          value="diario"
          className="mt-0 animate-in fade-in duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Ventas (Hoy)"
              value="$45,200"
              icon={
                <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
              }
              description={
                <span className="text-green-600 font-medium">
                  +12.5% vs. ayer
                </span>
              }
            />
            <StatCard
              title="Ingresos Hoy"
              value="156"
              icon={<UserGroupIcon className="h-4 w-4 text-muted-foreground" />}
              description={
                <span className="text-green-600 font-medium">+24 nuevos</span>
              }
            />
            <StatCard
              title="Ocupación Pico"
              value="92%"
              icon={<ChartBarIcon className="h-4 w-4 text-muted-foreground" />}
              description={
                <span className="text-blue-600 font-medium">
                  Capacidad óptima
                </span>
              }
            />
            <StatCard
              title="NPS Diario"
              value="4.8"
              icon={<FaceSmileIcon className="h-4 w-4 text-muted-foreground" />}
              description={
                <span className="text-green-600 font-medium">
                  Excelente feedback
                </span>
              }
            />
          </div>
        </TabsContent>

        <TabsContent
          value="mensual"
          className="mt-0 animate-in fade-in duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Ventas (Mes)"
              value="$1.25M"
              icon={
                <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
              }
              description={
                <span className="text-green-600 font-medium">
                  +20.1% vs mes anterior
                </span>
              }
            />
            <StatCard
              title="Miembros Activos"
              value="2,350"
              icon={<UserGroupIcon className="h-4 w-4 text-muted-foreground" />}
              description={
                <span className="text-green-600 font-medium">
                  +180 este mes
                </span>
              }
            />
            <StatCard
              title="Retención"
              value="94%"
              icon={<ChartBarIcon className="h-4 w-4 text-muted-foreground" />}
              description={
                <span className="text-green-600 font-medium">
                  +2% vs mes anterior
                </span>
              }
            />
            <StatCard
              title="Ocupación Prom."
              value="78%"
              icon={<ChartBarIcon className="h-4 w-4 text-muted-foreground" />}
              description={
                <span className="text-muted-foreground">Estable</span>
              }
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Gráficos Detallados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tendencia de Ventas</CardTitle>
            <CardDescription>
              Ingresos generados en los últimos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyVentasData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ocupación por Disciplina</CardTitle>
            <CardDescription>
              Porcentaje de llenado por tipo de clase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={claseOcupacionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                <Bar
                  dataKey="ocupacion"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mapa de Calor */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Densidad de Tráfico</CardTitle>
            <CardDescription>
              Horarios de mayor afluencia en {activeBranch?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {heatmapData.map((row) => (
                <div key={row.hora} className="flex items-center gap-4">
                  <span className="text-[10px] w-8 text-muted-foreground font-mono">
                    {row.hora}
                  </span>
                  <div className="flex flex-1 gap-1">
                    {[
                      row.lun,
                      row.mar,
                      row.mie,
                      row.jue,
                      row.vie,
                      row.sab,
                      row.dom,
                    ].map((val, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-6 rounded-sm ${getHeatColor(val)} transition-colors hover:ring-1 ring-primary cursor-help`}
                        title={`${val}% ocupación`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                <span>Menos</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-sm bg-blue-100" />
                  <div className="w-4 h-4 rounded-sm bg-blue-300" />
                  <div className="w-4 h-4 rounded-sm bg-blue-500" />
                  <div className="w-4 h-4 rounded-sm bg-blue-600" />
                </div>
                <span>Más</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen Financiero Simplificado */}
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Caja</CardTitle>
            <CardDescription>Ingresos brutos por categoría</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Membresías</span>
              <span className="font-bold text-green-600">$85,200</span>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">
                PT & Nutrición
              </span>
              <span className="font-bold text-green-600">$24,500</span>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">
                Retail (Tienda)
              </span>
              <span className="font-bold text-green-600">$14,800</span>
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="font-bold text-slate-700">Total Neto</span>
              <span className="text-2xl font-black text-slate-900">
                $124,500
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
