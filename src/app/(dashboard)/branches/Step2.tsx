"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import InputField from "@/components/InputField";
import dynamic from "next/dynamic";

// Import dinámico para evitar errores con SSR
const MapboxPicker = dynamic(() => import("@/components/MapboxPicker"), {
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

export default function Step2({
  formData,
  handleChange,
  handleCustomChange,
  formErrors = {},
}: StepProps) {
  // ✅ ya no actualizamos "address"
  const handleMapSelect = (data: {
    latitud: string;
    longitud: string;
    address: string;
    city: string;
    state: string;
    country: string;
  }) => {
    handleCustomChange("latitud", data.latitud);
    handleCustomChange("longitud", data.longitud);

    // Guardar también los numéricos
    const latNum = parseFloat(data.latitud);
    const lngNum = parseFloat(data.longitud);
    if (!isNaN(latNum)) {handleCustomChange("latitude", latNum);}
    if (!isNaN(lngNum)) {handleCustomChange("longitude", lngNum);}

    // ✅ CAMBIO AQUÍ: usa los campos que tu handleSubmit espera
    handleCustomChange("cityId", data.city);
    handleCustomChange("stateId", data.state);
    handleCustomChange("countryId", data.country);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Ubicación y Contacto
        </h3>
        <p className="text-sm text-gray-600">
          Seleccione la ubicación exacta en el mapa o ingrese coordenadas
        </p>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {/* Dirección manual */}
        <div className="col-span-6">
          <InputField
            label="Dirección Completa*"
            id="address"
            name="address"
            value={formData.address || ""}
            error={formErrors["address"]}
            onChange={handleChange}
            placeholder="Ingrese la dirección manualmente"
            className="focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Ciudad / Estado / País */}

        <InputField
          label="Estado"
          id="stateId"
          name="stateId"
          value={formData.stateId || ""}
          readOnly
          className="bg-gray-50 text-gray-700"
        />
        <div className="col-span-6 md:col-span-2">
          <InputField
            label="País"
            id="countryId"
            name="countryId"
            value={formData.countryId || ""}
            readOnly
            className="bg-gray-50 text-gray-700"
          />
        </div>

        {/* Coordenadas */}
        <div className="col-span-6 flex items-center gap-2 mt-4">
          <MapPin className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">
            Coordenadas GPS
          </span>
        </div>

        <div className="col-span-6 md:col-span-3">
          <InputField
            label="Latitud"
            id="latitud"
            name="latitud"
            value={formData.latitud || ""}
            readOnly
            className="bg-gray-50 text-gray-700"
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <InputField
            label="Longitud"
            id="longitud"
            name="longitud"
            value={formData.longitud || ""}
            readOnly
            className="bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      {/* 🗺️ Mapa interactivo */}
      <MapboxPicker
        lat={formData.latitud}
        lng={formData.longitud}
        onSelect={handleMapSelect}
      />
    </div>
  );
}
