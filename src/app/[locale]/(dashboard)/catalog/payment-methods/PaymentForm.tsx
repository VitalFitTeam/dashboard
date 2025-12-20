"use client";

import { PaymentMethod } from "@vitalfit/sdk";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { useTranslations } from "next-intl";

interface PaymentFormProps {
  formData:
  | PaymentMethod
  | {
    name: string;
    type: string;
    processing_type: string;
    description?: string;
    global_status?: boolean;
  };
  errors?: {
    name?: string;
    type?: string;
    processing_type?: string;
    description?: string;
  };
  onChange: (field: string, value: string) => void;
  onBlur?: (field: string) => void;
  disabled?: boolean;
}

export default function PaymentForm({
  formData,
  errors,
  onChange,
  onBlur,
  disabled = false,
}: PaymentFormProps) {
  const t = useTranslations("catalog.payment_methods");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">{t("form.labels.name")}</label>
        <Input
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          onBlur={() => onBlur?.("name")}
          placeholder={t("form.placeholders.name")}
          disabled={disabled}
          required
        />
        {errors?.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="flex flex-col" onBlur={() => onBlur?.("type")}>
        <label className="text-sm font-medium mb-1">{t("form.labels.type")}</label>
        <Select
          value={formData.type}
          onValueChange={(value) => onChange("type", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("table.all_types")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">{t("table.types.cash")}</SelectItem>
            <SelectItem value="Card">{t("table.types.card")}</SelectItem>
            <SelectItem value="Transfer">{t("table.types.transfer")}</SelectItem>
            <SelectItem value="Other">{t("table.types.other")}</SelectItem>
          </SelectContent>
        </Select>
        {errors?.type && (
          <p className="text-red-500 text-xs mt-1">{errors.type}</p>
        )}
      </div>

      <div className="flex flex-col" onBlur={() => onBlur?.("global_status")}>
        <label className="text-sm font-medium mb-1">{t("form.labels.status")}</label>
        <Select
          value={formData.global_status?.toString() || "true"}
          onValueChange={(value) => onChange("global_status", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">{t("table.status.active")}</SelectItem>
            <SelectItem value="false">{t("table.status.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col" onBlur={() => onBlur?.("processing_type")}>
        <label className="text-sm font-medium mb-1">
          {t("form.labels.processing_type")}
        </label>
        <Select
          value={formData.processing_type || "Offline"}
          onValueChange={(value) => onChange("processing_type", value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Gateway">{t("form.processing_types.gateway")}</SelectItem>
            <SelectItem value="Offline">{t("form.processing_types.offline")}</SelectItem>
          </SelectContent>
        </Select>
        {errors?.processing_type && (
          <p className="text-red-500 text-xs mt-1">{errors.processing_type}</p>
        )}
      </div>

      <div className="flex flex-col col-span-1 md:col-span-2">
        <label className="text-sm font-medium mb-1">{t("form.labels.description")}</label>
        <Textarea
          value={formData.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          onBlur={() => onBlur?.("description")}
          placeholder={t("form.placeholders.description")}
          rows={3}
          disabled={disabled}
        />
        {errors?.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description}</p>
        )}
      </div>
    </div>
  );
}
