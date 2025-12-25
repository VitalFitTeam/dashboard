"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/Label";
import { CreatePaymentMethod, PaymentMethod } from "@vitalfit/sdk";

type FormMode = "create" | "edit" | "view";

type PaymentFormData = PaymentMethod | CreatePaymentMethod;

interface PaymentFormProps {
  formData: PaymentFormData;
  errors?: Record<string, string>;
  onChange: (field: string, value: any) => void;
  mode: FormMode;
}

export default function PaymentForm({ formData, errors, onChange, mode }: PaymentFormProps) {
  const t = useTranslations("catalog.payment_methods");
  
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const updateConfig = (key: string, val: any) => {
    if (isView) {
      return;
    }
    const currentConfig = formData.configuration || {};
    onChange("configuration", { ...currentConfig, [key]: val });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold capitalize">
          {t(`form.modes.${mode}`)} {t("form.title_suffix")}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("form.labels.name")}</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => onChange("name", e.target.value)}
              disabled={isView}
              className={isView ? "bg-muted/50 cursor-default" : ""}
            />
            {errors?.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="display_name">{t("form.labels.display_name")}</Label>
            <Input
              id="display_name"
              value={(formData as any).display_name || formData.name || ""}
              onChange={(e) => onChange("display_name", e.target.value)}
              disabled={isView}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>{t("form.labels.type")}</Label>
            <Select
              value={formData.type || ""}
              onValueChange={(v) => {
                onChange("type", v);
                onChange("configuration", {}); 
              }}
              disabled={isView || isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Efectivo</SelectItem>
                <SelectItem value="Card">Tarjeta</SelectItem>
                <SelectItem value="Transfer">Transferencia</SelectItem>
                <SelectItem value="Other">Otro (Zelle / Pago Móvil)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Procesamiento</Label>
            <Select
              value={formData.processing_type || ""}
              onValueChange={(v) => onChange("processing_type", v)}
              disabled={isView}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Offline">Manual (Offline)</SelectItem>
                <SelectItem value="Gateway">Pasarela (Gateway)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="rounded-lg border bg-muted/40 p-4 space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Configuración de {formData.type || "Método"}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.type === "Transfer" && (
            <>
              <div className="grid gap-2">
                <Label className="text-xs">Nombre del Banco</Label>
                <Input 
                  value={(formData.configuration as any)?.bank_name || ""} 
                  onChange={(e) => updateConfig("bank_name", e.target.value)} 
                  disabled={isView}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Número de Cuenta</Label>
                <Input 
                  value={(formData.configuration as any)?.account_number || ""} 
                  onChange={(e) => updateConfig("account_number", e.target.value)} 
                  disabled={isView}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">RIF / Tax ID</Label>
                <Input 
                  value={(formData.configuration as any)?.tax_id || ""} 
                  onChange={(e) => updateConfig("tax_id", e.target.value)} 
                  disabled={isView}
                />
              </div>
            </>
          )}

          {formData.type === "Other" && (
            <>
              <div className="grid gap-2 col-span-2 md:col-span-1">
                <Label className="text-xs">Subtipo de Pago</Label>
                <Select 
                  value={(formData.configuration as any)?.sub_type || "zelle"}
                  onValueChange={(v) => updateConfig("sub_type", v)}
                  disabled={isView}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.configuration as any)?.sub_type === "pago_movil" ? (
                <>
                  <div className="grid gap-2">
                    <Label className="text-xs">Teléfono</Label>
                    <Input value={(formData.configuration as any)?.phone || ""} onChange={(e) => updateConfig("phone", e.target.value)} disabled={isView}/>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">ID Banco (V01, etc)</Label>
                    <Input value={(formData.configuration as any)?.bank_id || ""} onChange={(e) => updateConfig("bank_id", e.target.value)} disabled={isView}/>
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label className="text-xs">Correo Electrónico (Zelle)</Label>
                  <Input type="email" value={(formData.configuration as any)?.email || ""} onChange={(e) => updateConfig("email", e.target.value)} disabled={isView}/>
                </div>
              )}
            </>
          )}

          {(formData.type === "Cash" || formData.type === "Card") && (
            <p className="text-sm text-muted-foreground italic col-span-2">
              No se requiere información adicional para este método.
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Recargo Fijo</Label>
          <Input 
            type="number" 
            value={formData.surcharge_fixed ?? 0} 
            onChange={(e) => onChange("surcharge_fixed", Number(e.target.value))} 
            disabled={isView}
          />
        </div>
        <div className="grid gap-2">
          <Label>Recargo Porcentual (%)</Label>
          <Input 
            type="number" 
            value={formData.surcharge_percentage ?? 0} 
            onChange={(e) => onChange("surcharge_percentage", Number(e.target.value))} 
            disabled={isView}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>{t("form.labels.description")}</Label>
        <Textarea
          value={formData.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          disabled={isView}
        />
      </div>
    </div>
  );
}