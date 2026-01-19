"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Pencil, 
  CreditCard, 
  Eye, 
  FileText,   
  BarChart,
  ClipboardList,
  Lock,
  Ban
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";


export enum UserRole {
  SUPER_ADMIN = "super_admin",
  BRANCH_ADMIN = "branch_admin",
  INSTRUCTOR = "instructor",
  ACCOUNTANT = "accountant",
  DATA_ANALYST = "data_analyst",
  RECEPTIONIST = "recepcionist",
}

interface Props {
  userId: string;
  currentUser: any; 
  canEdit: boolean; 
  onNavigate: (path: string) => void;
  onEditClick: () => void;
  onBlockClick: () => void; 
}

export const ClientActions = ({ 
  userId, 
  currentUser, 
  canEdit, 
  onNavigate, 
  onEditClick,
  onBlockClick 
}: Props) => {

  const t = useTranslations("clients.view");
  const userRole = currentUser?.role as UserRole;

  const actions = useMemo(() => [
    { 
      label: t("actions.edit"), 
      icon: Pencil, 
      onClick: () => onEditClick(),
      visible: canEdit,
      variant: "default" 
    },
    { 
      label: t("actions.membership_history"), 
      icon: CreditCard, 
      onClick: () => onNavigate(`/clients/register/${userId}/payments`),
      visible: [UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN].includes(userRole),
      variant: "default"
    },
    { 
      label: t("actions.attendance_history"), 
      icon: Eye, 
      onClick: () => onNavigate(`/clients/register/${userId}/attendance`),
      visible: true,
      variant: "default"
    },
    { 
      label: t("actions.service_usage"), 
      icon: ClipboardList, 
      onClick: () => onNavigate(`/clients/register/${userId}/service-usage`),
      visible: true,
      variant: "default"
    },
    { 
      label: t("actions.complaints"), 
      icon: FileText, 
      onClick: null, 
      visible: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST].includes(userRole),
      variant: "default"
    },
    { 
      label: t("actions.block"), 
      icon: Ban, 
      onClick: () => onBlockClick(),
      visible: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN].includes(userRole),
      variant: "destructive" 
    },
    { 
      label: t("actions.rfm"), 
      icon: BarChart, 
      onClick: null, 
      visible: [UserRole.SUPER_ADMIN, UserRole.DATA_ANALYST].includes(userRole),
      variant: "default"
    },
  ], [userId, t, userRole, canEdit, onNavigate, onEditClick, onBlockClick]);

  const visibleActions = actions.filter(action => action.visible);

  return (
    <Card className="shadow-lg border-primary/10 text-left bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-[10px] font-black italic uppercase tracking-[0.2em] text-muted-foreground leading-none flex items-center justify-between">
          {t("sections.actions")}
          <Lock className="h-3 w-3 opacity-20" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {visibleActions.map((action, idx) => {
          const isDestructive = action.variant === "destructive";
          
          return (
            <Button
              key={idx}
              variant="outline"
              className={cn(
                "w-full justify-start text-[11px] font-black uppercase tracking-wider h-11 transition-all group border-muted-foreground/10 shadow-sm",
                isDestructive 
                  ? "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" 
                  : "hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => action.onClick && action.onClick()}
              disabled={!action.onClick}
            >
              <div className={cn(
                "p-1.5 rounded-lg mr-3 transition-colors",
                isDestructive 
                  ? "bg-destructive/10 group-hover:bg-destructive-foreground/10" 
                  : "bg-primary/5 group-hover:bg-primary-foreground/10"
              )}>
                <action.icon className={cn(
                  "h-4 w-4 group-hover:scale-110 transition-transform",
                  isDestructive 
                    ? "text-destructive group-hover:text-destructive-foreground" 
                    : "text-primary group-hover:text-primary-foreground"
                )} />
              </div>
              {action.label}
            </Button>
          );
        })}
        
        {visibleActions.length === 0 && (
          <p className="text-[10px] text-muted-foreground italic text-center py-4">
            {t("actions.no_permissions")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};