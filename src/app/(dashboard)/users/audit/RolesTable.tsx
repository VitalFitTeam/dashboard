"use client";
import { useState, useEffect, useMemo } from "react";
import { Roles } from "@/models/roles";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ArrowDownTray from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { Notification } from "@/components/ui/Notification";

interface RolesTableProps {
  onView: (role: Roles) => void;
  onEdit: (role: Roles) => void;
}

interface ApiRole {
  role_id: string;
  name: string;
  description: string;
}

interface ApiResponse {
  data: ApiRole[];
  message?: string;
  success?: boolean;
  count?: number;
}

export default function RolesTable({ onView, onEdit }: RolesTableProps) {
  const [page, setPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Roles | null>(null);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [inputFilters, setInputFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);

  const { token } = useAuth();

  const [rolesData, setRolesData] = useState<Roles[]>([]);

  const filteredData = useMemo(() => {
    if (!inputFilters.search) {
      return rolesData;
    }

    const searchTerm = inputFilters.search.toLowerCase().trim();
    
    return rolesData.filter(role => 
      role.name?.toLowerCase().includes(searchTerm) ||
      role.description?.toLowerCase().includes(searchTerm) ||
      role.id?.toLowerCase().includes(searchTerm)
    );
  }, [rolesData, inputFilters.search]);

  const handleDeleteRole = async (role: Roles) => {
    if (!token) {
      setDeleteError("No hay token de autenticación disponible");
      return;
    }

    if (!role?.id) {
      setDeleteError("No se puede eliminar: ID de rol no válido");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await api.RBAC.deleteRole(role.id, token);
      
      console.warn("Respuesta de eliminación:", response);
      setShowDeleteNotification(true);
    
      setDeleteRowId(null);
      setSelectedRole(null);
    
      setTimeout(() => {
        fetchRoles();
      }, 2000);
      
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      setDeleteError(
        error instanceof Error 
          ? error.message 
          : "Error desconocido al eliminar el rol"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Roles>[] = [
    {
      header: "ID",
      accessor: "id",
      render: (id) => (
        <div className="w-28 truncate" title={id as string}>
          {id as string}
        </div>
      ),
    },
    { header: "Nombre", accessor: "name", filterType: "text" },
    { header: "Descripcion", accessor: "description", filterType: "text" },
  ];

  const fetchRoles = async () => {
    if (!token) {
      console.log("No hay token disponible");
      return;
    }

    setIsLoading(true);
    try {
      const response: ApiResponse = await api.RBAC.getRoles(token);
      if (response && response.data && Array.isArray(response.data)) {
        const mapped: Roles[] = response.data.map((item: ApiRole) => ({
          id: item.role_id,
          name: item.name,
          description: item.description,
        }));
        setRolesData(mapped);
      } else {
        console.error("Estructura de respuesta inesperada:", response);
        setRolesData([]);
      }
    } catch (error) {
      console.error("Error al obtener roles:", error);
      setRolesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div>Cargando roles...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, descripción o ID"
            className="pl-9"
            value={inputFilters.search || ""}
            onChange={(e) =>
              setInputFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <ArrowDownTray className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>

      {deleteError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{deleteError}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setDeleteError(null)}
          >
            Cerrar
          </Button>
        </Alert>
      )}

      <DataTable<Roles>
        columns={columns}
        data={filteredData}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
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
                  onClick: () => setDeleteRowId(row.id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.id && (
              <Alert className="mt-2 w-full max-w-md">
                <AlertTitle className="text-black">
                  Confirmar Eliminación
                </AlertTitle>
                <AlertDescription className="text-gray-900">
                  ¿Estás seguro de que deseas eliminar el rol "{row.name}"? 
                  Esta acción no se puede deshacer.
                </AlertDescription>
                
                {deleteError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{deleteError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="border-white"
                    onClick={() => {
                      setDeleteRowId(null);
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    className="text-white"
                    onClick={() => handleDeleteRole(row)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 text-white mr-2" />
                        Eliminar
                      </>
                    )}
                  </Button>
                </div>
              </Alert>
            )}
          </div>
        )}
      />

      {showDeleteNotification && (
        <Notification
          variant="success"
          title="¡Éxito!"
          description="El rol ha sido eliminado correctamente"
          onClose={() => setShowDeleteNotification(false)}
          autoCloseDuration={2000}
        />
      )}
    </>
  );
}