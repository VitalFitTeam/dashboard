"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useClientBalances } from "@/hooks/clients/useClientBalances";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, RefreshCw, Ticket, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalanceCard } from "./BalanceCard";
import { Input } from "@/components/ui/Input";

export const ClientServiceBalances = ({ userId, token }: { userId: string, token: string | null }) => {
  const t = useTranslations("clients.balances");
  const { balances, isLoading, refetch } = useClientBalances(userId, token);
  const [searchTerm, setSearchTerm] = useState("");

  const processedBalances = useMemo(() => {
    const filtered = balances.filter((b) => 
      b.service.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {

      if (a.balance === 0 && b.balance !== 0) {
        return -1;
      }
      if (a.balance !== 0 && b.balance === 0) {
        return 1;
      }

      if (a.balance <= 5 && b.balance > 5) {
        return -1;
      }
      if (a.balance > 5 && b.balance <= 5) {
        return 1;
      }

      if (a.service.IsFeatured && !b.service.IsFeatured){
         return -1;
      }
      if (!a.service.IsFeatured && b.service.IsFeatured) {
        return 1;
      }

      return 0;
    });
  }, [balances, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">
          {t("syncing")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            {t("walletTitle")}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-10 h-9 text-[11px] font-bold uppercase italic tracking-tighter bg-muted/30 border-none shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()} 
            className="h-9 w-9 hover:bg-primary/10"
            title={t("updateButton")}
          >
            <RefreshCw className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>

      {balances.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-3xl opacity-30">
          <Ticket className="h-12 w-12 mb-2" />
          <p className="text-[10px] font-black uppercase italic tracking-widest">{t("emptyWallet")}</p>
        </div>
      ) : processedBalances.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Ban className="h-10 w-10 mb-2 opacity-20" />
          <p className="text-[10px] font-black uppercase italic tracking-widest">{t("noResults")}</p>
        </div>
      ) : (
        <ScrollArea className="h-[520px] pr-4 -mr-4"> 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {processedBalances.map((item) => (
              <BalanceCard key={item.service_id} data={item} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};