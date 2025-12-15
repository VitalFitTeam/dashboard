"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/sdk-config";
import { DataTable, Column } from "@/components/ui/table/DataTable";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RowActions } from "@/components/ui/table/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { Notification } from "@/components/ui/Notification";

export type StaffUserTable = {
  user_id: string;
  first_name: string;
  last_name: string;
  role_id: string;
  role_name: string;
  email: string;
  identity_document: string;
  is_validated: boolean;
};

export default function UsersTable() {
  const [users, setUsers] = useState<StaffUserTable[]>([]);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputFilters, setInputFilters] = useState<{ search?: string; status?: string }>({});
  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
  });

  const router = useRouter();
  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.user.getStaffUsers({ limit: 100 }, token);
      const mapped = (response.data as any[]).map((u) => ({
        user_id: u.user_id,
        first_name: u.first_name,
        last_name: u.last_name,
        role_id: u.role_id,
        role_name: u.role_name,
        email: u.email,
        identity_document: u.identity_document,
        is_validated: u.is_validated,
      })) as StaffUserTable[];
      setUsers(mapped);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setNotification({
        isVisible: true,
        description: "Error al cargar usuarios",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleView = (user: StaffUserTable) => router.replace(`/users/${user.user_id}`);
  const handleEdit = (user: StaffUserTable) => router.replace(`/users/${user.user_id}/edit`);

  const handleDeleteUser = async () => {
    if (!token || !deleteRowId) { return; }

    const userToDelete = users.find(u => u.user_id === deleteRowId);
    if (!userToDelete) { return; }

    try {
      await api.user.deleteUser(userToDelete.user_id, token);

      setNotification({
        isVisible: true,
        description: "Usuario eliminado exitosamente",
        title: "Éxito",
      });

      setDeleteRowId(null);

      setTimeout(() => {
        fetchUsers();
      }, 1000);

    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setNotification({
        isVisible: true,
        description: "Error al eliminar el usuario",
        title: "Error",
      });
      setDeleteRowId(null);
    }
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const columns: Column<StaffUserTable>[] = [
    {
      header: "Nombre",
      accessor: "first_name",
      render: (_, row) => `${row.first_name} ${row.last_name}`,
    },
    { header: "Email", accessor: "email" },
    { header: "Rol", accessor: "role_name", render: (value) => value },
    {
      header: "Status",
      accessor: "is_validated",
      render: (value) =>
        value ? (
          <Badge variant="outline" className="border text-green-700 border-green-300">
            Activo
          </Badge>
        ) : (
          <Badge variant="outline" className="border text-red-700 border-red-300">
            Inactivo
          </Badge>
        ),
    },
  ];

  // aplicar filtros
  const filteredUsers = users.filter((u) => {
    const searchMatch = inputFilters.search
      ? `${u.first_name} ${u.last_name} ${u.identity_document}`
        .toLowerCase()
        .includes(inputFilters.search.toLowerCase())
      : true;

    const statusMatch = inputFilters.status
      ? inputFilters.status === "active"
        ? u.is_validated
        : inputFilters.status === "inactive"
          ? !u.is_validated
          : true
      : true;

    return searchMatch && statusMatch;
  });

  return (
    <div>
      {loading && users.length === 0 && <p>Cargando usuarios...</p>}
      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-[250px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o RIF"
              className="pl-9"
              value={inputFilters.search || ""}
              onChange={(e) =>
                setInputFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          <Select
            value={inputFilters.status || ""}
            onValueChange={(value) =>
              setInputFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="inactive">Inactiva</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="ml-auto">
          <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <DataTable<StaffUserTable>
        columns={columns}
        data={filteredUsers}
        pageSize={10}
        rowIdKey="user_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver Detalles", icon: Eye, onClick: () => handleView(row) },
                { label: "Modificar", icon: Pencil, onClick: () => handleEdit(row) },
                {
                  label: "Eliminar",
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.user_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
          </div>
        )}
      />

      <GeneralAlertDialog
        open={!!deleteRowId}
        onOpenChange={(open) => {
          if (!open) { setDeleteRowId(null); }
        }}
        trigger={null}
        title="Confirmar Eliminación"
        description="¿Estás seguro de que deseas eliminar este Usuario? Esta acción no se puede deshacer."
        actionText="Eliminar"
        cancelText="Cancelar"
        onAction={handleDeleteUser}
        actionVariant="destructive"
      />

      {notification.isVisible && (
        <Notification
          title={notification.title}
          description={notification.description}
          onClose={hideNotification}
          autoCloseDuration={3000}
          variant={notification.title === "Error" ? "destructive" : "success"}
        />
      )}
    </div>
  );
}