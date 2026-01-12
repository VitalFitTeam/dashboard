"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import AudithTable from "@/components/modules/audith/AudithTable";
import { LogDetailsSheet } from "@/components/modules/audith/LogDetailsSheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search, SlidersHorizontal, ArrowUpDown, ListFilter } from "lucide-react";
import { AuditLog } from "@vitalfit/sdk";
import { useAuditLogs } from "@/hooks/audith/useAuditLogs";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SecuritySessionsDialog } from "@/components/modules/audith/SecuritySessionsDialog";

export default function AudithPage() {
  const t = useTranslations("user.audit");
  const { token, user } = useAuth();

  // Estados de Filtros y Paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Estados para Nivel 3 (Detalle de Log)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Estados para Nivel 4 (Gestión de Sesiones)
  const [sessionTargetUserId, setSessionTargetUserId] = useState<string | null>(null);
  const [isSessionsDialogOpen, setIsSessionsDialogOpen] = useState(false);

  // Lógica de Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Memorización de filtros para el SDK
  const filters = useMemo(() => ({
    page,
    limit,
    sort,
    search: debouncedSearch || undefined
  }), [page, limit, sort, debouncedSearch]);

  // Consumo del Hook de Auditoría
  const { logs, totalPages, isLoading } = useAuditLogs(
    token || "",
    user?.user_id || "",
    filters
  );

  // Función para abrir el gestor de sesiones desde el Sheet o la Tabla
  const handleViewSessions = (userId: string) => {
    setSessionTargetUserId(userId);
    setIsSessionsDialogOpen(true);
  };

  if (!token || !user) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {/* Panel de Filtros */}
      <Card className="border-none bg-zinc-50/50 dark:bg-zinc-900/50 shadow-none border-b">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            
            {/* Input de Búsqueda */}
            <div className="flex-1 space-y-2">
              <label className="text-[11px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Search className="h-3 w-3" /> {t("filters.search")}
              </label>
              <div className="relative">
                <Input
                  placeholder={t("filters.searchPlaceholder")}
                  className="h-9 pl-4 bg-background"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Selector de Orden */}
            <div className="w-full md:w-40 space-y-2">
              <label className="text-[11px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <ArrowUpDown className="h-3 w-3" /> {t("filters.sort")}
              </label>
              <Select value={sort} onValueChange={(v: "asc" | "desc") => setSort(v)}>
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">{t("filters.sortDesc")}</SelectItem>
                  <SelectItem value="asc">{t("filters.sortAsc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Límite */}
            <div className="w-full md:w-32 space-y-2">
              <label className="text-[11px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-3 w-3" /> {t("filters.limit")}
              </label>
              <Select 
                value={String(limit)} 
                onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}
              >
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {t("filters.limitRows", { count: num })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ListFilter className="h-4 w-4" />
            {t("status.results")}
            {isLoading && (
              <span className="ml-2 animate-pulse text-primary text-[10px] font-bold uppercase">
                {t("status.loading")}
              </span>
            )}
          </div>
        </div>
        
        <AudithTable
          data={logs}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          limit={limit}
          onViewDetails={(log) => {
            setSelectedLog(log);
            setIsSheetOpen(true);
          }}
        />
      </div>

      <LogDetailsSheet
        log={selectedLog}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onViewSessions={handleViewSessions}
      />

      <SecuritySessionsDialog
        userId={sessionTargetUserId}
        open={isSessionsDialogOpen}
        onOpenChange={setIsSessionsDialogOpen}
      />
    </div>
  );
}