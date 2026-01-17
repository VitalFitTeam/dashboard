"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import {
  Bell,
  CheckCheck,
  Inbox,
  Loader2,
  ChevronDown,
  Calendar,
  Dumbbell,
  Circle,
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

  const formatMessage = (msg: string) => {
    if (!msg) {
      return "";
    }
    return msg.replace(/\.\d+s/, "s");
  };

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
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />

          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-medium text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-[380px] p-0 shadow-md border-border"
        align="end"
        sideOffset={8}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm leading-none">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 h-5 text-[10px] font-medium bg-orange-100 text-orange-700 hover:bg-orange-100 border-none"
              >
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              Marcar como leídas
            </Button>
          )}
        </div>

        <Separator />

        <ScrollArea className="h-[400px]">
          <div className="flex flex-col">
            {isLoading && visibleNotifications.length === 0 ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-4 border-b last:border-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-muted animate-pulse rounded-full" />
                      <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-3 w-full bg-muted animate-pulse rounded" />
                  </div>
                ))
            ) : visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <Inbox className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium">Bandeja limpia</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No tienes notificaciones pendientes.
                </p>
              </div>
            ) : (
              <>
                {visibleNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "group relative flex items-start gap-3 p-4 transition-colors border-b last:border-0 cursor-pointer",
                      !n.is_read
                        ? "bg-accent/40"
                        : "bg-transparent opacity-70 hover:opacity-100",
                    )}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      {!n.is_read ? (
                        <Circle className="h-2 w-2 fill-orange-600 text-orange-600" />
                      ) : (
                        <div className="h-2 w-2" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-none tracking-tight",
                            !n.is_read
                              ? "font-semibold"
                              : "font-medium text-muted-foreground",
                          )}
                        >
                          {n.title}
                        </p>
                        <time className="text-[10px] text-muted-foreground tabular-nums">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {formatMessage(n.message)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-medium px-1.5 h-4 uppercase tracking-wider text-muted-foreground bg-background"
                        >
                          {n.type === "class_reminder" ? (
                            <Calendar className="w-2 h-2 mr-1" />
                          ) : (
                            <Dumbbell className="w-2 h-2 mr-1" />
                          )}
                          {n.metadata?.service_name || "VitalFit"}
                        </Badge>
                        {n.metadata?.first_name && (
                          <span className="text-[10px] text-muted-foreground/60">
                            Por: {n.metadata.first_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <Button
                    variant="ghost"
                    className="w-full rounded-none h-12 text-xs font-medium border-t text-muted-foreground hover:text-foreground"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                      <ChevronDown className="h-3 w-3 mr-2" />
                    )}
                    Ver actividades anteriores
                  </Button>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-2">
          <Link href="/settings/profile?tab=activity" className="w-full">
            <Button
              variant="ghost"
              className="w-full justify-center text-xs h-9 font-medium"
            >
              Ver todo el historial
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
