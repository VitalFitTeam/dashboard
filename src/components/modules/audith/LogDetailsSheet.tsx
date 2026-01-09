"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AuditLog } from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Fingerprint,
  Globe,
  User,
  Terminal,
  Monitor,
  Code2,
  Copy,
  ShieldAlert,
  Hash,
  Mail,
  Smartphone,
  User2Icon,
} from "lucide-react";
import InfoBlock from "./InfoBlock";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUser } from "@/hooks/users/useGetUser";

interface LogDetailsSheetProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewSessions?: (userId: string) => void;
}

export function LogDetailsSheet({
  log,
  open,
  onOpenChange,
  onViewSessions,
}: LogDetailsSheetProps) {
  const t = useTranslations("user.audit.details");
  const { token } = useAuth();

  const { user: userData, loading: userLoading } = useGetUser(log?.user_id, token);

  if (!log) {
    return null;
  }

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const parsedPayload = (() => {
    if (!log.payload) {
        return null;
    }
    try {
      return typeof log.payload === "string" ? JSON.parse(log.payload) : log.payload;
    } catch { return log.payload; }
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 flex flex-col gap-0 border-l shadow-2xl overflow-hidden">
        
        <SheetHeader className={cn(
          "p-6 text-left border-b",
          log.status >= 400 ? "bg-red-50/30" : "bg-emerald-50/30"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                {log.method}
              </Badge>
              <Badge 
                variant={log.status >= 400 ? "warning" : "outline"} 
                className={cn("font-mono text-[10px]", log.status < 400 && "bg-background text-emerald-600 border-emerald-200")}
              >
                {log.status} {log.status >= 400 ? "●" : "✓"}
              </Badge>
            </div>
            <Button
              variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
              onClick={() => copyToClipboard(JSON.stringify(log, null, 2), t("payload.copied"))}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <SheetTitle className="text-xl font-bold">{t("title")}</SheetTitle>
          <SheetDescription className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground mt-1">
            <Hash className="h-3 w-3" /> {t("traceId")}: {log.id}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECCIÓN DE USUARIO DINÁMICA */}
          <Card className="border-none bg-zinc-50 dark:bg-zinc-900 shadow-none ring-1 ring-zinc-200 dark:ring-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage src={userData?.profile_picture_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userData ? `${userData.first_name[0]}${userData.last_name[0]}` : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    {userLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-bold leading-none">
                          {userData ? `${userData.first_name} ${userData.last_name}` : t("systemProcess")}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Mail className="h-3 w-3" /> {userData?.email || log.user_id}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <User2Icon className="h-3 w-3" /> {userData?.id || log.user_id}
                        </div>
                        {userData?.phone && (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Smartphone className="h-3 w-3" /> {userData.phone}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {log.user_id && onViewSessions && (
                  <Button 
                    variant="outline" size="sm" 
                    className="h-8 text-[11px] font-bold border-red-200 hover:bg-red-50 text-red-600"
                    onClick={() => onViewSessions(log.user_id!)}
                  >
                    <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                    {t("viewSessions")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoBlock icon={<Globe className="h-4 w-4 text-primary/60" />} label={t("metadata.endpoint")} value={log.path} isMono />
            <InfoBlock icon={<Calendar className="h-4 w-4 text-primary/60" />} label={t("metadata.dateTime")} value={new Date(log.created_at).toLocaleString()} />
            <InfoBlock icon={<Fingerprint className="h-4 w-4 text-primary/60" />} label={t("metadata.ipAddress")} value={log.ip_address} isMono />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase flex items-center gap-2 text-muted-foreground tracking-widest">
              <Code2 className="h-3.5 w-3.5" /> {t("payload.label")}
            </label>
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 overflow-hidden shadow-xl">
              <pre className="overflow-x-auto max-h-[250px] scrollbar-thin scrollbar-thumb-zinc-800">
                <code className="text-[11px] font-mono text-zinc-300">
                  {parsedPayload ? JSON.stringify(parsedPayload, null, 2) : t("payload.empty")}
                </code>
              </pre>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/40 border border-zinc-200/50">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("client.userAgent")}</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-500 break-words leading-relaxed">{log.user_agent || t("client.unknown")}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}