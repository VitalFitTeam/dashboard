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
// Importa los tipos de ubicación si StepForm los necesita para otros pasos
import { Country, State, City } from "@/types/location";
import { BranchAdmin } from "@/types/users";

interface BranchFromProps {
  onClose: () => void;
  allPaymentMethods: PaymentMethodUI[];
  allBranchAdmins: BranchAdmin[];
  allCountries: Country[];
  allStates: State[];
  allCities: City[];
}

export default function BranchFrom({
  onClose,
  allPaymentMethods,
  allBranchAdmins,
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
    status: "active",
    phone: "",
    address: "",
    latitude: 0,
    longitude: 0,
    administrator: "",
    capacity: 0,
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
    console.log("Datos del formulario:", formData);
    alert("Sucursal Creada (Simulación)");
    onClose();
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
            allBranchAdmins={allBranchAdmins}
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
