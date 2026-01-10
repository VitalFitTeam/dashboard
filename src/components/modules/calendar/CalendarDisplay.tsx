"use client";

import React, { forwardRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { User, Lock } from "lucide-react";

interface CalendarDisplayProps {
  events: any[];
  onEventClick: (classId: string) => void;
  onDateClick?: (date: string) => void;
  onViewChange?: (info: any) => void;
  [key: string]: any;
}

export const CalendarDisplay = forwardRef<FullCalendar, CalendarDisplayProps>(
  (
    {
      events,
      onEventClick,
      onDateClick,
      onViewChange,
      ...props
    },
    ref
  ) => {

    const memoizedEvents = useMemo(() => events, [events]);

    return (
      <div className="calendar-notion-theme h-full w-full bg-white overflow-hidden flex flex-col border rounded-xl shadow-sm">
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={esLocale}
          events={memoizedEvents}
          height="100%"
          contentHeight="100%"
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          scrollTime="08:00:00"
          stickyHeaderDates
          handleWindowResize
          headerToolbar={false}
          dayHeaderFormat={{ weekday: "short", day: "numeric" }}
          nowIndicator

          dateClick={(info) => onDateClick?.(info.dateStr)}
          datesSet={onViewChange}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            onEventClick(String(info.event.id));
          }}

          eventContent={(eventInfo) => {
            const { instructor_name, is_visible } =
              eventInfo.event.extendedProps || {};

            const isWeekView =
              eventInfo.view.type.includes("timeGrid");

            return (
              <div
                className={cn(
                  "flex flex-col h-full w-full p-1.5 rounded-md border-l-[3px] shadow-sm transition-all",
                  "bg-orange-50 border-orange-400 text-orange-900",
                  !is_visible
                    ? "opacity-40 grayscale"
                    : "hover:brightness-95 cursor-pointer",
                  !isWeekView && "py-0.5 px-1 border-l-[2px]"
                )}
              >

                <div
                  className={cn(
                    "font-semibold truncate flex items-center gap-1",
                    isWeekView
                      ? "text-[11px] leading-tight"
                      : "text-[10px] font-bold leading-none"
                  )}
                >
                  {!is_visible && <Lock className="w-2.5 h-2.5" />}
                  {eventInfo.event.title}
                </div>

                {isWeekView && (
                  <div className="text-[9px] opacity-75 mt-0.5 flex flex-col">
                    <span className="font-medium">
                      {eventInfo.timeText}
                    </span>
                    {instructor_name && (
                      <span className="truncate italic flex items-center gap-1 mt-0.5">
                        <User className="w-2.5 h-2.5" />
                        {instructor_name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }}

          {...props}
        />

        <style jsx global>{`
          .fc-scroller::-webkit-scrollbar {
            width: 4px;
          }
          .fc-scroller::-webkit-scrollbar-thumb {
            background: #e5e7eb;
            border-radius: 10px;
          }
          .fc {
            --fc-border-color: #f1f1f1;
            --fc-today-bg-color: transparent;
            font-family: inherit !important;
          }
          .fc .fc-timegrid-slot {
            height: 4rem !important;
            border-bottom: 1px solid #f9f9f9 !important;
          }
          .fc .fc-col-header-cell-cushion {
            text-decoration: none !important;
            color: #91918e !important;
            font-weight: 500;
            font-size: 13px;
            padding: 10px 0 !important;
          }
          .fc .fc-timegrid-now-indicator-line {
            border-color: #eb5757 !important;
            border-width: 2px 0 0 !important;
          }
          .fc .fc-day-today .fc-daygrid-day-number {
            background-color: #eb5757;
            color: white !important;
            border-radius: 4px;
            padding: 2px 6px !important;
          }
          .fc-timegrid-event,
          .fc-daygrid-event {
            background: none !important;
            border: none !important;
          }
        `}</style>
      </div>
    );
  }
);

CalendarDisplay.displayName = "CalendarDisplay";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
