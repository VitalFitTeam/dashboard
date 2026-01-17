"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import {
  Inbox,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function ActivityNotifications() {
  const { token } = useAuth();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    isLoading,
    unreadCount,
    hasMore,
    loadMore,
  } = useNotifications(token || "");

  const formatMessage = (msg: string) => msg.replace(/\.\d+s/, "s");

  if (isLoading && notifications.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="flex items-center justify-between pb-4 border-b border-muted/50">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-foreground">
            Actividad Reciente
          </h4>
          {unreadCount > 0 && (
            <Badge className="bg-orange-500 hover:bg-orange-600 h-5 px-1.5 rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-semibold transition-colors"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Marcar todo leído
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 mt-4 pr-4">
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Bandeja limpia
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
                No tienes notificaciones pendientes por el momento.
              </p>
            </div>
          ) : (
            <>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={cn(
                    "group relative p-4 rounded-xl border transition-all duration-300",
                    !n.is_read
                      ? "bg-orange-50/40 border-orange-100 shadow-sm ring-1 ring-orange-500/10"
                      : "bg-background border-muted/40 opacity-70 hover:opacity-100 hover:border-muted hover:shadow-sm",
                  )}
                >
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {!n.is_read ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.5)] animate-pulse" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm tracking-tight truncate",
                            !n.is_read
                              ? "font-bold text-foreground"
                              : "font-medium text-muted-foreground",
                          )}
                        >
                          {n.title}
                        </span>
                        <div className="flex items-center text-[10px] text-muted-foreground/70 font-medium whitespace-nowrap">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2">
                        {formatMessage(n.message)}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-black h-4 px-1.5 uppercase bg-white border border-muted text-muted-foreground group-hover:border-orange-200 transition-colors"
                          >
                            {n.metadata?.service_name || "VitalFit"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                            #{n.metadata?.booking_id?.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        {!n.is_read && (
                          <span className="text-[10px] text-orange-600 font-bold transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                            Archivar →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="pt-2 pb-6">
                  <Button
                    variant="outline"
                    className="w-full border-dashed text-xs text-muted-foreground hover:text-orange-600 transition-colors"
                    onClick={loadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                      <ChevronDown className="h-3 w-3 mr-2" />
                    )}
                    Cargar actividades anteriores
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="pt-4 border-t border-muted/50">
        <p className="text-[10px] text-muted-foreground text-center italic">
          Las actividades se conservan por 30 días
        </p>
      </div>
    </div>
  );
}
