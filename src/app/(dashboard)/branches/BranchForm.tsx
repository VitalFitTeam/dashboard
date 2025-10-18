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

import {
  branchSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/lib/validation/branchSchema";

export default function BranchFrom({ onClose }: { onClose: () => void }) {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    razonSocial: "",
    rif: "",
    ciudad: "",
    estadoSucursal: "activa",
    telefono: "",
    direccion: "",
    latitud: "",
    longitud: "",
    gerenteResponsable: "",
    capacidadMiembros: "",
    horarios: {}, // objeto con días de la semana
    metodosPago: [], // array de strings
  });

  const steps = [
    { id: 1, name: "Información Básica", description: "Datos" },
    {
      id: 2,
      name: "Ubicación y Contacto",
      description: "Dirección y Comunicación",
    },
    { id: 3, name: "Administración", description: "Gestión y Horarios" },
    { id: 4, name: "Configuración Comercial", description: "Métodos de Pago" },
    { id: 5, name: "Confirmación", description: "Revisión Final" },
  ];

  const validateStep = () => {
    let result;

    switch (currentStep) {
      case 1:
        result = step1Schema.safeParse(formData);
        break;
      case 2:
        result = step2Schema.safeParse(formData);
        break;
      case 3:
        result = step3Schema.safeParse(formData);
        break;
      case 4:
        result = step4Schema.safeParse(formData);
        break;
      default:
        return true;
    }

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      const errorMap = result.error.format();
      for (const key in errorMap) {
        if (key !== "_errors") {
          formattedErrors[key] = errorMap[key]?._errors?.[0] || "";
        }
      }
      setFormErrors(formattedErrors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {return;}
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = () => {
    const result = branchSchema.safeParse(formData);

    if (!result.success) {
      console.error("Errores de validación:", result.error.format());
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    console.log("Datos del formulario:", result.data);
    alert("Sucursal Creada");
    onClose(); // cerrar modal si todo está bien
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const nextStyles =
    " hover:bg-orange-600 text-white px-8 py-2 rounded-md font-medium flex items-center gap-2 transition-colors";

  return (
    <Card
      className="w-full max-w-4xl max-h-[90vh] mx-auto my-auto overflow-y-auto border"
      onClick={(e) => e.stopPropagation()}
    >
      <CardHeader className="sticky top-0 bg-white z-10 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-2xl font-bold text-gray-800">
            CREAR NUEVA SUCURSAL
          </CardTitle>

          <div className="flex items-center gap-4">
            <Image
              src="/images/logo-vitalfit.png"
              alt="Logo Vitalfit"
              width={148}
              height={148}
              priority
            />
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <p className="text-sm text-gray-600 mb-8">
          Complete los siguientes pasos para crear una nueva sucursal
        </p>

        <Wizard steps={steps} currentStep={currentStep} />
        <StepForm
          step={currentStep}
          formData={formData}
          onChange={handleInputChange}
          formErrors={formErrors}
        />
      </CardContent>

      <CardFooter className="flex justify-between px-6 pb-6">
        <Button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Anterior
          </span>
        </Button>
        <Button
          onClick={currentStep === steps.length ? handleSubmit : handleNext}
          className={
            currentStep === steps.length
              ? "bg-green-500" + nextStyles
              : "bg-orange-500" + nextStyles
          }
        >
          {currentStep === steps.length ? (
            "Crear Sucursal"
          ) : (
            <span className="flex items-center gap-2">
              Siguiente
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
