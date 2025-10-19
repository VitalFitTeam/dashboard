"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import InputField from "@/components/InputField";

type StepProps = {
  formData: any;
  onChange: (field: string, value: string) => void;
  formErrors?: Record<string, string>;
};

export default function Step2({
  formData,
  onChange,
  formErrors = {},
}: StepProps) {
  const [mapUrl, setMapUrl] = useState<string>("");

  const handleCoordinateChange = () => {
    const lat = formData.latitud || "";
    const lng = formData.longitud || "";
    const apikey = "";
    if (lat && lng) {
      const url = `https://www.google.com/maps/embed/v1/place?key=${apikey}&q=${lat},${lng}&zoom=15`;
      setMapUrl(url);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Ubicación y Contacto
        </h3>
        <p className="text-sm text-gray-600">
          Especifique la ubicación exacta y contacto de la sucursal
        </p>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-6">
          <InputField
            label="Dirección Completa*"
            id="address"
            name="address"
            value={formData.address || ""}
            error={formErrors["address"]}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Clic en el mapa o ingrese coordenadas"
            helperText="La dirección base se rellenará automáticamente."
            className="focus:ring-orange-500 focus:border-transparent"
            readOnly={true}
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <InputField
            label="Ciudad"
            id="city"
            name="city"
            value={formData.city || ""}
            readOnly={true}
            placeholder="Se rellena con el mapa"
            className="bg-gray-50 text-gray-700 focus:ring-0 focus:border-gray-300"
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <InputField
            label="Estado"
            id="state"
            name="state"
            value={formData.state || ""}
            readOnly={true}
            placeholder="Se rellena con el mapa"
            className="bg-gray-50 text-gray-700 focus:ring-0 focus:border-gray-300"
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <InputField
            label="País"
            id="country"
            name="country"
            value={formData.country || ""}
            readOnly={true}
            placeholder="Se rellena con el mapa"
            className="bg-gray-50 text-gray-700 focus:ring-0 focus:border-gray-300"
          />
        </div>

        <div className="col-span-6 flex items-center gap-2 mt-4">
          {" "}
          {/* mt-4 para separar */}
          <MapPin className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">
            Coordenadas GPS (Opcional)
          </span>
        </div>

        <div className="col-span-6 md:col-span-3">
          <InputField
            label="Latitud"
            id="latitude"
            name="latitude"
            error={formErrors["latitude"]}
            value={formData.latitude || ""}
            readOnly={true}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/-/g, "");
              onChange("latitude", sanitized);
              handleCoordinateChange();
            }}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}
            className="bg-gray-50 text-gray-700 focus:ring-0 focus:border-gray-300"
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <InputField
            label="Longitud"
            id="longitude"
            name="longitude"
            error={formErrors["longitude"]}
            value={formData.longitude || ""}
            readOnly={true}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/-/g, "");
              onChange("longitude", sanitized);
              handleCoordinateChange();
            }}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}
            className="bg-gray-50 text-gray-700 focus:ring-0 focus:border-gray-300"
          />
        </div>
      </div>
      <div>
        <div className="w-full h-64 bg-gray-100 border border-gray-300 rounded-md overflow-hidden relative">
          {formData.latitud && formData.longitud ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 text-orange-500 mx-auto" />
                <p className="text-sm text-gray-600">
                  Coordenadas: {formData.latitud}, {formData.longitud}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${formData.latitud},${formData.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-orange-600 hover:text-orange-700 underline"
                >
                  Ver en Google Maps
                </a>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-gray-500">
                Haga clic en el mapa o ingrese las coordenadas manualmente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
