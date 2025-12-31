"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar24 } from "@/components/layout/Calendar24";
import { Button } from "@/components/ui/button";
import {
  PackageDetail,
  PackageItemDetail,
  CreatePackagePayload,
} from "@vitalfit/sdk";
import EntityItem from "@/components/layout/EntityItem";
import { useTranslations } from "next-intl";

export interface PackageItemUI {
  serviceId: string;
  sessionsIncluded: number;
  name: string;
}

export interface PackageFormState {
  name: string;
  description: string;
  price: number;
  startAt: string;
  endAt: string;
  packageItems: PackageItemUI[];
  isActive?: boolean;
}

interface PackageFormProps {
  formData: PackageFormState;
  onChange?: (data: Partial<PackageFormState>) => void;
  mode?: "view" | "edit";
  services?: { id: string; name: string }[];
}

export default function PackageForm({
  formData,
  onChange,
  mode = "view",
  services = [],
}: PackageFormProps) {
  const isEditable = mode !== "view";
  const t = useTranslations("catalog.packages");

  const handleFieldChange = <K extends keyof PackageFormState>(
    field: K,
    value: PackageFormState[K],
  ) => {
    if (!isEditable) {
      return;
    }
    onChange?.({ [field]: value });
  };

  const handleUpdateSessions = (serviceId: string, value: number) => {
    if (!isEditable) {
      return;
    }

    const updatedItems = formData.packageItems.map((item) =>
      item.serviceId === serviceId
        ? { ...item, sessionsIncluded: value }
        : item,
    );

    onChange?.({ packageItems: updatedItems });
  };

  const handleRemoveService = (serviceId: string) => {
    if (!isEditable) {
      return;
    }
    const updatedItems = formData.packageItems.filter(
      (item) => item.serviceId !== serviceId,
    );
    onChange?.({ packageItems: updatedItems });
  };

  const handleAddService = (serviceId: string) => {
    if (!isEditable) {
      return;
    }
    if (formData.packageItems.some((i) => i.serviceId === serviceId)) {
      return;
    }
    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      return;
    }

    const newItem: PackageItemUI = {
      serviceId,
      name: service.name,
      sessionsIncluded: 1,
    };
    onChange?.({ packageItems: [...formData.packageItems, newItem] });
  };

  const dateStart = formData.startAt ? new Date(formData.startAt) : undefined;
  const dateEnd = formData.endAt ? new Date(formData.endAt) : undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{t("form.labels.name")}</label>
          <Input
            disabled={!isEditable}
            value={formData.name || ""}
            onChange={(e) => handleFieldChange("name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">{t("form.labels.price")}</label>
          <Input
            type="number"
            disabled={!isEditable}
            value={formData.price || 0}
            onChange={(e) => handleFieldChange("price", Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{t("form.labels.description")}</label>
        <Textarea
          disabled={!isEditable}
          value={formData.description || ""}
          onChange={(e) => handleFieldChange("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{t("form.labels.start_at")}</label>
          <Calendar24
            date={dateStart}
            disabled={!isEditable}
            onChange={(d) => d && handleFieldChange("startAt", d.toISOString())}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t("form.labels.end_at")}</label>
          <Calendar24
            date={dateEnd}
            disabled={!isEditable}
            onChange={(d) => d && handleFieldChange("endAt", d.toISOString())}
          />
        </div>
      </div>

      {isEditable && services.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("form.labels.add_service")}
          </label>
          <select
            className="border p-2 w-full"
            onChange={(e) => handleAddService(e.target.value)}
          >
            <option value="">{t("form.labels.service_placeholder")}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        {formData.packageItems.map((item) => {
          const serviceName =
            services.find((s) => s.id === item.serviceId)?.name || item.name;
          return (
            <EntityItem
              key={item.serviceId}
              title={`${serviceName} — ${t("form.labels.sessions", { count: item.sessionsIncluded })}`}
              initials={(serviceName || "?")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
              action={
                isEditable && (
                  <Button
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleRemoveService(item.serviceId)}
                  >
                    {t("form.labels.remove")}
                  </Button>
                )
              }
            >
              {isEditable && (
                <Input
                  type="number"
                  min={1}
                  value={item.sessionsIncluded}
                  onChange={(e) =>
                    handleUpdateSessions(item.serviceId, Number(e.target.value))
                  }
                  className="mt-2"
                />
              )}
            </EntityItem>
          );
        })}
      </div>

      {/* Estado */}
      {"isActive" in formData && (
        <div>
          <label className="text-sm font-medium">{t("form.labels.status")}</label>
          <Badge
            variant="outline"
            className={
              formData.isActive
                ? "border-green-300 text-green-700"
                : "border-yellow-300 text-yellow-700"
            }
          >
            {formData.isActive ? t("table.status.active") : t("table.status.inactive")}
          </Badge>
        </div>
      )}
    </div>
  );
}
