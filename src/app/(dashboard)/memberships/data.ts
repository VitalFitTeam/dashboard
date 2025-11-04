import { Membership } from "@/models/membership";

export const MembershipData: Membership[] = [
  {
    id: "001",
    name: "Básica mensual",
    description: "Acceso a áreas de pesas y cardio. No incluye clases grupales",
    duration: 30,
    price: 35,
    status: "Active",
  },
  {
    id: "002",
    name: "Premium Anula",
    description:
      "Acceso completo +  todas las clases + consultas nutricionales",
    duration: 365,
    price: 380,
    status: "Inactive",
  },
  {
    id: "003",
    name: "Clase Individual",
    description: "Acceso a una clase grupal específica",
    duration: 15,
    price: 12,
    status: "Inactive",
  },
  {
    id: "004",
    name: "Plan Corporativo",
    description: "Membresía para empresas (min. 10 empleados)",
    duration: 90,
    price: 280,
    status: "Active",
  },
  {
    id: "005",
    name: "Pack Trimestral",
    description: "Acceso completo + spa",
    duration: 30,
    price: 28,
    status: "Inactive",
  },
];
