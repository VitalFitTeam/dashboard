"use client";
import { Button } from "@/components/ui/button";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import StarIconOutline from "@heroicons/react/24/outline/StarIcon";
import StarIconSolid from "@heroicons/react/24/solid/StarIcon";
import EllipsisVerticalIcon from "@heroicons/react/24/outline/EllipsisVerticalIcon";
import { useState } from "react";
import { Service } from "@/models/service";
import { ServicesData } from "./data";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { json } from "zod";

type ServiceRow = Service & { featured?: boolean | null };

export default function ServicesTable() {
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    alert("Editar detalles del servicio " + JSON.stringify(service));
  };
  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    alert("Ver detalles del servicio" + JSON.stringify(service));
  };

  /*const handleDeleteService = async (Service: Service) => { // 'Service' es tu tipo de dato
    const confirmed = window.confirm(`¿Seguro que deseas eliminar la Promo "${Service.name}"?`);
    if (!confirmed) {
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Error de autenticación. Intenta iniciar sesión de nuevo.");
        return;
      }
  
      await deleteService(Service.id, token);
      to.success("Servicio eliminado correctamente ✅");
  
      // ✅ Usa el router de Next.js para refrescar la data sin recargar
      router.refresh(); 
  
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar el Servicio ❌");
    }
  };*/

  const columns: Column<ServiceRow>[] = [
    {
      header: "ID",
      accessor: "id",
      render: (id) => (
        <div className="w-28 truncate text-center" title={id as string}>
          {id as string}
        </div>
      ),
    },
    {
      header: "Nombre",
      accessor: "name",
      filterType: "text",
      filterable: true,
      render: (v) => <div className="text-center">{v as string}</div>,
    },
    {
      header: "Categoria",
      accessor: "categoryId",
      filterType: "text",
      filterable: true,
      render: (v) => <div className="text-center">{v as string}</div>,
    },
    {
      header: "Duración",
      accessor: "durationMinutes",
      filterType: "text",
      filterable: false,
      render: (v) => (
        <div className="text-center">{v ? `${v} min` : "N/A"}</div>
      ),
    },
    {
      header: "Destacado",
      accessor: "featured",
      render: (v) => (
        <div className="text-center">
          {(v as boolean) ? (
            <StarIconSolid className="h-5 w-5 text-black-500 inline-block" />
          ) : (
            <StarIconOutline className="h-5 w-5 text-black-500 inline-block" />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable<ServiceRow>
        columns={columns}
        data={ServicesData}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" title="Acciones">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(row)}>
                    <EyeIcon className="h-4 w-4" />
                    <span className="ml-2">Ver Detalles</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditService(row)}>
                    <PencilIcon className="h-4 w-4" />
                    <span className="ml-2">Modificar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteRowId(row.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="ml-2 text-red-500">Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {deleteRowId === row.id && (
              <Alert className="mt-2 w-full max-w-md">
                <AlertTitle className="text-black">
                  Confirmar Eliminación
                </AlertTitle>
                <AlertDescription className="text-gray-900">
                  ¿Estás seguro de que deseas eliminar este servicio? Esta
                  acción no se puede deshacer.
                </AlertDescription>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="border-white"
                    onClick={() => setDeleteRowId(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    className="text-white"
                    onClick={() => {
                      setDeleteRowId(null);
                      alert(`Servicio eliminado: ${row.name}`);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                    Eliminar
                  </Button>
                </div>
              </Alert>
            )}
          </div>
        )}
      />
    </>
  );
}
