"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, UserMinus, Loader2, ShieldCheck } from "lucide-react"; 
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { format, parseISO } from "date-fns";
import { useBookingOperations } from "@/hooks/booking/useBookingOperations";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  data: any[]; 
  isLoading: boolean;
  classId: string;
  token: string;
  refresh: () => void;
  total?: number;
  onPageChange?: (page: number) => void; 
  currentPage?: number;
  canManage?: boolean; 
}

export function BookingAttendanceManager({ 
  data, 
  isLoading, 
  classId, 
  token, 
  refresh,
  total = 0,
  onPageChange,
  currentPage = 1,
  canManage = false 
}: Props) {
  const t = useTranslations("calendar.attendance_manager");
  const [activeTab, setActiveTab] = useState("reservas");
  
  const { cancel: cancelBooking, isProcessing } = useBookingOperations(token);
  
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const onHandleCancel = async (bookingId: string) => {
    if (!canManage || isProcessing) {
      return; 
    }

    try {
      const success = await cancelBooking(bookingId);
      if (success) {
        refresh(); 
        toast.success(t("status.cancelled"));
      }
    } catch (err) {
      console.error("Error in cancel operation:", err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: t("columns.student"),
      accessor: "first_name",
      render: (_, row) => (
        <div className="flex flex-col py-1 text-left">
          <span className="font-bold text-slate-900 leading-none">
            {row.user_name || `${row.first_name} ${row.last_name}`}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 italic">
            {row.user_email || row.email}
          </span>
        </div>
      ),
    },
    {
      header: t("columns.check_in"),
      accessor: "check_in_time",
      render: (value) => (
        <span className="text-xs font-medium text-slate-600">
          {value ? format(parseISO(value as string), "HH:mm 'hs'") : "---"}
        </span>
      ),
    },
    {
      header: t("columns.status"),
      accessor: "status",
      render: (value) => {
        const status = value as string;
        const config: Record<string, { class: string; label: string }> = {
          Confirmed: { class: "bg-orange-50 text-orange-700 border-orange-200", label: t("status.confirmed") },
          Attended: { class: "bg-emerald-50 text-emerald-700 border-emerald-200", label: t("status.attended") },
          Missed: { class: "bg-red-50 text-red-700 border-red-200", label: t("status.missed") },
          CancelledByUser: { class: "bg-slate-100 text-slate-500 border-slate-200", label: t("status.cancelled") },
        };
        const current = config[status] || { class: "bg-slate-50", label: status };
        return (
          <Badge variant="outline" className={cn("font-bold shadow-none", current.class)}>
            {current.label}
          </Badge>
        );
      },
    },
  ];

  const filteredData = useMemo(() => {
    if (!data){
       return [];
    }
    return activeTab === "reservas" 
      ? data.filter((b) => b.status === "Confirmed")
      : data.filter((b) => ["Attended", "Missed", "CancelledByUser"].includes(b.status));
  }, [data, activeTab]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
          <TabsList className="bg-slate-100/80 p-1 rounded-xl">
            <TabsTrigger value="reservas" className="text-xs font-bold px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all uppercase tracking-tighter">
              {t("tabs.bookings")}
            </TabsTrigger>
            <TabsTrigger value="asistencia" className="text-xs font-bold px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all uppercase tracking-tighter">
              {t("tabs.attendance")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
          {t("labels.total_students", { count: total })}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        rowIdKey="booking_id"
        page={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={onPageChange}
        actions={(row) => (
          <div className="flex justify-end gap-2 pr-2">
            {row.status === "Confirmed" ? (
              canManage ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={isProcessing}
                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg active:scale-90"
                  onClick={() => onHandleCancel(row.booking_id)}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                </Button>
              ) : (
                <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100 text-[9px] uppercase font-black">
                  {t("labels.active_booking")}
                </Badge>
              )
            ) : (
              <span className="text-[10px] font-bold text-slate-400 italic pr-2">{t("labels.processed")}</span>
            )}
          </div>
        )}
      />

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 mt-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
          {canManage ? <Info className="w-4 h-4 text-orange-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-slate-800 font-bold leading-none">
            {canManage ? t("info_panel.admin_title") : t("info_panel.instructor_title")}
          </p>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
            {canManage ? t("info_panel.admin_desc") : t("info_panel.instructor_desc")}
          </p>
        </div>
      </div>
    </div>
  );
}