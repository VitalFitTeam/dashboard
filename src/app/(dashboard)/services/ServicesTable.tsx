"use client";
import { useState, useEffect } from "react"; // ⬅️ Añadido useEffect para la carga de datos
// import { Service } from "@/models/service";
// import { ServicesData } from "./data";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Eye, Pencil, Trash2 } from "lucide-react";
import StarIconOutline from "@heroicons/react/24/outline/StarIcon";
import StarIconSolid from "@heroicons/react/24/solid/StarIcon";
// Asumiendo que ServiceFullDetail es el tipo completo de tu SDK
import { ServiceFullDetail } from "@vitalfit/sdk";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";

interface ServiceTableProps {
  // Se eliminan 'services' y 'onDataChange' para que el componente sea autónomo
  onView: (service: ServiceFullDetail) => void;
  onEdit: (service: ServiceFullDetail) => void;
}

// ServiceRow ahora usa el tipo correcto ServiceFullDetail
type ServiceRow = ServiceFullDetail;

// 🔑 Se eliminan las props de datos innecesarias
export default function ServicesTable({
  services,
  onView,
  onEdit,
}: ServiceTableProps) {
  const [page, setPage] = useState(1); // 🔑 ESTADO DE DATOS: La tabla ahora gestiona su propia lista de servicios
  const [service, setService] = useState<ServiceFullDetail[]>([]); // 🔑 ESTADO DE CARGA: Para manejar la carga inicial
  const [isLoading, setIsLoading] = useState(true); // ESTADO: Para manejar qué servicio está pendiente de eliminación
  const [serviceToDelete, setServiceToDelete] =
    useState<ServiceFullDetail | null>(null); // ESTADO: Para manejar el estado de la llamada a la API
  const [isDeleting, setIsDeleting] = useState(false);
  const { token } = useAuth(); // Obtenemos el token aquí
  // 🔑 FUNCIÓN DE CARGA: Carga los servicios internamente

  const fetchServices = async () => {
    if (!token) {return;}

    setIsLoading(true);
    try {
      const response = await api.products.getServices(token);
      setService(response.data || []);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      setService([]);
    } finally {
      setIsLoading(false);
    }
  }; // 🔑 EFECTO: Llama a la función de carga al montar el componente (y cuando el token esté disponible)

  useEffect(() => {
    fetchServices();
  }, [token]); // Lógica que inicia el flujo de eliminación (mostrar modal)

  const handleDeleteClick = (service: ServiceFullDetail) => {
    setServiceToDelete(service);
  }; // Lógica que ejecuta la eliminación (llamada a la API)

  const deleteService = async () => {
    if (!serviceToDelete || !token) {return;}

    setIsDeleting(true);
    try {
      // Llamada a la API de eliminación
      await api.products.deleteService(serviceToDelete.service_id, token);
      console.log(`Servicio ${serviceToDelete.service_id} eliminado.`); // 🔑 CRUCIAL: Recarga los datos inmediatamente después de la eliminación exitosa
      await fetchServices();
    } catch (error) {
      console.error("Error al eliminar servicio:", error); // Aquí podrías implementar un estado de error para mostrar un mensaje al usuario
    } finally {
      setServiceToDelete(null); // Cerrar la alerta de confirmación
      setIsDeleting(false);
    }
  };
  const columns: Column<ServiceRow>[] = [
    {
      header: "ID",
      accessor: "service_id",
      render: (id) => (
        <div className="w-28 truncate text-center" title={id as string}>
                    {id as string}       {" "}
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
      header: "Categoría",
      accessor: "category_id",
      filterType: "text",
      filterable: true,
      render: (v, row) => (
        <div className="text-center">
          {row.service_category?.name || (v as string)}
        </div>
      ),
    },
    {
      header: "Duración",
      accessor: "duration_minutes",
      filterType: "text",
      filterable: false,
      render: (v) => (
        <div className="text-center">{v ? `${v} min` : "N/A"}</div>
      ),
    },
    {
      header: "Destacado",
      accessor: "is_featured",
      render: (v) => (
        <div className="text-center">
                   {" "}
          {(v as boolean) ? (
            <StarIconSolid className="h-5 w-5 text-yellow-500 inline-block" />
          ) : (
            <StarIconOutline className="h-5 w-5 text-gray-400 inline-block" />
          )}
                 {" "}
        </div>
      ),
    },
  ]; // 🔑 Mostrar estado de carga

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
               {" "}
        <h2 className="text-lg font-medium text-gray-600">
          Cargando tabla de servicios...
        </h2>
             {" "}
      </div>
    );
  }

  return (
    <>
           {" "}
      <DataTable<ServiceRow>
        columns={columns}
        data={services} // 🔑 Usa los servicios del estado local
        page={page}
        pageSize={10}
        onPageChange={setPage}
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
                       {" "}
            <RowActions
              actions={[
                {
                  label: "Ver Detalles",
                  icon: Eye,
                  onClick: () => onView(row),
                },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => onEdit(row),
                },
                {
                  label: "Eliminar",
                  icon: Trash2,
                  onClick: () => handleDeleteClick(row),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
                     {" "}
          </div>
        )}
      />
            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}     {" "}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                   {" "}
          <Alert className="w-full max-w-md bg-white p-6 shadow-2xl rounded-lg">
                       {" "}
            <AlertTitle className="text-xl font-bold text-red-600 flex items-center">
                            <Trash2 className="h-6 w-6 mr-2" /> Confirmar
              Eliminación            {" "}
            </AlertTitle>
                       {" "}
            <AlertDescription className="text-gray-700 mt-3">
                            ¿Estás seguro de que deseas eliminar el servicio **
              {serviceToDelete.name}**? Esta acción no se puede deshacer.      
                   {" "}
            </AlertDescription>
                       {" "}
            <div className="flex justify-end gap-3 mt-6">
                           {" "}
              <Button
                variant="outline"
                onClick={() => setServiceToDelete(null)}
                disabled={isDeleting}
              >
                                Cancelar              {" "}
              </Button>
                           {" "}
              <Button
                variant="destructive"
                onClick={deleteService}
                disabled={isDeleting}
              >
                                {isDeleting ? "Eliminando..." : "Eliminar"}     
                       {" "}
              </Button>
                         {" "}
            </div>
                     {" "}
          </Alert>
                 {" "}
        </div>
      )}
         {" "}
    </>
  );
}
