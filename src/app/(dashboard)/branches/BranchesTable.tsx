"use client";
import { Column, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import SucursalesForm from "@/app/(dashboard)/branches/SucursalesForm";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";

type Branches = {
  id: string;
  name: string;
  rif: string;
  administrator: string;
  location: string;
  country: string;
  status: "active" | "inactive" | "maintenance";
};

const branchesColumns: Column<Branches>[] = [
  {
    header: "ID",
    accessor: "id",
  },
  {
    header: "Nombre",
    accessor: "name",
    filterType: "text",
  },
  {
    header: "RIF",
    accessor: "rif",
  },
  {
    header: "Administrador",
    accessor: "administrator",
  },
  {
    header: "Ubicación",
    accessor: "location",
  },
  {
    header: "País",
    accessor: "country",
    filterType: "select",
    filterOptions: [
      { label: "Venezuela", value: "Venezuela" },
      { label: "Colombia", value: "Colombia" },
      { label: "Perú", value: "Perú" },
    ],
  },
  {
    header: "Status",
    accessor: "status",
    filterType: "select",
    filterOptions: [
      { label: "Activa", value: "active" },
      { label: "Inactiva", value: "inactive" },
      { label: "En mantenimiento", value: "maintenance" },
    ],
    render: (value) => {
      let displayText = "";
      let color = "";

      switch (value) {
        case "active":
          displayText = "Activa";
          color = "text-green-700 border-green-300";
          break;
        case "inactive":
          displayText = "Inactiva";
          color = "text-red-700 border-red-300";
          break;
        case "maintenance":
          displayText = "En mantenimiento";
          color = "text-yellow-700 border-yellow-300";
          break;
        default:
          displayText = "Desconocido";
          color = "bg-gray-100 text-gray-700 border-gray-300";
      }

      return (
        <Badge variant="outline" className={`border ${color}`}>
          {displayText}
        </Badge>
      );
    },
  },
];

const sucursales: Branches[] = [
  {
    id: "001",
    name: "VitalFit Centro",
    rif: "J-12345678-9",
    administrator: "Ana García",
    location: "Avenida Principal 123, Caracas",
    country: "Venezuela",
    status: "active",
  },
  {
    id: "002",
    name: "PowerGym Norte",
    rif: "J-98765432-1",
    administrator: "Luis Pérez",
    location: "Calle 45, Bogotá",
    country: "Colombia",
    status: "inactive",
  },
  {
    id: "003",
    name: "FitLife Sur",
    rif: "J-11112222-3",
    administrator: "María López",
    location: "Av. Los Próceres 200, Lima",
    country: "Perú",
    status: "maintenance",
  },
  {
    id: "004",
    name: "GymMax Centro",
    rif: "J-44445555-6",
    administrator: "Carlos Fernández",
    location: "Calle 10, Valencia",
    country: "Venezuela",
    status: "active",
  },
  {
    id: "005",
    name: "Energy Gym Este",
    rif: "J-66667777-8",
    administrator: "Laura Gómez",
    location: "Av. Libertador 50, Medellín",
    country: "Colombia",
    status: "inactive",
  },
  {
    id: "006",
    name: "Health Club Oeste",
    rif: "J-99990000-1",
    administrator: "Pedro Martínez",
    location: "Av. Perú 123, Lima",
    country: "Perú",
    status: "active",
  },
  {
    id: "007",
    name: "Muscle Factory",
    rif: "J-22223333-4",
    administrator: "Sofía Ramírez",
    location: "Av. Bolívar 75, Caracas",
    country: "Venezuela",
    status: "maintenance",
  },
  {
    id: "008",
    name: "Iron Gym Norte",
    rif: "J-55556666-7",
    administrator: "Jorge Torres",
    location: "Calle 7, Bogotá",
    country: "Colombia",
    status: "active",
  },
  {
    id: "009",
    name: "FitWorld",
    rif: "J-88889999-0",
    administrator: "Camila Díaz",
    location: "Av. Lima 321, Lima",
    country: "Perú",
    status: "inactive",
  },
  {
    id: "010",
    name: "VitalFit Sur",
    rif: "J-10101010-2",
    administrator: "Andrés Silva",
    location: "Calle 5, Valencia",
    country: "Venezuela",
    status: "active",
  },
];

export default function BranchesTable() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="border border-gray-500 hover:bg-orange-400 text-gray px-4 py-2 rounded-sm text-sm font-medium"
        >
          + Crear Sucursal
        </button>
      </div>
      <DataTable
        columns={branchesColumns}
        data={sucursales}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        enableFilters
        actions={() => (
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost">
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <SucursalesForm onClose={() => setShowModal(false)} />
        </div>
      )}
    </>
  );
}
