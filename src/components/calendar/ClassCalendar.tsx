"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";

import { GymClass } from "./types";
import { mockClasses } from "./mockData";
import { classColors } from "@/styles/eventColors";
import { useAuth } from "@/context/AuthContext";

interface CalendarWrapperProps {
  onCreateClass?: (dateStr: string) => void;
  onViewClass?: (classId: string) => void;
}

export function ClassCalendar({
  onCreateClass,
  onViewClass,
}: CalendarWrapperProps) {
  const { user, hasRole } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<GymClass[]>([]);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [instructorFilter, setInstructorFilter] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);

  useEffect(() => {
    setEvents(mockClasses);
  }, []);

  const visibleEvents = events.filter((e) => {
    if (!user) {
      return false;
    }

    let roleFilter = false;
    switch (user.role) {
      case "super_admin":
        roleFilter = true;
        break;
      case "branch_admin":
      case "recepcionist":
        roleFilter = e.branchId === user.branchId;
        break;
      case "instructor":
        roleFilter = e.instructorId === user.user_id;
        break;
      default:
        roleFilter = false;
    }

    return (
      roleFilter &&
      (!typeFilter || e.type === typeFilter) &&
      (!instructorFilter || e.instructorId === instructorFilter) &&
      (!branchFilter || e.branchId === branchFilter)
    );
  });

  const canCreate = () => {
    return hasRole?.(["super_admin", "branch_admin", "recepcionist"]) ?? false;
  };

  const handleDateClick = (arg: any) => {
    if (!canCreate()) {
      return;
    }

    if (onCreateClass) {
      onCreateClass(arg.dateStr);
    } else {
      router.push(
        `/classes/new?date=${arg.dateStr}&branch=${user?.branchId || "b-default"}`,
      );
    }
  };

  // Cuando se hace click en un evento para ver detalles
  const handleEventClick = (info: any) => {
    const event = events.find((e) => e.id === info.event.id);
    if (!event) {
      return;
    }

    if (onViewClass) {
      onViewClass(event.id);
    } else {
      router.push(`/classes/${event.id}`);
    }
  };

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <select
          className="border rounded px-2 py-1"
          value={typeFilter ?? ""}
          onChange={(e) => setTypeFilter(e.target.value || null)}
        >
          <option value="">Todos los tipos</option>
          <option value="Yoga">Yoga</option>
          <option value="Spinning">Spinning</option>
          <option value="Zumba">Zumba</option>
        </select>

        <select
          className="border rounded px-2 py-1"
          value={instructorFilter ?? ""}
          onChange={(e) => setInstructorFilter(e.target.value || null)}
        >
          <option value="">Todos los instructores</option>
          <option value="i-ana-gomez">Ana Gómez</option>
          <option value="i-carlos-perez">Carlos Pérez</option>
        </select>

        <select
          className="border rounded px-2 py-1"
          value={branchFilter ?? ""}
          onChange={(e) => setBranchFilter(e.target.value || null)}
        >
          <option value="">Todas las sucursales</option>
          <option value="b-centro">Centro</option>
          <option value="b-norte">Norte</option>
        </select>
      </div>

      {/* Calendario */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="90vh"
        selectable={canCreate()}
        editable={false}
        displayEventTime={true}
        headerToolbar={{
          left: "dayGridMonth,timeGridWeek,timeGridDay",
          center: "title",
          right: "today prev,next",
        }}
        dayHeaderFormat={{ weekday: "short" }}
        events={visibleEvents}
        eventContent={(arg) => {
          const eventData = arg.event.extendedProps as GymClass;
          const color = classColors[eventData.type] ?? "#e2e8f0";

          const startTime = new Date(arg.event.start!).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const endTime = new Date(arg.event.end!).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              className="rounded-lg p-3 text-sm text-gray-900 hover:opacity-95 transition-opacity shadow-sm"
              style={{ backgroundColor: color }}
            >
              <div className="font-semibold text-base">{eventData.title}</div>
              <div className="text-gray-700">
                {startTime} - {endTime}
              </div>
              <div className="text-gray-600">
                Instructor: {eventData.instructorName || "N/A"}
              </div>
              <div className="text-gray-600">
                Capacidad: {eventData.maxCapacity}
              </div>
            </div>
          );
        }}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        dayCellDidMount={(info) => {
          const today = new Date();
          if (info.date.toDateString() === today.toDateString()) {
            info.el.style.backgroundColor = "#f3f4f6";
            info.el.style.borderRadius = "0.5rem";
          }
        }}
      />
    </>
  );
}
