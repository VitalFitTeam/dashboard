"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientFromAPI } from "@/hooks/clients/useClients";
import { Fingerprint, Calendar, Phone, Mail, User as UserIcon } from "lucide-react";

interface Props {
  client: ClientFromAPI;
  t: any;
  formatDate: (date: string) => string;
  formatPhone: (phone: string) => string;
}

export const ClientPersonalInfo = ({ client, t, formatDate, formatPhone }: Props) => {
  const initials = `${client.first_name?.[0] || ""}${client.last_name?.[0] || ""}`.toUpperCase();

  return (
    <Card className="md:col-span-2 overflow-hidden border-primary/10 shadow-lg animate-in fade-in duration-500">
      {/* Header: Exactamente igual al de edición (bg-muted/30 y h-16) */}
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b bg-muted/30 pb-4">
        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
          <AvatarImage src={client.profile_picture_url} alt={client.first_name} className="object-cover" />
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl italic font-black uppercase tracking-tighter">
            {client.first_name} {client.last_name}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            ID: {client.user_id}
          </p>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-6">
        {/* Fila 1: Documento y Género (Misma distribución que edición) */}
        <InfoItem 
          label={t("fields.identity")} 
          value={client.identity_document} 
          icon={<Fingerprint className="h-3 w-3" />} 
        />
        
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            {t("fields.gender")}
          </p>
          <div className="h-9 flex items-center px-1">
            <span className="capitalize font-medium text-sm">{client.gender}</span>
          </div>
        </div>

        {/* Fila 2: Email y Teléfono */}
        <InfoItem 
          label={t("fields.email")} 
          value={client.email} 
          icon={<Mail className="h-3 w-3" />} 
        />
        
        <InfoItem 
          label={t("fields.phone")} 
          value={formatPhone(client.phone)} 
          icon={<Phone className="h-3 w-3" />} 
        />

        {/* Fila 3: Fecha y Rol */}
        <InfoItem 
          label={t("fields.birth_date")} 
          value={formatDate(client.birth_date)} 
          icon={<Calendar className="h-3 w-3" />} 
        />
        
        <InfoItem 
          label={t("fields.role")} 
          value={client.role_name || "Cliente"} 
        />

        <div className="space-y-1 sm:col-span-2 border-t pt-4 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            {t("fields.status") || "Estado del Sistema"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={client.is_validated ? "success" : "error"} className="px-3">
              {client.is_validated ? "Validado / Activo" : "No Validado / Bloqueado"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InfoItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
      {label}
    </p>
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
          {icon}
        </div>
      )}
      <div className={`flex h-9 w-full items-center rounded-md border border-transparent bg-transparent text-sm font-medium ${icon ? "pl-9" : "px-1"}`}>
        {value || "N/A"}
      </div>
    </div>
  </div>
);