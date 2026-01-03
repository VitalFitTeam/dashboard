"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; // Componente de Shadcn
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, User2 } from "lucide-react";
import { useBranchReport } from "@/hooks/reports/useBranchReport";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const UpcomingClassesCard = ({ token, branchId }: { token: string | null; branchId?: string }) => {
  const { data: response, isLoading } = useBranchReport.useUpcomingClasses(token, branchId);
  console.log("clases", response);
  
  const classes = response || [];

  const getTimeStatus = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffInMinutes = (start.getTime() - now.getTime()) / (1000 * 60);

    if (diffInMinutes <= 0 && diffInMinutes >= -60) {
        return { label: "En curso", variant: "error" as const };
    }
    if (diffInMinutes > 0 && diffInMinutes <= 30) {
        return { label: "Inicia pronto", variant: "default" as const };
    }
    return { label: "Programada", variant: "outline" as const };
  };

  return (
    <Card className="h-full border-none shadow-sm bg-white dark:bg-slate-950 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold">Clases de Hoy</CardTitle>
          <CardDescription>
            {classes.length} sesiones programadas
          </CardDescription>
        </div>
        <Badge variant="secondary" className="font-mono">
          {format(new Date(), "eee dd", { locale: es })}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : classes.length > 0 ? (
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-3">
              {classes.map((cls) => {
                const status = getTimeStatus(cls.start_time);
                return (
                  <div 
                    key={cls.class_id} 
                    className="group relative flex flex-col gap-2 p-4 rounded-xl border bg-card hover:bg-slate-50/50 transition-all border-slate-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm leading-none">{cls.class_name}</h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User2 className="mr-1 h-3 w-3" />
                          {cls.instructor_name}
                        </div>
                      </div>
                      <Badge variant={status.variant} className="text-[10px] px-2 py-0">
                        {status.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed">
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <div className="flex items-center text-slate-600">
                          <Clock className="mr-1 h-3.5 w-3.5 text-primary" />
                          {format(new Date(cls.start_time), "HH:mm")} - {format(new Date(cls.end_time), "HH:mm")}
                        </div>
                        <div className="flex items-center text-slate-500">
                          <Users className="mr-1 h-3.5 w-3.5" />
                          Cap. {cls.max_capacity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
             <Clock className="h-10 w-10 mb-2 opacity-20" />
             <p className="text-sm italic">No hay más clases para hoy</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};