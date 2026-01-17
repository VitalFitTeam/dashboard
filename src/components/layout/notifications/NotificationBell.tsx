"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import {
  Bell,
  CheckCheck,
  Inbox,
  MoreHorizontal,
  Loader2,
  ChevronDown,
  Calendar,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils"; 

export function NotificationBell() {
  const { token } = useAuth();
  const [displayLimit, setDisplayLimit] = useState(10);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
    hasMore,
    loadMore,
  } = useNotifications(token || "");

  const formatMessage = (msg: string) => msg.replace(/\.\d+s/, "s");

  const handleLoadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notifications.length <= displayLimit && hasMore) {
      loadMore();
    }
    setDisplayLimit((prev) => prev + 10);
  };

  const visibleNotifications = useMemo(
    () => notifications.slice(0, displayLimit),
    [notifications, displayLimit],
  );

  return (
    <Popover onOpenChange={(open) => !open && setDisplayLimit(10)}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-accent transition-all group"
        >
          <Bell
            className={cn(
              "h-5 w-5 transition-transform group-hover:rotate-12",
              unreadCount > 0
                ? "text-orange-600 fill-orange-50"
                : "text-muted-foreground",
            )}
          />

          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <Badge
                variant="error"
                className="relative flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-background p-0 text-[9px] font-black shadow-sm bg-orange-600"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[400px] p-0 shadow-2xl border-muted/40 overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-muted/50 to-background">
          <div className="space-y-1">
            <h3 className="font-bold text-sm tracking-tight">
              Actividad Reciente
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-medium bg-orange-50 text-orange-700 border-orange-100"
              >
                {unreadCount} pendientes
              </Badge>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-[11px] font-bold text-muted-foreground hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Leer todas
            </Button>
          )}
        </div>

        <Separator />

        <ScrollArea className="h-[450px]">
          <div className="flex flex-col">
            {isLoading && visibleNotifications.length === 0 ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-4 border-b space-y-3 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-12 bg-muted rounded" />
                    </div>
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                ))
            ) : visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-muted/5">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 rotate-3">
                  <Inbox className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <h4 className="text-sm font-bold">Sin novedades por ahora</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Te avisaremos cuando algo importante suceda.
                </p>
              </div>
            ) : (
              <>
                {visibleNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "group relative flex flex-col gap-2.5 p-4 transition-all border-b last:border-0",
                      !n.is_read
                        ? "bg-orange-50/20 hover:bg-orange-50/40"
                        : "hover:bg-muted/30 opacity-80",
                    )}
                  >
                    {!n.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 shadow-[2px_0_8px_rgba(234,88,12,0.3)]" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm leading-none tracking-tight",
                              !n.is_read
                                ? "font-bold text-foreground"
                                : "font-medium text-muted-foreground",
                            )}
                          >
                            {n.title}
                          </span>
                          {!n.is_read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug max-w-[280px]">
                          {formatMessage(n.message)}
                        </p>
                      </div>

                      <span className="text-[10px] font-medium text-muted-foreground/60 tabular-nums bg-muted/50 px-1.5 py-0.5 rounded">
                        {new Date(n.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-bold h-5 px-2 bg-background border-muted shadow-sm"
                        >
                          {n.type === "class_reminder" ? (
                            <Calendar className="w-2.5 h-2.5 mr-1" />
                          ) : (
                            <Dumbbell className="w-2.5 h-2.5 mr-1" />
                          )}
                          {n.metadata?.service_name || "Servicio"}
                        </Badge>

                        {n.metadata?.first_name && (
                          <div className="flex items-center gap-1.5 bg-background rounded-full pl-1 pr-2 py-0.5 border shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-orange-600 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                              {n.metadata.first_name[0]}
                            </div>
                            <span className="text-[10px] text-foreground font-semibold uppercase tracking-tighter">
                              {n.metadata.first_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {!n.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(n.id)}
                          className="h-7 px-2 text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-100/50 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                        >
                          Entendido
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {(hasMore || notifications.length > displayLimit) && (
                  <div className="p-4 bg-muted/5 border-t">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-bold gap-2 h-10 border-dashed hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-all"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      {displayLimit >= 30
                        ? "Ir al historial completo"
                        : "Cargar actividades anteriores"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-3 bg-muted/20">
          <Link href="/settings/profile?tab=activity" className="block">
            <Button
              variant="default"
              className="w-full text-xs font-bold h-10 shadow-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              Panel de Actividad Completo
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
