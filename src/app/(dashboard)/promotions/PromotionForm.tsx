"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import {
  Promotion,
  CreatePromotionDTO,
  UpdatePromotionDTO,
} from "./PromotionsTable";

interface PromotionFormProps {
  promotion?: Promotion;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: CreatePromotionDTO | UpdatePromotionDTO) => Promise<void>;
  isSubmitting?: boolean;
  isViewer?: boolean;
}

export default function PromotionForm({
  promotion,
  onClose,
  onSuccess,
  onSubmit,
  isSubmitting = false,
  isViewer = false,
}: PromotionFormProps) {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<Partial<CreatePromotionDTO>>({
    code: promotion?.code || "",
    name: promotion?.name || "",
    description: promotion?.description || "",
    type: promotion?.type || "percentage",
    discount: promotion?.discount || 0,
    min_amount: promotion?.min_amount,
    max_discount: promotion?.max_discount,
    start_date: promotion?.start_date || "",
    end_date: promotion?.end_date || "",
    usage_limit: promotion?.usage_limit,
  });

  const steps = [
    { id: 1, name: "Información Básica", description: "Datos principales" },
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

  const handleSubmit = async () => {
    try {
      await onSubmit(formData as CreatePromotionDTO | UpdatePromotionDTO);
      onSuccess();
    } catch (error) {
      console.error("Error submitting promotion:", error);
      alert("Error al guardar la promoción");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let processedValue: any = value;

    if (type === "number") {
      processedValue = value === "" ? undefined : parseFloat(value);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleCustomChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Componente para mostrar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Código *
                </label>
                <input
                  name="code"
                  value={formData.code || ""}
                  onChange={handleChange}
                  placeholder="EJ: VERANO25"
                  disabled={!!promotion}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {formErrors["code"] && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors["code"]}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Código único para la promoción
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nombre de promoción *
                </label>
                <input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Nombre de la promoción"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isViewer}
                />
                {formErrors["name"] && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors["name"]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tipo de Descuento *
                </label>
                <select
                  name="type"
                  value={formData.type || ""}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isViewer}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed_amount">Monto Fijo ($)</option>
                </select>
                {formErrors["type"] && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors["type"]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Valor del descuento
                </label>
                <input
                  name="discount"
                  type="number"
                  value={formData.discount || ""}
                  onChange={handleChange}
                  min="0"
                  step={formData.type === "percentage" ? "0.1" : "0.01"}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isViewer}
                />
                {formErrors["discount"] && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors["discount"]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Fecha de Inicio *
                </label>
                <input
                  name="start_date"
                  type="date"
                  value={formData.start_date || ""}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isViewer}
                />
                {formErrors["start_date"] && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors["start_date"]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Fecha de Fin *
                </label>
                <input
                  name="end_date"
                  type="date"
                  value={formData.end_date || ""}
                  onChange={handleChange}
                  min={
                    formData.start_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isViewer}
                />
                {formErrors["end_date"] && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors["end_date"]}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card
        className="w-full max-w-4xl max-h-[90vh] mx-auto my-auto overflow-y-auto border"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="sticky top-0 bg-white z-10 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isViewer && promotion
                ? "VER PROMOCIÓN"
                : promotion
                  ? "EDITAR PROMOCIÓN"
                  : "CREAR NUEVA PROMOCIÓN"}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo-vitalfit.png"
                alt="Logo Vitalfit"
                width={148}
                height={40}
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

        <CardContent className="p-6 pt-4">
          <p className="text-sm text-gray-600 mb-6">
            {isViewer
              ? "Información de la promoción"
              : promotion
                ? "Modifica la información de la promoción"
                : "Agrega la información de la promoción"}
          </p>
          <div className="mt-8">{renderCurrentStep()}</div>
        </CardContent>

        <CardFooter className="flex justify-end px-6 pb-6 border-t pt-6">
          {!isViewer && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#F27F2A] hover:bg-[#E57225]"
            >
              {currentStep === steps.length ? (
                isSubmitting ? (
                  "Guardando..."
                ) : promotion ? (
                  "Actualizar Promoción"
                ) : (
                  "Crear Promoción"
                )
              ) : (
                <>
                  Siguiente
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
