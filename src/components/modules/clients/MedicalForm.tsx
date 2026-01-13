"use client";

import { useForm } from "react-hook-form";
import { MedicalProfile } from "@vitalfit/sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Save, X, Loader2 } from "lucide-react";

interface Props {
  initialData: MedicalProfile | null;
  onSave: (data: MedicalProfile) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const MedicalForm = ({ initialData, onSave, onCancel, isSubmitting }: Props) => {
  const { register, handleSubmit } = useForm<MedicalProfile>({
    defaultValues: initialData || {}
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Card className="border-primary/20 shadow-inner">
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo de Sangre</label>
            <Input {...register("blood_type")} placeholder="Ej: O+, A-" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Contacto de Emergencia</label>
            <Input {...register("emergency_contact")} placeholder="Nombre - Teléfono" />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] font-bold uppercase text-red-500">Alergias Críticas</label>
            <Textarea {...register("allergies")} placeholder="Describa alergias alimentarias o medicamentosas..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Condiciones Médicas</label>
            <Textarea {...register("medical_conditions")} placeholder="Diabetes, Hipertensión, etc." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Medicamentos</label>
            <Textarea {...register("medications")} placeholder="Indique dosis y frecuencia..." />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] font-bold uppercase text-red-500">Advertencias de Entrenamiento</label>
            <Textarea {...register("warnings")} placeholder="Ej: Evitar saltos, problemas en rodilla..." />
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4 mr-2" /> Descartar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="italic font-bold uppercase tracking-tighter">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Ficha Médica
        </Button>
      </div>
    </form>
  );
};