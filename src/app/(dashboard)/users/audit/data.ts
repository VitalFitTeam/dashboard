import { Roles } from "@/models/roles";
export const RolesData: Roles[] = [
  {
    id: "001",
    name: "Albani Gabriela",
    description: "Administradora de sucursal con acceso completo.",
    permits: `
      inscripcion
      membresia
      entrenador
      seguridad
      adultos
      amigo
      grupales
      estacionamiento
    `,
  },
  {
    id: "002",
    name: "Carlos Eduardo",
    description: "Analista de datos con acceso a métricas.",
    permits: `
      inscripcion
      seguridad
      grupales
    `,
  },
  {
    id: "003",
    name: "María Fernanda",
    description: "Recepcionista encargada de atención al cliente.",
    permits: `
      inscripcion
      membresia
      amigo
      estacionamiento
    `,
  },
  {
    id: "004",
    name: "José Antonio",
    description: "Administrador con funciones de supervisión.",
    permits: `
      inscripcion
      entrenador
      seguridad
      adultos
      estacionamiento
    `,
  },
];
