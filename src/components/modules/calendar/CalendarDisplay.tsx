"use client";

import React, { forwardRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Lock, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface CalendarDisplayProps {
  events: any[];
  onEventClick: (classId: string) => void;
  onDateClick?: (date: string) => void;
  onViewChange?: (info: any) => void;
  [key: string]: any;
}

export const CalendarDisplay = forwardRef<FullCalendar, CalendarDisplayProps>(
  ({ events, onEventClick, onDateClick, onViewChange, ...props }, ref) => {
    const t = useTranslations("calendar.display");
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
          handleWindowResize={true}
          windowResizeDelay={0}
          headerToolbar={false}
          nowIndicator={true}
          views={{
            dayGridMonth: {
              dayHeaderFormat: { weekday: "long" }, 
            },
            timeGridWeek: {
              dayHeaderFormat: { 
                weekday: "short", 
                day: "numeric", 
                month: "short", 
                omitCommas: true 
              },
            },
            timeGridDay: {
              dayHeaderFormat: { weekday: "long", day: "numeric" },
            }
          }}

          dateClick={(info) => onDateClick?.(info.dateStr)}
          datesSet={onViewChange}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            onEventClick(String(info.event.id));
          }}

          eventContent={(eventInfo) => {
            const { is_visible, isBookedByClient } =
              eventInfo.event.extendedProps || {};

            const isWeekView = eventInfo.view.type.includes("timeGrid");
            const isAnyFocused =
              eventInfo.event.classNames.includes("event-dimmed") ||
              eventInfo.event.classNames.includes("event-highlighted");

            return (
              <div
                className={cn(
                  "flex flex-col h-full w-full p-1 sm:p-1.5 rounded-md border transition-all duration-300 shadow-sm",
                  "border-l-[3px] sm:border-l-[4px]",
                  isBookedByClient
                    ? "bg-green-50 border-green-200 border-l-green-500 text-green-900 ring-1 ring-green-600/10 scale-[1.01] sm:scale-[1.02] z-10 shadow-md"
                    : "bg-orange-50 border-orange-100 border-l-orange-400 text-orange-900",
                  isAnyFocused && !isBookedByClient && "bg-slate-50 border-slate-200 border-l-slate-300 text-slate-400 shadow-none opacity-60",
                  !is_visible && "opacity-30 grayscale",
                  "hover:brightness-95 cursor-pointer overflow-hidden"
                )}
              >
                <div className="flex items-center justify-between gap-1 overflow-hidden">
                  <div
                    className={cn(
                      "font-bold truncate flex items-center gap-0.5 sm:gap-1",
                      isWeekView ? "text-[9px] sm:text-[11px] leading-tight" : "text-[10px] leading-none",
                      isAnyFocused && !isBookedByClient && "text-slate-500 font-medium",
                    )}
                  >
                    {!is_visible && <Lock className="w-2 sm:w-2.5 h-2 sm:h-2.5 shrink-0" />}
                    <span className="truncate uppercase sm:normal-case">
                      {eventInfo.event.title || t("default_title")}
                    </span>
                  </div>

                  {isBookedByClient && (
                    <div className="bg-green-600 rounded-full p-0.5 shrink-0 shadow-sm animate-in zoom-in-50">
                      <CheckCircle2 className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-white" />
                    </div>
                  )}
                </div>


                {isWeekView && (
                  <div
                    className={cn(
                      "text-[8px] sm:text-[9px] mt-0.5 sm:mt-1 hidden xs:flex flex-col font-medium",
                      isBookedByClient ? "text-green-700/80" : "text-orange-800/70",
                      isAnyFocused && !isBookedByClient && "text-slate-400/80",
                    )}
                  >
                    <span>{eventInfo.timeText}</span>
                  </div>
                )}
              </div>
            );
          }}
          {...props}
        />

        <style jsx global>{`
          .fc-scroller::-webkit-scrollbar { width: 3px; }
          .fc-scroller::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }

          .fc {
            --fc-border-color: #f3f4f6;
            --fc-today-bg-color: #f9fafb;
            font-family: inherit !important;
          }

          /* Ajuste de slots para móviles */
          .fc .fc-timegrid-slot {
            height: 3.5rem !important; /* Más pequeño en móvil */
            border-bottom: 1px solid #f9fafb !important;
          }

          @media (min-width: 640px) {
            .fc .fc-timegrid-slot { height: 4.5rem !important; }
          }

          /* Encabezados */
          .fc .fc-col-header-cell-cushion {
            text-decoration: none !important;
            color: #6b7280 !important;
            font-weight: 600;
            font-size: 10px;
            padding: 8px 0 !important;
            text-transform: uppercase;
          }

          @media (min-width: 640px) {
            .fc .fc-col-header-cell-cushion { font-size: 12px; padding: 12px 0 !important; }
          }

          /* Estilos de eventos */
          .fc-timegrid-event, .fc-daygrid-event {
            background: none !important;
            border: none !important;
            padding: 1px 2px !important;
          }

          .event-dimmed { z-index: 1 !important; transition: all 0.4s ease; }
          .event-highlighted { z-index: 100 !important; }

          /* Indicador de hora actual */
          .fc .fc-timegrid-now-indicator-line {
            border-color: #ef4444 !important;
            border-width: 2px 0 0 !important;
          }
          
          /* Ocultar números de día en vista de mes si son muy grandes */
          .fc .fc-daygrid-day-number {
            font-size: 11px;
            padding: 4px !important;
            text-decoration: none !important;
            color: #9ca3af;
          }
        `}</style>
      </div>
    );
  },
);

CalendarDisplay.displayName = "CalendarDisplay";