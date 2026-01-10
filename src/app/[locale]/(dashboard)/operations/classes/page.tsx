"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClassCalendar } from "@/components/modules/calendar/ClassCalendar";


export default function ClassesMethodsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader
        title="Calendario de Clases"
        subtitle="Gestiona clases, reservas y horarios del gimnasio."
      ></PageHeader>

      <div className="bg-background p-4 rounded-lg shadow-sm">
        <ClassCalendar />
      </div>
    </div>
  );
}
