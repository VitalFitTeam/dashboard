import { Service } from "@/models/service";

export const ServicesData: (Service & { featured?: boolean })[] = [
  {
    id: "001",
    name: "Clase de Yoga Vinyasa",
    categoryId: "Clases Grupales",

    durationMinutes: 5,
    featured: true,
  },
  {
    id: "002",
    name: "Plan Nutricional Básico",
    categoryId: "Nutrición",
    durationMinutes: 5,
    featured: true,
  },
  {
    id: "004",
    name: "Acceso a Sala de Pesas",
    categoryId: "Acceso Gimnasio",
    durationMinutes: null,
    featured: false,
  },
  {
    id: "005",
    name: "Acceso a Sala de Pesas",
    categoryId: "Acceso Gimnasio",
    durationMinutes: null,
    featured: false,
  },
];
