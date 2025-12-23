"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDollarIcon, StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { Clock, Users, GraduationCap, Star } from "lucide-react";
import { SessionUser } from "@/context/AuthContext";
import { BranchStaff } from "@vitalfit/sdk";

type ClassAction = "start" | "view";

interface TodayClass {
    id: number;
    time: string;
    className: string;
    instructor: string;
    location: string;
    action: ClassAction;
}

interface RecentComment {
    id: number;
    userName: string;
    comment: string;
    rating: number;
}

// Props tipadas para la integración con page.tsx
interface InstructorDashboardProps {
    user: SessionUser;
    activeBranch?: BranchStaff;
}

export default function InstructorDashboard({ user, activeBranch }: InstructorDashboardProps) {
    const todayClasses: TodayClass[] = [
        {
            id: 1,
            time: "07:00",
            className: "Yoga Matutino",
            instructor: user.first_name + " " + user.last_name,
            location: "Sala B",
            action: "start"
        },
        // ... rest of mock data
    ];

    const recentComments: RecentComment[] = [
        {
            id: 1,
            userName: "Laura G.",
            comment: "Excelente clase, muy intensa y bien explicada. ¡Me encantó la energía!",
            rating: 5
        },
        // ... rest of mock data
    ];

    return (
        <div className="space-y-8 p-2">
            {/* Header reactivo a la sede */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight uppercase">
                    Instructor: {user.first_name} {user.last_name}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="size-4" /> 
                    Sede actual: <span className="font-semibold text-primary">{activeBranch?.name || "Sin sede"}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Próxima Clase"
                    value="09:00 AM"
                    icon={<Clock className="h-5 w-5 text-blue-500" />}
                    bottomMarkup={false}
                    description="Yoga Vinyasa"
                />
                <StatCard
                    title="Alumnos Hoy"
                    value="48"
                    icon={<Users className="h-5 w-5 text-green-500" />}
                    bottomMarkup={false}
                    description={<span className="text-green-600">+12% vs. sem. pasada</span>}
                />
                <StatCard
                    title="Calif. Promedio"
                    value="4.9"
                    icon={<Star className="h-5 w-5 text-yellow-500" />}
                    bottomMarkup={false}
                    description={<span className="text-green-600">Excelente</span>}
                />
                <StatCard
                    title="Clases este mes"
                    value="42"
                    icon={<GraduationCap className="h-5 w-5 text-purple-500" />}
                    bottomMarkup={false}
                    description="Meta: 50 clases"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LISTA DE CLASES */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">
                            Mis clases de hoy
                        </CardTitle>
                        <CardDescription>
                            Gestión de asistencia en {activeBranch?.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {todayClasses.map((classItem) => (
                            <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center size-12 rounded-lg bg-primary/10 text-primary">
                                        <span className="text-xs font-bold uppercase">Time</span>
                                        <span className="text-sm font-black">{classItem.time}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm uppercase">{classItem.className}</p>
                                        <p className="text-xs text-muted-foreground">{classItem.location}</p>
                                    </div>
                                </div>
                                <Button 
                                    size="sm"
                                    variant={classItem.action === "view" ? "outline" : "default"}
                                    className="font-bold uppercase text-[10px]"
                                >
                                    {classItem.action === "start" ? "Iniciar clase" : "Ver lista"}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* COMENTARIOS */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">
                            Feedback de alumnos
                        </CardTitle>
                        <CardDescription>Comentarios recientes de tus sesiones</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {recentComments.map((comment) => (
                            <div key={comment.id} className="p-4 border rounded-xl flex gap-4">
                                <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                    {comment.userName.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">{comment.userName}</span>
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <StarSolid key={i} className="h-3 w-3" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 italic leading-relaxed">
                                        "{comment.comment}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}