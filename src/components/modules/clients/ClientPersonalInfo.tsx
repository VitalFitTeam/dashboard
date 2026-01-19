"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Fingerprint, 
  Calendar, 
  Phone, 
  Mail, 
  User as UserIcon, 
  Tag, 
  ShieldCheck,
  Activity
} from "lucide-react";

interface Props {
  client: {
    user_id: string;
    first_name: string;
    last_name: string;
    identity_document: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: string;
    category: string;
    role_name: string;
    profile_picture_url: string;
    has_active_membership: boolean;
  };
  t: any;
  formatDate: (date: string) => string;
  formatPhone: (phone: string) => string;
}

export const ClientPersonalInfo = ({ client, t, formatDate, formatPhone }: Props) => {
  const initials = `${client.first_name?.[0] || ""}${client.last_name?.[0] || ""}`.toUpperCase();

  return (
    <Card className="md:col-span-2 overflow-hidden border-primary/10 shadow-lg animate-in fade-in duration-500 text-left">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b bg-muted/30 pb-4">
        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
          <AvatarImage src={client.profile_picture_url} alt={client.first_name} className="object-cover" />
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl italic font-black uppercase tracking-tighter">
              {client.first_name} {client.last_name}
            </CardTitle>
            {client.has_active_membership && (
              <Badge variant="success" className="h-5 text-[9px] font-black uppercase">
                {t("status.active_member")}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            ID: {client.user_id}
          </p>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-6">
        
        <InfoItem 
          label={t("fields.identity")} 
          value={client.identity_document} 
          icon={<Fingerprint className="h-3.5 w-3.5" />} 
        />

        <InfoItem 
          label={t("fields.category")} 
          value={client.category} 
          icon={<Tag className="h-3.5 w-3.5" />} 
        />

        <InfoItem 
          label={t("fields.email")} 
          value={client.email} 
          icon={<Mail className="h-3.5 w-3.5" />} 
        />

        <InfoItem 
          label={t("fields.phone")} 
          value={formatPhone(client.phone)} 
          icon={<Phone className="h-3.5 w-3.5" />} 
        />

        <InfoItem 
          label={t("fields.birth_date")} 
          value={formatDate(client.birth_date)} 
          icon={<Calendar className="h-3.5 w-3.5" />} 
        />

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            {t("fields.gender")}
          </p>
          <div className="h-9 flex items-center px-1">
            <span className="capitalize font-semibold text-sm">
              { client.gender ? t(`gender_options.${client.gender.toLowerCase()}`) : "N/A" }
            </span>
          </div>
        </div>

        <InfoItem 
          label={t("fields.role")} 
          value={client.role_name} 
          icon={<UserIcon className="h-3.5 w-3.5" />}
        />

        <div className="space-y-1 sm:col-span-2 border-t pt-4 mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              {t("fields.membership_status")}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={client.has_active_membership ? "success" : "secondary"} className="px-3 font-bold uppercase text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {client.has_active_membership ? t("status.active") : t("status.inactive")}
              </Badge>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

const InfoItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
      {label}
    </p>
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 group-hover:text-primary transition-colors">
          {icon}
        </div>
      )}
      <div className={`flex h-9 w-full items-center rounded-md border border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-700 ${icon ? "pl-10" : "px-3"}`}>
        {value || "N/A"}
      </div>
    </div>
  </div>
);