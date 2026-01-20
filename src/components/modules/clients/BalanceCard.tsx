"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Ticket, AlertCircle } from "lucide-react";

interface BalanceCardProps {
  data: {
    balance: number;
    updated_at: string;
    service: {
      Name: string;
      IsFeatured: boolean;
      DurationMinutes: number;
      Category?: { Name: string };
    };
  };
}

export const BalanceCard = ({ data }: BalanceCardProps) => {
  const t = useTranslations("clients.balances.status");
  const { balance, service, updated_at } = data;
  
  const serviceName = service.Name || t("defaultServiceName");
  const isLowBalance = balance <= 5 && balance > 0;
  const isEmpty = balance === 0;

  return (
    <Card className={cn(
      "relative border-none shadow-xl rounded-[2rem] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
      isEmpty ? "bg-zinc-100/50 dark:bg-zinc-900/50 opacity-80" : "bg-white dark:bg-zinc-950"
    )}>
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 transition-colors",
        isEmpty ? "bg-zinc-400" : isLowBalance ? "bg-orange-500" : "bg-primary"
      )} />

      <CardContent className="p-0 text-left">
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1.5">
              <Badge 
                variant="secondary" 
                className="text-[9px] font-black uppercase tracking-[0.15em] py-0.5 px-2 bg-zinc-100 dark:bg-zinc-800"
              >
                {service.Category?.Name || t("fitnessService")}
              </Badge>
              <h3 className="text-xl font-black italic uppercase tracking-tighter leading-tight max-w-[180px] truncate">
                {serviceName}
              </h3>
            </div>
            
            {service.IsFeatured && (
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-[8px] font-black uppercase text-primary tracking-widest">VIP</span>
              </div>
            )}
          </div>
          <div className="flex items-end justify-between relative z-10">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-6xl font-black italic tracking-tighter transition-colors",
                isEmpty ? "text-zinc-400" : isLowBalance ? "text-orange-500" : "text-primary"
              )}>
                {balance}
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-muted-foreground leading-none">
                  {t("credits")}
                </span>
                <Ticket className={cn(
                  "h-4 w-4 mt-1",
                  isEmpty ? "text-zinc-300" : isLowBalance ? "text-orange-300" : "text-primary/30"
                )} />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">{t("duration")}</span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-xs font-black italic shadow-sm">
                    <Clock className="h-3 w-3 text-primary" /> 
                    {service.DurationMinutes} MIN
                </div>
            </div>
          </div>
        </div>

        <div className={cn(
          "px-6 py-3 flex items-center justify-between border-t transition-colors",
          isEmpty 
            ? "bg-zinc-200/50 text-zinc-500 border-zinc-300/50" 
            : isLowBalance 
              ? "bg-orange-500 text-white border-orange-600/20 shadow-[0_-10px_20px_-10px_rgba(249,115,22,0.3)]" 
              : "bg-primary text-primary-foreground border-primary-foreground/10 shadow-[0_-10px_20px_-10px_rgba(var(--primary),0.3)]"
        )}>
          <div className="flex items-center gap-2">
            {isLowBalance && <AlertCircle className="h-3.5 w-3.5 animate-bounce" />}
            <span className="text-[10px] font-black uppercase tracking-[0.1em] italic">
              {isEmpty ? t("empty") : isLowBalance ? t("critical") : t("available")}
            </span>
          </div>
          <div className="flex flex-col items-end opacity-80">
            <span className="text-[7px] font-black uppercase tracking-widest">{t("lastUpdate")}</span>
            <span className="text-[9px] font-bold">
               {new Date(updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};