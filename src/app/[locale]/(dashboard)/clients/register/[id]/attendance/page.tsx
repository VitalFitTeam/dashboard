"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale"; 
import { Calendar as CalendarIcon, CalendarX, RefreshCcw } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import AttendanceTable from "@/components/modules/clients/AttendanceTable";
import { useAuth } from "@/context/AuthContext";
import { useClientAttendance } from "@/hooks/clients/useClientAttendance";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ClientAttendancePage() {
  const t = useTranslations("clients.AttendanceHistory");
  const locale = useLocale();
  const params = useParams();
  const { token } = useAuth();
  const dateLocale = locale === "es" ? es : enUS;

  const userId = params.id as string;
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const {
    attendance,
    totalPages,
    isLoading,
    isSyncing,
    isError,
    mutate
  } = useClientAttendance(userId, token, {
    page,
    limit: 10,
    start: startDate ? startDate.toISOString() : undefined,
    end: endDate ? endDate.toISOString() : undefined,
  });

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-end gap-4">
          <div className="flex flex-col gap-1 lg:flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
              {t("filters.from")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 border-gray-200 shadow-none",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {startDate ? format(startDate, "dd MMM yyyy", { locale: dateLocale }) : t("filters.placeholder")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {date.setHours(0, 0, 0, 0);}
                    setStartDate(date);
                    setPage(1);
                  }}
                  locale={dateLocale} 
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1 lg:flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
              {t("filters.until")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 border-gray-200 shadow-none",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {endDate ? format(endDate, "dd MMM yyyy", { locale: dateLocale }) : t("filters.placeholder")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    if (date) {
                      date.setHours(23, 59, 59, 999);
                    }
                    setEndDate(date);
                    setPage(1);
                  }}
                  locale={dateLocale}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 lg:w-auto">
            {(startDate || endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="flex-1 lg:flex-none text-red-500 border-red-100 hover:bg-red-50 h-10 transition-colors"
              >
                <CalendarX className="h-4 w-4 mr-1.5" />
                {t("filters.clear")}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => mutate()}
              disabled={isLoading || isSyncing}
              className="h-10 w-10 border border-gray-100 lg:border-none"
            >
              <RefreshCcw 
                className={cn(
                  "h-4 w-4 text-gray-400",
                  isSyncing && "animate-spin text-orange-500"
                )} 
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {isError ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <div className="bg-red-50 p-3 rounded-full">
               <CalendarX className="h-6 w-6 text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="text-gray-800 font-semibold">{t("states.errorTitle")}</p>
              <p className="text-sm text-gray-500">{t("states.errorSubtitle")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => mutate()} className="text-xs">
              {t("states.retry")}
            </Button>
          </div>
        ) : (
          <AttendanceTable
            data={attendance}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {!isLoading && !isError && isSyncing && (
        <div className="flex items-center justify-center gap-2 text-[10px] text-orange-500 font-bold uppercase tracking-widest animate-pulse">
          <div className="h-1.5 w-1.5 bg-orange-500 rounded-full" />
          {t("states.loading")}
        </div>
      )}
    </div>
  );
}