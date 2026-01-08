"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ClassCalendar } from "@/components/calendar/ClassCalendar";
import { useRouter } from "@/i18n/navigation";

export default function ClassesMethodsPage() {
  const { token } = useAuth();
  const router = useRouter();

  if (!token) {
    return;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader
        title="Calendario de Clases"
        subtitle="Encuentra todas clases programadas."
      >
        <Button
          variant="secondary"
          className="bg-transparent border border-gray hover:bg-primary hover:text-white"
          onClick={() => router.push("/calendar/new/")}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Agregar Clase
        </Button>
      </PageHeader>

      <div className="bg-background p-4 rounded-lg shadow-sm">
        <ClassCalendar />
      </div>
    </div>
  );
}
