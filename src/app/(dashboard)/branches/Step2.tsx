"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

type StepProps = {
  formData: any;
  onChange: (field: string, value: string) => void;
};

export default function Step2({ formData, onChange }: StepProps) {
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

      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Dirección Completa *
          </span>
          <input
            type="text"
            value={formData.direccion || ""}
            onChange={(e) => onChange("direccion", e.target.value)}
            placeholder="Direccion completa"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </label>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">
            Coordenadas GPS
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={formData.latitud || ""}
            onChange={(e) => {
              onChange("latitud", e.target.value);
              handleCoordinateChange();
            }}
            placeholder="10.458"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="text"
            value={formData.longitud || ""}
            onChange={(e) => {
              onChange("longitud", e.target.value);
              handleCoordinateChange();
            }}
            placeholder="-96.3254S"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

      {/* Teléfono field removed per request */}
    </div>
  );
}
