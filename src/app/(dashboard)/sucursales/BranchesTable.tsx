"use client";
import { Column, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { RefreshCcw, RotateCwIcon } from "lucide-react";
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
  },
  {
    header: "Status",
    accessor: "status",
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

const sucursales: Branches[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `00${i + 1}`,
  name: "VitalFit - Centro",
  rif: "J-12345678-9",
  administrator: "Ana García",
  location: "Avenida Principal 123, Ciudad",
  country: "Venezuela",
  status: i < 10 ? "active" : i < 20 ? "inactive" : "maintenance",
}));

export default function BranchesTable() {
  const [page, setPage] = useState(1);

  return (
    <DataTable
      columns={branchesColumns}
      data={sucursales}
      page={page}
      pageSize={10}
      onPageChange={setPage}
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
  );
}
