"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ClassCalendar } from "@/components/calendar/ClassCalendar";

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
        subtitle="Gestiona clases, reservas y horarios del gimnasio."
      ></PageHeader>

      <div className="bg-background p-4 rounded-lg shadow-sm">
        <ClassCalendar />
      </div>
    </div>
  );
}
