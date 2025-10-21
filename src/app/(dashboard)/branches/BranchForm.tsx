"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";
import Wizard from "@/app/(dashboard)/branches/Wizard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import StepForm from "@/app/(dashboard)/branches/StepForm";
import Image from "next/image";
import { PaymentMethodUI } from "./page";
import { createBranch } from "@/services/branches";
// Importa los tipos de ubicación si StepForm los necesita para otros pasos
import { Country, State, City } from "@/types/location";

interface BranchFromProps {
  onClose: () => void;
  allPaymentMethods: PaymentMethodUI[];
  // Añade estas si StepForm las necesita para otros pasos
  allCountries: Country[];
  allStates: State[];
  allCities: City[];
}

export default function BranchFrom({
  onClose,
  allPaymentMethods,
  allCountries, // Recibe las props
  allStates,
  allCities,
}: BranchFromProps) {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1); // Empieza en el paso 1

  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    countryId: "",
    stateId: "",
    cityId: "", // Añadido
    // Campos usados por los Step components (nombres en español)
    city: "",
    state: "",
    country: "",
    latitud: "",
    longitud: "",
    status: "active",
    phone: "",
    address: "",
    latitude: 0,
    longitude: 0,
    administrator: "",
    capacity: 0,
    capacidadMiembros: "",
    manager_id: "",
    horarios: {},
    operatingHours: {},
    paymentMethods: [], // Array de IDs
  });

  const steps = [
    { id: 1, name: "Información Básica", description: "Datos" },
    { id: 2, name: "Ubicación", description: "Dirección" },
    { id: 3, name: "Administración", description: "Gestión" },
    { id: 4, name: "Comercial", description: "Métodos de Pago" },
    { id: 5, name: "Confirmación", description: "Revisión" },
  ];

  // --- VALIDACIÓN ELIMINADA TEMPORALMENTE ---
  // La función validateStep ya no es necesaria aquí para avanzar
  // const validateStep = () => { ... };

  const handleNext = () => {
    // --- YA NO LLAMA A validateStep() ---
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = () => {
    // Helper: convertir horarios a HH:MM:SS
    const toHHMMSS = (input?: string | null) => {
      if (!input) {return "00:00:00";}
      const s = input.trim();
      // Si ya tiene segundos
      const hasSeconds = /^\d{1,2}:\d{2}:\d{2}$/.test(s);
      if (hasSeconds) {return s;}
      // Formato 24h hh:mm
      const hm = /^(\d{1,2}):(\d{2})$/.exec(s);
      if (hm) {
        const hh = Number(hm[1]).toString().padStart(2, "0");
        const mm = hm[2];
        return `${hh}:${mm}:00`;
      }
      // Formato 12h con AM/PM
      const ampm = /^(\d{1,2}):(\d{2})(?:\s*)(AM|PM)$/i.exec(s);
      if (ampm) {
        let hh = Number(ampm[1]);
        const mm = ampm[2];
        const period = ampm[3].toUpperCase();
        if (period === "PM" && hh < 12) {hh += 12;}
        if (period === "AM" && hh === 12) {hh = 0;}
        return `${hh.toString().padStart(2, "0")}:${mm}:00`;
      }
      // Si no podemos parsear, devolver 00:00:00
      return "00:00:00";
    };

    const dayMap: Record<string, string> = {
      lunes: "Monday",
      martes: "Tuesday",
      miercoles: "Wednesday",
      jueves: "Thursday",
      viernes: "Friday",
      sabado: "Saturday",
      domingo: "Sunday",
    };

    // Asegurar que el arreglo tenga los 7 días en orden o mapear los existentes
    const horariosRecord = (formData.horarios as Record<string, any>) || {};
    const daysOrder = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo",
    ];

    const operating_hours = daysOrder.map((dayKey) => {
      const h = horariosRecord[dayKey] || {
        apertura: "00:00",
        cierre: "00:00",
        cerrado: true,
      };
      const isClosed = !!h.cerrado;
      return {
        day_of_week: dayMap[dayKey],
        open_time: isClosed ? "00:00:00" : toHHMMSS(h.apertura),
        close_time: isClosed ? "00:00:00" : toHHMMSS(h.cierre),
        is_closed: isClosed,
      };
    });

    const statusMap: Record<string, string> = {
      active: "Active",
      inactive: "Inactive",
      maintenance: "Maintenance",
    };

    const rawStatus = (formData.status || "Active").toString();
    const normalizedStatus =
      statusMap[rawStatus.toLowerCase()] ??
      rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

    const apiPayload: any = {
      address: formData.address || "",
      country: formData.country || "",
      latitude:
        typeof formData.latitude === "number"
          ? formData.latitude
          : formData.latitud
            ? parseFloat(formData.latitud)
            : 0,
      longitude:
        typeof formData.longitude === "number"
          ? formData.longitude
          : formData.longitud
            ? parseFloat(formData.longitud)
            : 0,
      manager_id: formData.manager_id || formData.administrator || "",
      max_capacity:
        formData.capacidadMiembros && !isNaN(Number(formData.capacidadMiembros))
          ? Number(formData.capacidadMiembros)
          : formData.capacity || 0,
      name: formData.name || "",
      operating_hours,
      payment_methods: formData.paymentMethods || [],
      phone: formData.phone || "",
      state: formData.state || "",
      status: normalizedStatus,
      tax_id: formData.taxId || "",
    };

    createBranch(apiPayload)
      .then((data) => {
        console.log("Sucursal creada:", data);
        alert("Sucursal creada correctamente");
        onClose();
      })
      .catch((err) => {
        console.log("Error creando sucursal:", err);
        alert("Error al crear sucursal: " + (err?.message || String(err)));
      });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleCustomChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Puedes borrar handleInputChange y nextStyles si ya no los usas

  return (
    <Card
      className="w-full max-w-4xl max-h-[90vh] mx-auto my-auto overflow-y-auto border"
      onClick={(e) => e.stopPropagation()} // <-- Correcto para no cerrar modal
    >
      <CardHeader className="sticky top-0 bg-white z-10 pt-6 pb-4 border-b">
        {/* ... (Tu CardTitle, Imagen, Botón Cerrar) ... */}
        <div className="flex items-center justify-between w-full">
                   {" "}
          <CardTitle className="text-2xl font-bold text-gray-800">
                        CREAR NUEVA SUCURSAL          {" "}
          </CardTitle>
          <div className="flex items-center gap-4">
                       {" "}
            <Image
              src="/images/logo-vitalfit.png" // Ajusta la ruta si es necesario
              alt="Logo Vitalfit"
              width={148}
              height={40} // Ajusta el alto si es necesario
              priority
            />
                       {" "}
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-gray-700"
            >
                            <XMarkIcon className="h-6 w-6" />           {" "}
            </Button>
                     {" "}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        {" "}
        {/* Ajuste de padding */}
        <p className="text-sm text-gray-600 mb-6">
          {" "}
          {/* Ajuste de margen */}
          Complete los siguientes pasos para crear una nueva sucursal
        </p>
        <Wizard steps={steps} currentStep={currentStep} />
        <div className="mt-8">
          {" "}
          {/* Añadido margen superior */}
          <StepForm
            step={currentStep}
            formData={formData}
            handleChange={handleChange}
            handleCustomChange={handleCustomChange}
            formErrors={formErrors}
            // Pasa todas las props necesarias
            allPaymentMethods={allPaymentMethods}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between px-6 pb-6 border-t pt-6">
        {" "}
        {/* Añadido border y padding top */}
        <Button
          onClick={handleBack}
          disabled={currentStep === 1}
          variant="outline" // Estilo más estándar
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          onClick={currentStep === steps.length ? handleSubmit : handleNext}
          className="flex items-center gap-2"
        >
          {currentStep === steps.length ? (
            "Crear Sucursal"
          ) : (
            <>
              Siguiente
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
