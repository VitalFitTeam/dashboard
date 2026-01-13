"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, CreditCard, Eye, FileText, Activity, BarChart } from "lucide-react";

interface Props {
  userId: string;
  t: any;
  onNavigate: (path: string) => void;
  onEditClick: () => void; // Nueva prop para manejar el estado de edición
}

export const ClientActions = ({ userId, t, onNavigate, onEditClick }: Props) => {
  const actions = [
    { 
      label: t("actions.edit"), 
      icon: Pencil, 

      onClick: () => onEditClick() 
    },
    { 
      label: t("actions.membership_history"), 
      icon: CreditCard, 
      onClick: () => onNavigate(`/clients/register/${userId}/payments`) 
    },
    { 
      label: t("actions.attendance_history"), 
      icon: Eye, 
      onClick: null 
    },
    { 
      label: t("actions.complaints"), 
      icon: FileText, 
      onClick: null 
    },
    { 
      label: t("actions.activity"), 
      icon: Activity, 
      onClick: null 
    },
    { 
      label: t("actions.rfm"), 
      icon: BarChart, 
      onClick: null 
    },
  ];

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader>
        <CardTitle className="text-sm font-black italic uppercase tracking-widest text-muted-foreground">
          {t("sections.actions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="w-full justify-start text-sm transition-all hover:bg-primary hover:text-primary-foreground group"
            onClick={() => action.onClick && action.onClick()}
            disabled={!action.onClick}
          >
            <action.icon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};