// data.ts
export interface Cause {
  causes_id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export const mockCauses: Cause[] = [
  {
    causes_id: "1",
    name: "Falta de tiempo",
    description: "El cliente no tiene tiempo disponible para continuar",
    status: "active"
  },
  {
    causes_id: "2", 
    name: "Problemas económicos",
    description: "Situación financiera impide continuar con el servicio",
    status: "active"
  },
  {
    causes_id: "3",
    name: "Cambio de residencia",
    description: "Cliente se muda a otra ciudad o localidad",
    status: "inactive"
  },
  {
    causes_id: "4",
    name: "Insatisfacción con el servicio",
    description: "El servicio no cumplió con las expectativas",
    status: "active"
  },
  {
    causes_id: "5",
    name: "Problemas de salud",
    description: "Condiciones médicas que impiden continuar",
    status: "active"
  },
  {
    causes_id: "6",
    name: "Falta de motivación",
    description: "Pérdida de interés en continuar con el programa",
    status: "inactive"
  },
  {
    causes_id: "7",
    name: "Horarios incompatibles",
    description: "Los horarios no se ajustan a la disponibilidad del cliente",
    status: "active"
  }
];