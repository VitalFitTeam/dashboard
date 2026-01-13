"use client";

import { useState } from "react";
import { useMedicalProfile } from "@/hooks/clients/useMedicalProfile";
import { useMedicalActions } from "@/hooks/clients/useMedicalActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  AlertTriangle,
  Activity,
  PhoneCall,
  HeartPulse,
  Pencil,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import { MedicalForm } from "./MedicalForm";
import { MedicalInfoItem } from "./MedicalInfoItem";

interface Props {
  userId: string;
  token: string | null;
}

export const ClientMedicalSection = ({ userId, token }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const { medicalData, isLoading, refetch } = useMedicalProfile(userId, token);
  const { saveMedicalProfile, isSubmitting } = useMedicalActions(userId, token);

  const handleProcessSave = async (formData: any) => {
    const success = await saveMedicalProfile(formData, !!medicalData);
    if (success) {
      await refetch(); 
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <HeartPulse className="h-10 w-10 text-primary animate-pulse" />
        <p className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">
          Sincronizando Ficha Médica...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* SECCIÓN DE CABECERA */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            Ficha Médica Digital
          </h2>
        </div>

        {!isEditing && (
          <Button
            variant={medicalData ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(true)}
            className="font-bold italic uppercase tracking-tighter"
          >
            {medicalData ? (
              <>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Actualizar Ficha
              </>
            ) : (
              <>
                <PlusCircle className="h-3.5 w-3.5 mr-2" /> Crear Ficha
              </>
            )}
          </Button>
        )}
      </div>

      {isEditing ? (
        <MedicalForm
          initialData={medicalData}
          onSave={handleProcessSave}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COLUMNA: ALERTAS Y RIESGOS (Rojo) */}
          <Card className="border-red-200 bg-red-50/20 shadow-sm">
            <CardHeader className="pb-3 border-b border-red-100 mb-4">
              <CardTitle className="text-xs font-black italic uppercase tracking-widest text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Alertas Críticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MedicalInfoItem
                label="Alergias"
                value={medicalData?.allergies}
                icon={<ShieldAlert className="h-3.5 w-3.5 text-red-400" />}
                isCritical
              />
              <MedicalInfoItem
                label="Advertencias de Entrenamiento"
                value={medicalData?.warnings}
                isCritical
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-primary/10 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/30 mb-4">
              <CardTitle className="text-xs font-black italic uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Perfil Clínico del Atleta
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <MedicalInfoItem
                label="Grupo Sanguíneo"
                value={medicalData?.blood_type}
                isBadge
              />
              <MedicalInfoItem
                label="Contacto de Emergencia"
                value={medicalData?.emergency_contact}
                icon={<PhoneCall className="h-3.5 w-3.5 text-primary/40" />}
              />
              <MedicalInfoItem
                label="Condiciones Médicas"
                value={medicalData?.medical_conditions}
                fullWidth
              />
              <MedicalInfoItem
                label="Medicamentación Actual"
                value={medicalData?.medications}
                fullWidth
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};


