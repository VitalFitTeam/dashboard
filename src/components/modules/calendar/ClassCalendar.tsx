"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { useAuth } from "@/context/AuthContext";
import { useSWRConfig } from "swr";
import { format, parseISO } from "date-fns";
import { useBranchCalendar } from "@/hooks/class/useBranchCalendar";
import { useCalendarResources } from "@/hooks/class/useCalendarResources";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarDisplay } from "./CalendarDisplay";
import { CreateClassSheet } from "./CreateClassSheet";
import { EditClassPopover } from "./EditClassPopover";
import { useTranslations } from "next-intl";

export function ClassCalendar() {
  const { token, user } = useAuth();
  const { mutate } = useSWRConfig();
  const calendarRef = useRef<FullCalendar>(null);

  const tToolbar = useTranslations("calendar.toolbar");
  const tDisplay = useTranslations("calendar.display");

  const isSuperAdmin = useMemo(() => user?.role === "super_admin", [user]);

  const activeBranchId = useMemo(() => {
    const val = user?.activeBranch || user?.branch_id;
    if (!val) {
      return "";
    }
    return typeof val === "string" ? val : val.id;
  }, [user?.activeBranch, user?.branch_id]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [selectedBranchId, setSelectedBranchId] = useState<string>(activeBranchId);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { branches, services, instructors, isLoadingResources } =
    useCalendarResources(token, selectedBranchId);

  const filteredBranches = useMemo(() => {
    if (isSuperAdmin) {
      return branches;
    }
    return branches.filter(b => b.branch_id === activeBranchId);
  }, [branches, isSuperAdmin, activeBranchId]);

  useEffect(() => {
    if (activeBranchId && !isSuperAdmin && activeBranchId !== selectedBranchId) {
      setSelectedBranchId(activeBranchId);
    } else if (!selectedBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0].branch_id);
    }
  }, [activeBranchId, isSuperAdmin, branches, selectedBranchId]);

  const [isBranchSyncing, setIsBranchSyncing] = useState(false);
  const prevBranchRef = useRef<string | null>(null);

  const { scheduleMap, isLoading: isLoadingClasses } = useBranchCalendar(
    selectedBranchId || null,
    token || ""
  );

  useEffect(() => {
    if (selectedBranchId && prevBranchRef.current && prevBranchRef.current !== selectedBranchId) {
      setIsBranchSyncing(true);
    }
    if (!isLoadingResources && !isLoadingClasses) {
      setIsBranchSyncing(false);
      prevBranchRef.current = selectedBranchId;
    }
  }, [selectedBranchId, isLoadingResources, isLoadingClasses]);

  const events = useMemo(() => {
    return Object.values(scheduleMap)
      .flat()
      .map((item) => {
        const serviceInfo = services.find((s) => s.service_id === item.service_id);
        const instructorInfo = instructors.find(
          (i) => (i as any).instructorID === item.instructor_id || (i as any).instructor_id === item.instructor_id
        );

        const startDate = parseISO(item.starts_at);
        const endDate = parseISO(item.ends_at);

        return {
          id: item.class_id,
          title: serviceInfo?.service_name || tDisplay("default_title"),
          start: startDate,
          end: endDate,
          extendedProps: {
            ...item,
            serviceName: serviceInfo?.service_name,
            instructorName: (instructorInfo as any)?.instructorName || (instructorInfo as any)?.name || tDisplay("no_instructor"),
            displayTime: `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`,
          },
        };
      });
  }, [scheduleMap, services, instructors, tDisplay]);

  const navigation = {
    next: () => calendarRef.current?.getApi().next(),
    prev: () => calendarRef.current?.getApi().prev(),
    today: () => calendarRef.current?.getApi().today(),
    changeView: (view: string) => {
      calendarRef.current?.getApi().changeView(view);
      setCurrentView(view);
    },
  };

  const handleViewChange = (info: any) => {
    setCurrentDate(info.view.currentStart);
    setCurrentView(info.view.type);
  };

  const refreshData = () => {
    mutate((key) => Array.isArray(key) && key.includes("schedule") && key.includes(selectedBranchId));
  };

  return (
    <div className="flex flex-col h-[85vh] bg-white rounded-xl overflow-hidden border shadow-sm">
      <CalendarToolbar
        currentDate={currentDate}
        currentView={currentView}
        branches={filteredBranches}
        selectedBranchId={selectedBranchId}
        onBranchChange={isSuperAdmin ? setSelectedBranchId : () => {}}
        onNavigate={navigation}
        isLoading={isBranchSyncing}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <div className="flex-1 relative">
        {isBranchSyncing && (
          <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {tToolbar("syncing")}
              </p>
            </div>
          </div>
        )}

        <CalendarDisplay
          ref={calendarRef}
          events={events}
          onEventClick={(id: string) => {
            setSelectedClassId(id);
            setIsEditModalOpen(true);
          }}
          onViewChange={handleViewChange}
        />
      </div>

      {isCreateModalOpen && (
        <CreateClassSheet
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={refreshData}
        />
      )}

      {isEditModalOpen && selectedClassId && (
        <EditClassPopover
          classId={selectedClassId}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClassId(null);
          }}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}