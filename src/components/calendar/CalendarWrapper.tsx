"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { GymClass } from "./types";
import { mockClasses } from "./mockData";
import { ClassDetailsSidebar } from "./ClassDetailsSidebar";
import { DeleteClassDialog } from "./DeleteClassDialog";
import { ClassModal } from "./ClassModal";

import { classColors } from "@/styles/eventColors";

export function CalendarWrapper() {
  const [events, setEvents] = useState<GymClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    setEvents(mockClasses);
  }, []);

  const handleDateClick = (arg: any) => {
    setSelectedClass({
      id: "",
      title: "Nueva Clase",
      instructorId: "",
      start: arg.dateStr,
      end: arg.dateStr,
      type: "yoga",
      branchId: "b-default",
      maxCapacity: 20,
    });
    setOpenModal(true);
  };

  const handleEventClick = (info: any) => {
    const event = events.find((e) => e.id === info.event.id);
    if (event) {
      setSelectedClass(event);
      setOpenDetails(true);
    }
  };

  const handleSave = (gymClass: GymClass) => {
    if (!gymClass.id) {
      const newClass = { ...gymClass, id: String(Date.now()) };
      setEvents([...events, newClass]);
    } else {
      setEvents(events.map((c) => (c.id === gymClass.id ? gymClass : c)));
    }
    setOpenModal(false);
  };

  const handleDelete = () => {
    if (!selectedClass) {
      return;
    }
    setEvents(events.filter((e) => e.id !== selectedClass.id));
    setOpenDelete(false);
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="90vh"
        selectable={true}
        editable={false}
        displayEventTime={true}
        headerToolbar={{
          left: "dayGridMonth,timeGridWeek,timeGridDay",
          center: "title",
          right: "today prev,next",
        }}
        dayHeaderFormat={{ weekday: "short" }}
        events={events}
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

      <ClassModal
        open={openModal}
        onOpenChange={setOpenModal}
        data={selectedClass}
        onSave={handleSave}
      />

      <ClassDetailsSidebar
        open={openDetails}
        onOpenChange={setOpenDetails}
        data={selectedClass}
        onEdit={() => {
          setOpenDetails(false);
          setOpenModal(true);
        }}
        onDelete={() => {
          setOpenDetails(false);
          setOpenDelete(true);
        }}
      />

      <DeleteClassDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        onConfirm={handleDelete}
      />
    </>
  );
}
