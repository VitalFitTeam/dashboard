"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { Notification } from "@/components/ui/Notification";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";

interface Client {
  client_id: string;
  first_name: string;
  last_name: string;
  email: string;
  category: string;
  status: string;
}

interface ClientsTableProps {
  data: Client[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string; category: string };
  onFilterChange: (filters: { search?: string; category?: string }) => void;
}

export default function ClientsTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: ClientsTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
    variant: "success" as "success" | "destructive",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput.trim() === "") {
        if (filters.search !== "") {
          onFilterChange({ search: "" });
        }
      } else if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleView = (row: Client) => {
    router.replace(`/clients/${row.client_id}`);
  };

  const handleEdit = (row: Client) => {
    router.replace(`/clients/${row.client_id}/edit`);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!token) {
      setNotification({
        isVisible: true,
        title: "Error",
        description: "No hay token de autenticación",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await api.user.deleteUser(client.client_id, token);

      setNotification({
        isVisible: true,
        title: "Éxito",
        description: "Cliente eliminado correctamente",
        variant: "success",
      });

      setDeleteRowId(null);

      setTimeout(() => {
        onReload();
      }, 1000);
    } catch (error: any) {
      console.error("Error deleting client:", error);

      let errorMessage = "Error al eliminar el cliente";

      if (error.status === 403) {
        errorMessage = "No tienes permisos para eliminar clientes";
      } else if (error.status === 404) {
        errorMessage = "Cliente no encontrado";
      } else if (error.status === 401) {
        errorMessage = "Sesión expirada. Por favor inicia sesión nuevamente";
        router.replace("/login");
      } else if (error.messages && Array.isArray(error.messages)) {
        errorMessage = error.messages.join(", ");
      }

      setNotification({
        isVisible: true,
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "secondary",
      inactive: "destructive",
      blocked: "destructive",
      pending: "outline"
    };

    const labels: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      blocked: "Bloqueado",
      pending: "Pendiente"
    };

    const normalizedStatus = status?.toLowerCase() || "inactive";

    const displayStatus = normalizedStatus === "blocked" ? "inactive" : normalizedStatus;

    return (
      <Badge variant={variantMap[displayStatus] || "default"}>
        {labels[displayStatus] || status}
      </Badge>
    );
  };

  const columns: Column<Client>[] = [
    {
      header: "Nombre",
      accessor: "first_name",
      filterType: "text",
      render: (_, row) => `${row.first_name} ${row.last_name}`
    },
    {
      header: "Email",
      accessor: "email",
      filterType: "text"
    },
    {
      header: "Categoría",
      accessor: "category",
      filterType: "text"
    },
    {
      header: "Status",
      accessor: "status",
      filterType: "text",
      render: (value) => <StatusBadge status={value as string} />
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar nombre o email"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange({ category: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="new">Nuevo</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Descargar
        </Button>
      </div>

      <DataTable<Client>
        key={`page-${page}-${data.length}`}
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="client_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver Detalles", icon: Eye, onClick: () => handleView(row) },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => handleEdit(row),
                },
                {
                  label: "Eliminar",
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.client_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />

            {deleteRowId === row.client_id && (
              <GeneralAlertDialog
                open={true}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
                actionText="Eliminar"
                cancelText="Cancelar"
                onAction={() => handleDeleteClient(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
      />

      {notification.isVisible && (
        <Notification
          variant={notification.variant}
          title={notification.title}
          description={notification.description}
          onClose={hideNotification}
          autoCloseDuration={3000}
        />
      )}
    </>
  );
}