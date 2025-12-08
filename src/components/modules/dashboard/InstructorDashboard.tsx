import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { StatCard } from "@/components/ui/StatCard";
import { Button }  from "@/components/ui/button";
import { Clock } from "lucide-react";

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
}

export default function InstructorDashboard() {
    const todayClasses: TodayClass[] = [
        {
            id: 1,
            time: "07:00",
            className: "Yoga Matutino",
            instructor: "Carlos Ruiz",
            location: "Sala B",
            action: "start"
        },
        {
            id: 2,
            time: "07:00",
            className: "Yoga Matutino",
            instructor: "Carlos Ruiz",
            location: "Sala B",
            action: "view"
        },
        {
            id: 3,
            time: "07:00",
            className: "Yoga Matutino",
            instructor: "Carlos Ruiz",
            location: "Sala B",
            action: "view"
        },
        {
            id: 4,
            time: "07:00",
            className: "Yoga Matutino",
            instructor: "Carlos Ruiz",
            location: "Sala B",
            action: "view"
        }
    ];

    // Mock data for recent comments
    const recentComments: RecentComment[] = [
        {
            id: 1,
            userName: "Usuario 1",
            comment: "Excelente clase, muy intensa y bien explicada. ¡Me encantó la energía!"
        },
        {
            id: 2,
            userName: "Usuario 2",
            comment: "Excelente clase, muy intensa y bien explicada. ¡Me encantó la energía!"
        },
        {
            id: 3,
            userName: "Usuario 3",
            comment: "Excelente clase, muy intensa y bien explicada. ¡Me encantó la energía!"
        }
    ];

    // Function to get button text based on action type
    const getButtonText = (action: ClassAction): string => {
        if (action === "start") {
            return "Iniciar clase";
        } else {
            return "Ver lista";
        }
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Proxima Clase"
                            value={
                                <>
                                    <h3 className="ml-1.5 font-normal \0">
                                        09:00 A.M
                                    </h3>
                                </>
                            }
                            bottomMarkup={false}
                        />
                        <StatCard
                            title="Alumnos Hoy"
                            value={
                                <>
                                    <h3 className="ml-1.5 font-normal \0">
                                        48
                                    </h3>
                                </>
                            }
                            bottomMarkup={false}
                            description={
                                <span className="text-green-600">+12% vs. semana pasada</span>
                            }
                        />
                        <StatCard
                            title="Calif. Promedio"
                            value={
                                <>
                                    <h3 className="ml-1.5 font-normal \0">
                                        4.9
                                    </h3>
                                </>
                            }
                            icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                            bottomMarkup={false}
                            description={
                                <span className="text-green-600">+0.2% Excelente</span>
                            }
                        />
                        <StatCard
                            title="Clases este mes"
                            value={
                                <>
                                    <h3 className="ml-1.5 font-normal \0">
                                        42
                                    </h3>
                                </>
                            }
                            icon={<CurrencyDollarIcon className="h-5 w-5 text-gray-500" />}
                            bottomMarkup={false}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* MY TODAY'S CLASSES - Attendance and occupancy management */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>
                                    <h3 className="text-2xl">MIS CLASES DE HOY</h3>
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    Gestión de asistencia y ocupación
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {todayClasses.map((classItem) => (
                                    <div key={classItem.id} className="flex items-center justify-between p-2 border rounded-lg shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 rounded border-gray-300" />
                                            </div>
                                            <div className="flex-col ms-3">
                                                <span className="text-sm font-medium">{classItem.time}</span>
                                                <p className="font-medium text-sm">{classItem.className}</p>
                                                <p className="text-xs text-gray-600">{classItem.instructor} · {classItem.location}</p>
                                            </div>
                                        </div>
                                        <Button variant={getButtonText(classItem.action) === "Ver lista" ? "secondary" : "primary"} >
                                            {getButtonText(classItem.action)}
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold">
                                    Comentarios Recientes
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    Feedback de tus alumnos
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentComments.map((comment) => (
                                    <div key={comment.id} className="p-3 border rounded-lg">
                                        <div className="flex">
                                        <div className="flex-col mx-5 items-center">
                                            <span className="text-3xl font-medium">U</span>
                                        </div>
                                        <div className="flex-col">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium">{comment.userName}</span>
                                            <StarIcon className="h-4 w-4 text-yellow-500"/>
                                            <StarIcon className="h-4 w-4 text-yellow-500"/>
                                            <StarIcon className="h-4 w-4 text-yellow-500"/>
                                            <StarIcon className="h-4 w-4 text-yellow-500"/>
                                            <StarIcon className="h-4 w-4 text-yellow-500"/>
                                        </div>
                                        <p className="text-sm text-gray-700 italic">
                                            "{comment.comment}"
                                        </p>
                                        </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </>
            </div>
        </div>
    );
}