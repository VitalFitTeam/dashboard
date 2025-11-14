import { CalendarWrapper } from "@/components/calendar/CalendarWrapper";

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Calendario de Clases</h1>
      <p className="text-sm text-muted-foreground">
        Gestiona clases, reservas y horarios del gimnasio.
      </p>

      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <CalendarWrapper />
      </div>
    </div>
  );
}
