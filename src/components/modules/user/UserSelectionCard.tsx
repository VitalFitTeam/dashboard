"use client";

import React from "react";
import { X, Mail, UserCheck, Loader2, User, IdCard, Target, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface UserSelectionCardProps {
  user: {
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    identity_document?: string;
    profile_picture_url?: string;
    role_name?: string;
  };
  onConfirm: () => void;
  onClear: () => void;
  isProcessing?: boolean;
  variant?: "enroll" | "focus"; 
}

export function UserSelectionCard({
  user,
  onConfirm,
  onClear,
  isProcessing = false,
  variant = "enroll",
}: UserSelectionCardProps) {
  const t = useTranslations("user.UserSelectionCard");

  if (!user){
     return null;
  }
  
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

  const config = {
    enroll: {
      text: t("actions.enroll"),
      icon: <Plus className="h-3.5 w-3.5" />,
      colorClass: "bg-orange-600 hover:bg-orange-700 shadow-orange-100",
    },
    focus: {
      text: t("actions.focus"),
      icon: <Target className="h-3.5 w-3.5" />,
      colorClass: "bg-slate-900 hover:bg-black shadow-slate-200",
    },
  }[variant];

  const getTranslatedRole = (role?: string) => {
    const r = role?.toLowerCase();
    if (r === "client" || r === "cliente") {
      return t("roles.client");
    }
    if (r === "instructor"){
       return t("roles.instructor");
    }
    if (r === "admin") {
      return t("roles.admin");
    }
    return role || t("roles.client");
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 ease-in-out border-slate-200/60 bg-white",
      variant === "focus" 
        ? "border-none shadow-none p-0" 
        : "shadow-sm hover:shadow-md hover:border-slate-300/80"
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
        
          <div className="flex flex-1 items-center gap-4 p-4">
            <div className="relative shrink-0">
              <Avatar className="h-12 w-12 border border-slate-100 shadow-sm">
                <AvatarImage src={user.profile_picture_url} className="object-cover" />
                <AvatarFallback className="bg-slate-50 text-slate-400 font-semibold text-sm">
                  {initials || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white shadow-sm",
                variant === "focus" ? "bg-slate-900" : "bg-orange-500"
              )}>
                {variant === "focus" ? <Target className="h-2.5 w-2.5" /> : <UserCheck className="h-2.5 w-2.5" />}
              </div>
            </div>

            <div className="flex flex-col min-w-0 gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {user.first_name} {user.last_name}
                </span>
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none text-[9px] font-bold px-2 py-0 h-4 uppercase tracking-wider">
                  {getTranslatedRole(user.role_name)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-xs font-medium truncate max-w-[150px]">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 sm:border-l sm:border-slate-200 sm:pl-3">
                  <IdCard className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-xs font-semibold text-slate-600">{user.identity_document}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "flex items-center gap-2 px-4 py-3 sm:py-0 border-t sm:border-t-0 sm:border-l border-slate-100",
            variant === "focus" ? "bg-transparent border-none" : "bg-slate-50/40"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={isProcessing}
              className="h-9 w-9 p-0 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              onClick={onConfirm}
              disabled={isProcessing || !user.user_id}
              className={cn(
                "h-9 px-5 rounded-full text-white font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-[0.97] flex items-center gap-2",
                config.colorClass
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                config.icon
              )}
              <span>
                {isProcessing ? t("actions.waiting") : config.text}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}