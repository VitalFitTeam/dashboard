"use client";

import React, { forwardRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { User, Lock, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl"; // Importamos el hook
import { cn } from "@/lib/utils";

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
            const { instructorName, is_visible, isBookedByClient } =
              eventInfo.event.extendedProps || {};

            const isWeekView = eventInfo.view.type.includes("timeGrid");
            
            const isAnyFocused = eventInfo.event.classNames.includes("event-dimmed") || 
                                 eventInfo.event.classNames.includes("event-highlighted");

            return (
              <div
                className={cn(
                  "flex flex-col h-full w-full p-1.5 rounded-md border transition-all duration-300 shadow-sm",
                  "border-l-[4px]",
                  isBookedByClient 
                    ? "bg-green-50 border-green-200 border-l-green-500 text-green-900 ring-1 ring-green-600/10 scale-[1.02] z-10 shadow-md" 
                    : "bg-orange-50 border-orange-100 border-l-orange-400 text-orange-900",

                  isAnyFocused && !isBookedByClient && "bg-slate-50 border-slate-200 border-l-slate-300 text-slate-400 shadow-none opacity-60",
                  
                  !is_visible && "opacity-30 grayscale",
                  "hover:brightness-95 cursor-pointer",
                  !isWeekView && "py-0.5 px-1"
                )}
              >
                <div className="flex items-center justify-between gap-1 overflow-hidden">
                  <div
                    className={cn(
                      "font-bold truncate flex items-center gap-1",
                      isWeekView ? "text-[11px] leading-tight" : "text-[10px] leading-none",
                      isAnyFocused && !isBookedByClient && "text-slate-500 font-medium"
                    )}
                  >
                    {!is_visible && <Lock className="w-2.5 h-2.5" />}
                    {eventInfo.event.title || t("default_title")}
                  </div>
                  
                  {isBookedByClient && (
                    <div className="bg-green-600 rounded-full p-0.5 shrink-0 shadow-sm animate-in zoom-in-50">
                       <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                {isWeekView && (
                  <div className={cn(
                    "text-[9px] mt-1 flex flex-col font-medium",
                    isBookedByClient ? "text-green-700/80" : "text-orange-800/70",
                    isAnyFocused && !isBookedByClient && "text-slate-400/80"
                  )}>
                    <span className="flex items-center gap-1">
                      {eventInfo.timeText}
                    </span>
                  </div>
                )}
              </div>
            );
          }}

          {...props}
        />

        <style jsx global>{`
          .fc-scroller::-webkit-scrollbar { width: 4px; }
          .fc-scroller::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
          
          .fc {
            --fc-border-color: #f3f4f6;
            --fc-today-bg-color: #f9fafb;
            font-family: inherit !important;
          }

          .fc .fc-col-header-cell-cushion {
            text-decoration: none !important;
            color: #6b7280 !important;
            font-weight: 600;
            font-size: 12px;
            padding: 12px 0 !important;
          }

          .fc .fc-timegrid-slot {
            height: 4.5rem !important;
            border-bottom: 1px solid #f9fafb !important;
          }
          
          .fc .fc-timegrid-slot-label-cushion {
            font-size: 10px !important;
            color: #9ca3af !important;
          }

          .fc-timegrid-event, .fc-daygrid-event {
            background: none !important;
            border: none !important;
            padding: 2px 4px !important;
          }

          .event-dimmed {
            z-index: 1 !important;
            transition: all 0.4s ease;
          }

          .event-highlighted {
            z-index: 100 !important;
          }

          .fc .fc-timegrid-now-indicator-line {
            border-color: #ef4444 !important;
            border-width: 2px 0 0 !important;
          }
        `}</style>
      </div>
    );
  }
);

CalendarDisplay.displayName = "CalendarDisplay";