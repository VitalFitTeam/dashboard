"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Branches } from "@/types/branches";
import { City, State, Country } from "@/types/location";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import InputField from "@/components/InputField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const MapboxPicker = dynamic(() => import("@/components/MapboxPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 italic">
      Cargando mapa...
    </div>
  ),
});

interface LocationPanelProps {
  formData: Branches;
  mode: "view" | "edit";
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, // Acepta Textarea
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleMapSelect: (data: {
    latitud: string;
    longitud: string;
    address: string;
    city: string; // El mapa nos da los nombres
    state: string;
    country: string;
  }) => void;
  allCountries: Country[];
  allStates: State[];
  allCities: City[];
}

export default function LocationPanel({
  formData,
  mode,
  handleChange,
  handleSelectChange,
  handleMapSelect,
  allCountries,
  allStates,
  allCities,
}: LocationPanelProps) {
  const isDisabled = mode === "view";

  const filteredStates = useMemo(() => {
    if (!formData.countryId) {
      return [];
    }
    return allStates.filter((state) => state.countryId === formData.countryId);
  }, [formData.countryId, allStates]);

  const filteredCities = useMemo(() => {
    if (!formData.stateId) {
      return [];
    }
    return allCities.filter((city) => city.stateId === formData.stateId);
  }, [formData.stateId, allCities]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Ubicación y Contacto
        </h3>
        <p className="text-sm text-gray-600">
          {isDisabled
            ? "Visualizando la ubicación de la sucursal."
            : "Edita la dirección manualmente o selecciona una nueva ubicación en el mapa."}
        </p>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-6">
          <InputField
            label="Dirección Completa*"
            id="address"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            disabled={isDisabled} // Controlado por 'mode'
            placeholder="Av. Principal, Edificio Centro..."
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <InputField
            label="Ciudad"
            id="city"
            name="city"
            value={formData.city || ""}
            readOnly
            className="bg-gray-100 border-gray-300"
            placeholder="Se rellena con el mapa"
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <InputField
            label="Estado"
            id="state"
            name="state"
            value={formData.state || ""}
            readOnly
            className="bg-gray-100 border-gray-300"
            placeholder="Se rellena con el mapa"
          />
        </div>

        <div className="col-span-6 md:col-span-2">
          <InputField
            label="País"
            id="country"
            name="country"
            value={formData.country || ""}
            readOnly
            className="bg-gray-100 border-gray-300"
            placeholder="Se rellena con el mapa"
          />
        </div>

        <div className="col-span-6 flex items-center gap-2 mt-4">
          <MapPin className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">
            Coordenadas GPS
          </span>
        </div>

        <div className="col-span-6 md:col-span-3">
          <InputField
            label="Latitud"
            id="latitude"
            name="latitude"
            value={formData.latitude?.toString() || ""} // Convertimos a string
            readOnly
            className="bg-gray-100 border-gray-300"
            placeholder="Placeholder"
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <InputField
            label="Longitud"
            id="longitude"
            name="longitude"
            value={formData.longitude?.toString() || ""} // Convertimos a string
            readOnly
            className="bg-gray-100 border-gray-300"
            placeholder="Placeholder"
          />
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-1 block">
          Posición en el Mapa
        </h3>
        {mode === "edit" ? (
          <MapboxPicker
            lat={formData.latitude?.toString()}
            lng={formData.longitude?.toString()}
            onSelect={handleMapSelect}
          />
        ) : (
          <div className="w-full h-64 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 italic">
            <MapPin className="w-4 h-4 mr-2" />
            (Mapa interactivo no disponible en modo 'Ver')
          </div>
        )}
      </div>

      <Alert variant="default" className="mt-6">
        <InformationCircleIcon className="h-4 w-4" />
        <AlertDescription>
          Las coordenadas GPS permiten localizar la sucursal en mapas y
          optimizar rutas de traslado.
        </AlertDescription>
      </Alert>
    </div>
  );
}
