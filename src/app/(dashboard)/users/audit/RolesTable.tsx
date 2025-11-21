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
import { DataResponse, RoleResponse, Permission } from "@vitalfit/sdk";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Notification } from "@/components/ui/Notification";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";

export default function RolesTable() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Roles | null>(null);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [inputFilters, setInputFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);

  const { token } = useAuth();
  const router = useRouter();

  const [rolesData, setRolesData] = useState<Roles[]>([]);

  // Calcular total de páginas
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const filteredData = useMemo(() => {
    if (!inputFilters.search) {
      return rolesData;
    }

    const searchTerm = inputFilters.search.toLowerCase().trim();

    return rolesData.filter(
      (role) =>
        role.name?.toLowerCase().includes(searchTerm) ||
        role.description?.toLowerCase().includes(searchTerm) ||
        role.id?.toLowerCase().includes(searchTerm),
    );
  }, [rolesData, inputFilters.search]);

  const handleView = (row: Roles) => {
    router.push(`/users/audit/${row.id}`);
  };

  const handleEdit = (row: Roles) => {
    router.push(`/users/audit/${row.id}/edit`);
  };

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

      // Recargar los datos manteniendo la página actual
      fetchRoles(page);
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Error desconocido al eliminar el rol",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para mostrar permisos de forma resumida
  const getPermissionsCount = (
    permissions: Permission[] | undefined,
  ): string => {
    if (!permissions || permissions.length === 0) {
      return "0 permisos";
    }
    return `${permissions.length} permiso${permissions.length !== 1 ? "s" : ""}`;
  };

  const columns: Column<Roles>[] = [
    {
      header: "Nombre",
      accessor: "name",
      filterType: "text",
    },
    {
      header: "Descripción",
      accessor: "description",
      filterType: "text",
      render: (description) => (
        <div className="max-w-[200px] truncate" title={description as string}>
          {description as string}
        </div>
      ),
    },
    {
      header: "Permisos",
      accessor: "Permission",
      render: (permissions) => (
        <div className="max-w-[100px] truncate">
          {getPermissionsCount(permissions as Permission[])}
        </div>
      ),
    },
  ];

  const fetchRoles = async (currentPage: number = page) => {
    if (!token) {
      console.log("No hay token disponible");
      return;
    }

    setIsLoading(true);
    try {
      // Llamar a la API con los parámetros de paginación
      const response = await api.RBAC.getRoles(
        {
          page: currentPage,
          limit: pageSize,
          search: inputFilters.search || undefined,
          sort: "desc",
        },
        token,
      );

      const rolesArray = response.data || [];
      const total = response.total || 0;

      setTotalItems(total);

      if (Array.isArray(rolesArray)) {
        // Primero establecer los datos básicos
        const rolesWithoutPermissions = rolesArray.map(
          (role: RoleResponse) => ({
            id: role.role_id,
            name: role.name,
            description: role.description,
            Permission: [],
          }),
        );

        setRolesData(rolesWithoutPermissions);

        // Cargar los permisos en segundo plano
        const rolesWithPermissions = await Promise.all(
          rolesArray.map(async (role: RoleResponse) => {
            try {
              const permissionsResponse = await api.RBAC.getRoleByID(
                role.role_id,
                token,
              );
              const roleWithPermissions = permissionsResponse.data;

              return {
                id: role.role_id,
                name: role.name,
                description: role.description,
                Permission: roleWithPermissions?.permissions || [],
              };
            } catch (error) {
              console.error(
                `Error obteniendo permisos para rol ${role.role_id}:`,
                error,
              );
              return {
                id: role.role_id,
                name: role.name,
                description: role.description,
                Permission: [],
              };
            }
          }),
        );

        setRolesData(rolesWithPermissions);
      } else {
        console.error("La respuesta no contiene un array de roles:", response);
        setRolesData([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error al obtener roles:", error);
      setRolesData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambia la página o los filtros
  useEffect(() => {
    // Resetear a página 1 cuando cambia el filtro de búsqueda
    if (inputFilters.search !== undefined) {
      setPage(1);
      fetchRoles(1);
    }
  }, [inputFilters.search]);

  // Efecto para cargar datos cuando cambia la página
  useEffect(() => {
    fetchRoles(page);
  }, [page, token]);

  // Función para manejar cambios en el filtro de búsqueda con debounce
  const handleSearchChange = (value: string) => {
    setInputFilters((prev) => ({ ...prev, search: value }));
  };

  if (isLoading && rolesData.length === 0) {
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
            placeholder="Filtrar por nombre"
            className="pl-9"
            value={inputFilters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
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
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(newPage) => {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                {
                  label: "Ver Detalles",
                  icon: Eye,
                  onClick: () => handleView(row),
                },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => handleEdit(row),
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
              <GeneralAlertDialog
                open={true}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                title="Eliminar rol"
                description="¿Seguro que deseas eliminar este rol? Esta acción no se puede deshacer."
                type="confirmation"
                actionText={isDeleting ? "Eliminando..." : "Eliminar"}
                actionVariant="destructive"
                onAction={() => handleDeleteRole(row)}
              />
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
