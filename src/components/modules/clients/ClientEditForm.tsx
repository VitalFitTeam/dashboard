"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientFromAPI } from "@/hooks/clients/useClients";
import { 
  Loader2, Save, X, Fingerprint, Calendar, 
  Phone, Mail, Camera, Image as ImageIcon 
} from "lucide-react";
import { toast } from "sonner";

const clientSchema = z.object({
  first_name: z.string().min(2, "Mínimo 2 caracteres"),
  last_name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Mínimo 10 dígitos"),
  identity_document: z.string().min(5, "Documento inválido"),
  birth_date: z.string().min(1, "Requerida"),
  gender: z.string(),
  profile_picture_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface Props {
  client: ClientFromAPI;
  onSave: (data: ClientFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ClientEditForm = ({ client, onSave, onCancel, isSubmitting }: Props) => {
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
      identity_document: client.identity_document,
      birth_date: client.birth_date ? new Date(client.birth_date).toISOString().split("T")[0] : "",
      gender: client.gender,
      profile_picture_url: client.profile_picture_url || "",
    },
  });

  const initials = `${client.first_name?.[0] || ""}${client.last_name?.[0] || ""}`.toUpperCase();
  const currentAvatar = watch("profile_picture_url");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      const apiKey = process.env.NEXT_PUBLIC_IMGBB || "TU_API_KEY_AQUI";
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setValue("profile_picture_url", result.data.url, { shouldValidate: true });
        toast.success("Imagen cargada correctamente");
      }
    } catch (error) {
      toast.error("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="md:col-span-2 space-y-4">
      <Card className="overflow-hidden border-primary/10 shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b bg-muted/30 pb-4">

          <div className="relative group cursor-pointer">
            <Avatar className="h-20 w-20 border-2 border-background shadow-md transition-all group-hover:opacity-80">
              <AvatarImage src={currentAvatar} alt="Preview" className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : initials}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-6 w-6 text-white" />
            </label>
            <input 
              id="avatar-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading || isSubmitting}
            />
          </div>

          <div className="flex-1">
            <CardTitle className="text-xl italic font-black uppercase tracking-tighter">
              Editando Perfil
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Haz clic en la foto para cambiarla
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting || isUploading}>
              <X className="h-4 w-4" />
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || isUploading} className="font-bold italic uppercase tracking-tighter">
              {(isSubmitting || isUploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Nombre" registration={register("first_name")} error={errors.first_name?.message} />
            <FormInput label="Apellido" registration={register("last_name")} error={errors.last_name?.message} />
          </div>

          <FormInput label="Email" type="email" icon={<Mail className="h-3 w-3" />} registration={register("email")} error={errors.email?.message} />
          <FormInput label="Teléfono" icon={<Phone className="h-3 w-3" />} registration={register("phone")} error={errors.phone?.message} />
          <FormInput label="Documento Identidad" icon={<Fingerprint className="h-3 w-3" />} registration={register("identity_document")} error={errors.identity_document?.message} />
          <FormInput label="Fecha Nacimiento" type="date" icon={<Calendar className="h-3 w-3" />} registration={register("birth_date")} error={errors.birth_date?.message} />

          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Género</label>
            <select
              {...register("gender")}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="female">Femenino</option>
              <option value="male"> Masculino</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <FormInput 
            label="URL Directa de Imagen" 
            icon={<ImageIcon className="h-3 w-3" />}
            registration={register("profile_picture_url")} 
            error={errors.profile_picture_url?.message} 
            className="sm:col-span-2"
          />
        </CardContent>
      </Card>
    </form>
  );
};

const FormInput = ({ label, error, registration, type = "text", icon, className }: any) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors">
          {icon}
        </div>
      )}
      <input
        {...registration}
        type={type}
        className={`flex h-9 w-full rounded-md border ${error ? "border-destructive" : "border-input"} bg-background px-3 ${icon ? "pl-9" : ""} py-1 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${error ? "focus:ring-destructive/20" : "focus:ring-primary/20"} disabled:opacity-50`}
      />
    </div>
    {error && (
      <p className="text-[9px] font-bold text-destructive uppercase ml-1 animate-in fade-in slide-in-from-top-1">
        {error}
      </p>
    )}
  </div>
);