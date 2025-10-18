"use client";

import StepNotification from "./StepNotification";

type StepProps = {
  formData: any;
};

const defaultPolicies = [
  "Inscripción totalmente gratuita por tiempo limitado.",
  "Membresía flexible con un periodo mínimo de cancelación de solo 1 mes.",
  "Acceso a entrenador personal de planta sin costo adicional en cada horario.",
  "Clases especializadas para adultos +50 años.",
  "Beneficio 'Trae un amigo': 15 días de acceso gratuito para un acompañante.",
  "Diversidad de clases grupales incluidas: Baile, Boxeo, Yoga y más.",
  "Estacionamiento exclusivo/gratuito para miembros.",
  "Wifi de alta velocidad gratuito.",
  "Compromiso con la seguridad: Instalaciones seguras y monitoreadas para una experiencia libre de preocupaciones.",
];

export default function Step5({ formData }: StepProps) {
  const policies = defaultPolicies;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Políticas Comerciales
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Defina las políticas comerciales que aplicarán para esta sucursal
        </p>

        <div className="border border-dashed border-orange-300 bg-orange-50 rounded-md p-4">
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
            {policies.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-2">
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
