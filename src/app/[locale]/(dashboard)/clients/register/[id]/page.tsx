"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { toast } from "sonner";
import { ClientPersonalInfo } from "@/components/modules/clients/ClientPersonalInfo";
import { ClientActions } from "@/components/modules/clients/ClientActions";
import { MembershipInfo } from "@/components/modules/clients/MembershipInfo";
import { ClientEditForm } from "@/components/modules/clients/ClientEditForm";
import { useGetUser } from "@/hooks/users/useGetUser";
import { ClientMedicalSection } from "@/components/modules/clients/ClientMedicalSection";
import { AlertCircle } from "lucide-react";

const formatDate = (date: string, locale: string) => {
  if (!date) {
    return "N/A";
  }
  return new Date(date).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric", month: "long", day: "numeric"
  });
};

export default function ClientDetails() {
  const t = useTranslations("clients.view"); 
  const tCommon = useTranslations("common"); 
  const locale = useLocale();
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { user, loading, error, reload } = useGetUser(id as string, token);

  const handleSave = async (updatedData: any) => {
    if (!token || !id) {
      return;
    }
    setIsUpdating(true);
    try {
      await api.user.updateUserClient(id as string, updatedData, token);
      toast.success(t("notifications.update_success"));
      setIsEditing(false);
      if (reload){
         reload();
      }
    } catch (err) {
      toast.error(t("notifications.update_error"));
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <PageHeader title={t("loading")} subtitle={t("loading_subtitle")} />
        <div className="flex items-center justify-center h-64 animate-pulse text-lg text-muted-foreground italic font-black">
          {t("loading_message")}...
        </div>
      </div>
    );
  }

  if (error || !user) {
    if (error === 401) {
      router.replace("/login");
    }
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">
            {error === 404 ? t("errors.not_found") : t("errors.connection")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {t("errors.description")}
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs font-bold uppercase underline tracking-widest text-primary"
        >
          {t("errors.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      <PageHeader
        title={isEditing ? t("editing_title") : t("title")}
        subtitle={isEditing 
          ? t("editing_subtitle") 
          : t("subtitle", { name: `${user.first_name} ${user.last_name}` })
        }
      />

      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="general" className="px-8 font-bold italic uppercase tracking-tighter">
            {t("tabs.general")}
          </TabsTrigger>
          <TabsTrigger value="medical" className="px-8 font-bold italic uppercase tracking-tighter">
            {t("tabs.medical")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isEditing ? (
              <ClientEditForm
                client={user}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                isSubmitting={isUpdating}
              />
            ) : (
              <ClientPersonalInfo 
                client={user} 
                t={t} 
                formatDate={(d) => formatDate(d, locale)} 
                formatPhone={(p) => p || "N/A"} 
              />
            )}

            <ClientActions 
              userId={user.user_id} 
              t={t} 
              onNavigate={(path) => router.push(path)} 
              onEditClick={() => setIsEditing(true)} 
            />
          </div>

          {!isEditing && user.client_membership && (
            <MembershipInfo 
              membership={user.client_membership} 
              t={t} 
              formatDate={(d) => formatDate(d, locale)} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="medical" className="outline-none">
          <div className="p-2 border-2 border-dashed border-muted rounded-xl bg-muted/20 text-center">
             <ClientMedicalSection userId={user.user_id} token={token} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}