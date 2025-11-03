"use client";

import StepNotification from "../../StepNotification";
import { Checkbox } from "@/components/ui/checkbox";
import * as React from "react";

type StepProps = {
  formData: any;
  formErrors?: Record<string, string>;
};

const defaultPolicies = [
  { id: "p1", text: "Inscripción totalmente gratuita por tiempo limitado." },
  {
    id: "p2",
    text: "Membresía flexible con un periodo mínimo de cancelación de solo 1 mes.",
  },
  {
    id: "p3",
    text: "Acceso a entrenador personal de planta sin costo adicional en cada horario.",
  },
  { id: "p4", text: "Clases especializadas para adultos +50 años." },
  {
    id: "p5",
    text: "Beneficio 'Trae un amigo': 15 días de acceso gratuito para un acompañante.",
  },
  {
    id: "p6",
    text: "Diversidad de clases grupales incluidas: Baile, Boxeo, Yoga y más.",
  },
  { id: "p7", text: "Estacionamiento exclusivo/gratuito para miembros." },
  {
    id: "p8",
    text: "Compromiso con la seguridad: Instalaciones seguras y monitoreadas para una experiencia libre de preocupaciones.",
  },
];

export default function Step4({ formData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Políticas Comerciales
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Seleccionas las políticas comerciales correspondientes para la
          sucursal
        </p>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-700">
            Selecciona dándole al check las políticas
          </p>
          {defaultPolicies.map((policy) => (
            <div key={policy.id} className="flex items-start space-x-3">
              <Checkbox
                id={policy.id}
                className="mt-1 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label
                htmlFor={policy.id}
                className="text-sm font-normal leading-tight text-gray-700 cursor-pointer"
              >
                {policy.text}
              </label>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Estas políticas serán visibles para los miembros de esta sucursal
        </p>
      </div>

      <StepNotification
        title="Listo para crear"
        description="Revise la información antes de confirmar. Una vez creada la sucursal, podrá modificar estos datos desde la gestión de sucursales."
      />
    </div>
  );
}
