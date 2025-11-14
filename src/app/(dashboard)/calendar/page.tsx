import { CalendarWrapper } from "@/components/calendar/CalendarWrapper";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CalendarPage() {
  return (
    <main className="p-6 space-y-6">
      <PageHeader
        title="Calendario de Clases"
        subtitle="Gestiona clases, reservas y horarios del gimnasio."
      />

      <div className="bg-background p-4 rounded-lg shadow-sm">
        <CalendarWrapper />
      </div>
    </main>
  );
}
