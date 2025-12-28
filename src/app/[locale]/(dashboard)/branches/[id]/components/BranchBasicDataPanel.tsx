"use client";

import BranchSchedule from "@/components/modules/branches/details/BranchSchedule";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InputField from "@/components/ui/InputField";
import MapboxPicker from "@/components/ui/MapboxPicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { MapPin } from "lucide-react";
import { BranchDetails, UpdateBranchRequest } from "@vitalfit/sdk";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { branchDetailsSchema } from "@/lib/validation/branchDetailsSchema";

interface BasicDataPanelProps {
  mode?: "view" | "edit";
  formData: BranchDetails;
  setFormData: React.Dispatch<React.SetStateAction<BranchDetails>>;
}

const statusOptions: { label: string; value: BranchDetails["status"] }[] = [
  { label: "Activa", value: "Active" },
  { label: "Inactiva", value: "Inactive" },
  { label: "En mantenimiento", value: "Maintenance" },
];

interface MapSelectData {
  latitud: string;
  longitud: string;
  address: string;
  state: string;
  country: string;
}

const toHHMMSS = (input?: string | null) => {
  if (!input) {
    return "00:00:00";
  }
  const s = input.trim();
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) {
    return s;
  }
  const hm = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (hm) {
    return `${hm[1].padStart(2, "0")}:${hm[2]}:00`;
  }
  const ampm = /^(\d{1,2}):(\d{2})(?:\s*)(AM|PM)$/i.exec(s);
  if (ampm) {
    let hh = Number(ampm[1]);
    const mm = ampm[2];
    const period = ampm[3].toUpperCase();
    if (period === "PM" && hh < 12) {
      hh += 12;
    }
    if (period === "AM" && hh === 12) {
      hh = 0;
    }
    return `${hh.toString().padStart(2, "0")}:${mm}:00`;
  }
  return "00:00:00";
};

const transformDataForAPI = (data: BranchDetails): UpdateBranchRequest => {
  const opHours = data.operating_hours.map((h) => ({
    day_of_week: h.day_of_week,
    open_time: h.is_closed ? "00:00:00" : toHHMMSS(h.open_time),
    close_time: h.is_closed ? "00:00:00" : toHHMMSS(h.close_time),
    is_closed: h.is_closed,
  }));

  return {
    name: data.name,
    tax_id: data.tax_id,
    address: data.address,
    phone: data.phone,
    status: data.status,
    state: data.state,
    country: data.country,
    latitude: data.latitude,
    longitude: data.longitude,
    max_capacity: data.max_capacity,
    manager_id: data.manager,
    operating_hours: opHours,
    payment_methods: [],
  };
};

import { useTranslations } from "next-intl";

export default function BranchBasicDataPanel({
  mode = "edit",
  formData,
  setFormData,
}: BasicDataPanelProps) {
  const t = useTranslations("branches");
  const [loading, setLoading] = useState(false);
  const isViewMode = mode === "view";
  const { token } = useAuth();

  const statusOptions: { label: string; value: BranchDetails["status"] }[] = [
    { label: t("table.status.active"), value: "Active" },
    { label: t("table.status.inactive"), value: "Inactive" },
    { label: t("table.status.maintenance"), value: "Maintenance" },
  ];

  const handleMapSelect = (data: MapSelectData) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(data.latitud) || 0,
      longitude: Number(data.longitud) || 0,
      address: data.address ?? prev.address,
      state: data.state ?? prev.state,
      country: data.country ?? prev.country,
    }));
  };

  const handleScheduleChange = (updatedSchedule: any) => {
    setFormData((prev) => ({
      ...prev,
      operating_hours: updatedSchedule,
    }));
  };

  const handleSaveChanges = async () => {
    const result = branchDetailsSchema.safeParse(formData);

    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => `${String(issue.path[0])}: ${issue.message}`)
        .join("\n");

      toast.error(messages);
      return;
    }

    setLoading(true);
    try {
      const payload = transformDataForAPI(formData);
      await api.branch.updateBranch(formData.branch_id, payload, token || "");
      toast.success(t("details.basic.success_update"));
    } catch (err) {
      console.error(err);
      toast.error(t("details.basic.error_update"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          {t("details.basic.title")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("details.basic.subtitle")}
        </p>

        <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <InputField
            id="name"
            label={t("details.basic.name")}
            value={formData.name ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            readOnly={isViewMode}
          />

          <InputField
            id="taxId"
            label={t("details.basic.tax_id")}
            value={formData.tax_id ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tax_id: e.target.value }))
            }
            readOnly={isViewMode}
          />

          <InputField
            id="phone"
            label={t("details.basic.phone")}
            value={formData.phone ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            readOnly={isViewMode}
          />

          <InputField
            id="maxCapacity"
            label={t("details.basic.capacity")}
            type="number"
            value={formData.max_capacity ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                max_capacity: Number(e.target.value),
              }))
            }
            readOnly={isViewMode}
          />

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              {t("details.basic.status")}
            </label>
            <Select
              value={formData.status ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as "Active" | "Inactive" | "Maintenance",
                }))
              }
              disabled={isViewMode}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder={t("details.basic.status_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <Alert variant="default" className="mt-6">
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription>
            {t("details.basic.hint")}
          </AlertDescription>
        </Alert>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("details.basic.location_title")}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t("details.basic.location_subtitle")}
        </p>

        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-6">
            <InputField
              label={t("create.form.location.address")}
              id="address"
              name="address"
              placeholder={t("create.form.location.address_placeholder")}
              value={formData.address ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              readOnly={isViewMode}
            />
          </div>
          <div className="col-span-6 md:col-span-3">
            <InputField
              label={t("create.form.location.state")}
              id="state"
              name="state"
              value={formData.state ?? ""}
              placeholder={t("create.form.location.state")}
              readOnly={isViewMode || !formData.state}
              className={isViewMode ? "bg-gray-100" : ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, state: e.target.value }))
              }
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            <InputField
              label={t("create.form.location.country")}
              id="country"
              name="country"
              value={formData.country ?? ""}
              placeholder={t("create.form.location.country")}
              readOnly={isViewMode || !formData.country}
              className={isViewMode ? "bg-gray-100" : ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
            />
          </div>

          <div className="col-span-6 flex items-center gap-2 mt-4">
            <MapPin className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              {t("create.form.location.gps_coords")}
            </span>
          </div>

          <div className="col-span-6 md:col-span-3">
            <InputField
              label={t("create.form.location.latitude")}
              id="latitude"
              name="latitude"
              readOnly
              className="bg-gray-100 border-gray-300"
              value={formData.latitude ?? ""}
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            <InputField
              label={t("create.form.location.longitude")}
              id="longitude"
              name="longitude"
              readOnly
              className="bg-gray-100 border-gray-300"
              value={formData.longitude ?? ""}
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-1 block">
            {t("details.basic.map_title")}
          </h3>
          <MapboxPicker
            lat={formData.latitude ? String(formData.latitude) : "0"}
            lng={formData.longitude ? String(formData.longitude) : "0"}
            onSelect={handleMapSelect}
          />
        </div>
      </section>

      {/* Horarios */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {t("details.basic.schedule_title")}
        </h2>
        <BranchSchedule
          schedule={formData.operating_hours || []}
          onScheduleChange={handleScheduleChange}
          mode={mode}
        />
      </section>

      {!isViewMode && (
        <Button onClick={handleSaveChanges} disabled={loading}>
          {loading ? t("create.form.buttons.saving") : t("create.form.buttons.save")}
        </Button>
      )}
    </div>
  );
}
