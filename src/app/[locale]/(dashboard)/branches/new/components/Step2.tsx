"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import InputField from "@/components/ui/InputField";

// Import dinámico para evitar errores con SSR
const MapboxPicker = dynamic(() => import("@/components/ui/MapboxPicker"), {
  ssr: false,
});

type StepProps = {
  formData: any;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handleCustomChange: (field: string, value: unknown) => void;
  formErrors?: Record<string, string>;
};

import { useTranslations } from "next-intl";

export default function Step2({
  formData,
  handleChange,
  handleCustomChange,
  formErrors = {},
}: StepProps) {
  const t = useTranslations("branches");
  const handleMapSelect = (data: {
    latitud: string;
    longitud: string;
    address: string;
    city: string;
    state: string;
    country: string;
  }) => {
    // Coordenadas
    handleCustomChange("latitud", data.latitud);
    handleCustomChange("longitud", data.longitud);

    // Conversión a número
    const latNum = parseFloat(data.latitud);
    const lngNum = parseFloat(data.longitud);
    if (!isNaN(latNum)) { handleCustomChange("latitude", latNum); }
    if (!isNaN(lngNum)) { handleCustomChange("longitude", lngNum); }

    // IDs geográficos
    handleCustomChange("cityId", data.city);
    handleCustomChange("stateId", data.state);
    handleCustomChange("countryId", data.country);

    // ✅ NUEVO: actualizar automáticamente la dirección
    if (data.address) {
      handleCustomChange("address", data.address);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {t("create.form.location.title")}
        </h3>
        <p className="text-sm text-gray-600">
          {t("create.form.location.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {/* Dirección manual (ahora también se llena automáticamente) */}
        <div className="col-span-6">
          <InputField
            label={t("create.form.location.address")}
            id="address"
            name="address"
            value={formData.address || ""}
            error={formErrors["address"]}
            onChange={handleChange}
            placeholder={t("create.form.location.address_placeholder")}
            className="focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-6 md:col-span-4">
          <InputField
            label={t("create.form.location.state")}
            id="stateId"
            name="stateId"
            value={formData.stateId || ""}
            readOnly
            className="bg-gray-50 text-gray-700"
          />
        </div>
        <div className="col-span-6 md:col-span-2">
          <InputField
            label={t("create.form.location.country")}
            id="countryId"
            name="countryId"
            value={formData.countryId || ""}
            readOnly
            className="bg-gray-50 text-gray-700"
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
            id="latitud"
            name="latitud"
            value={formData.latitud || ""}
            readOnly
            className="bg-gray-50 text-gray-700"
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <InputField
            label={t("create.form.location.longitude")}
            id="longitud"
            name="longitud"
            value={formData.longitud || ""}
            readOnly
            className="bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      <MapboxPicker
        lat={formData.latitud}
        lng={formData.longitud}
        onSelect={handleMapSelect}
      />
    </div>
  );
}
