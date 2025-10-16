"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";
import Wizard from "@/components/sucursales/Wizard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";

export default function SucursalesForm({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    razonSocial: "FitnessPlaza",
    rif: "J-402456896-3",
    ciudad: "",
    estatus: "",
  });

  const steps = [
    { id: 1, name: "Información Básica", description: "Datos" },
    { id: 2, name: "Ubicación y Contacto", description: "Dirección y Comunicación" },
    { id: 3, name: "Administración", description: "Gestión y Horarios" },
    { id: 4, name: "Configuración Comercial", description: "Métodos de Pago" },
    { id: 5, name: "Confirmación", description: "Revisión Final" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

      </CardContent>

      <CardFooter className="flex justify-between px-6 pb-6">
        <Button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <span className="flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                Atrás
            </span>
        </Button>
        <Button
            onClick={currentStep === steps.length ? onClose : handleNext}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
            >
            {currentStep === steps.length ? (
                "Finalizar"
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