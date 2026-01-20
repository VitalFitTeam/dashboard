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
  Lock
} from "lucide-react";
import { useTranslations } from "next-intl";
import { UserRole } from "@/lib/roles";

interface Props {
  userId: string;
  currentUser: any; 
  canEdit: boolean; 
  t?: any; 
  onNavigate: (path: string) => void;
  onEditClick: () => void;
}

export const ClientActions = ({ userId, currentUser, canEdit, onNavigate, onEditClick }: Props) => {

  const t = useTranslations("clients.view");
  const userRole = currentUser?.role as UserRole;

  const actions = useMemo(() => [
    { 
      label: t("actions.edit"), 
      icon: Pencil, 
      onClick: () => onEditClick(),
      visible: canEdit 
    },
    { 
      label: t("actions.membership_history"), 
      icon: CreditCard, 
      onClick: () => onNavigate(`/clients/register/${userId}/payments`),
      visible: [UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_ADMIN].includes(userRole)
    },
    { 
      label: t("actions.attendance_history"), 
      icon: Eye, 
      onClick: () => onNavigate(`/clients/register/${userId}/attendance`),
      visible: true 
    },
    { 
      label: t("actions.service_usage"), 
      icon: ClipboardList, 
      onClick: () => onNavigate(`/clients/register/${userId}/service-usage`),
      visible: true 
    },
    { 
      label: t("actions.complaints"), 
      icon: FileText, 
      onClick: null, 
      visible: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST].includes(userRole)
    },
    { 
      label: t("actions.rfm"), 
      icon: BarChart, 
      onClick: null, 
      visible: [UserRole.SUPER_ADMIN, UserRole.DATA_ANALYST].includes(userRole)
    },
  ], [userId, t, userRole, canEdit, onNavigate, onEditClick]);

  const visibleActions = actions.filter(action => action.visible);

  return (
    <Card className="shadow-lg border-primary/10 text-left bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-[10px] font-black italic uppercase tracking-[0.2em] text-muted-foreground leading-none flex items-center justify-between">
          {t("sections.actions")}
          <Lock className="h-3 w-3 opacity-20" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {visibleActions.map((action, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="w-full justify-start text-[11px] font-black uppercase tracking-wider h-11 transition-all hover:bg-primary hover:text-primary-foreground group border-muted-foreground/10 shadow-sm"
            onClick={() => action.onClick && action.onClick()}
            disabled={!action.onClick}
          >
            <div className="p-1.5 bg-primary/5 rounded-lg mr-3 group-hover:bg-primary-foreground/10 transition-colors">
              <action.icon className="h-4 w-4 group-hover:scale-110 transition-transform text-primary group-hover:text-primary-foreground" />
            </div>
            {action.label}
          </Button>
        ))}
        
        {visibleActions.length === 0 && (
          <p className="text-[10px] text-muted-foreground italic text-center py-4">
            {t("actions.no_permissions")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};