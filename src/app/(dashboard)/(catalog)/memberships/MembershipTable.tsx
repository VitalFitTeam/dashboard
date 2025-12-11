"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ArrowDownTray from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { useRouter } from "next/navigation";
import { MembershipType } from "@vitalfit/sdk";
import { Notification } from "@/components/ui/Notification";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";

interface MembershipTableProps {
  data: MembershipType[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string };
  onFilterChange: (filters: { search?: string }) => void;
}

export default function MembershipTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: MembershipTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingRow, setPendingRow] = useState<string | null>(null);

  const { token } = useAuth();
  const router = useRouter();

  // 🔍 Manejo del campo de búsqueda
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

  const handleView = (row: MembershipType) => {
    router.push(`/memberships/${row.membership_type_id}`);
  };

  const handleEdit = (row: MembershipType) => {
    router.push(`/memberships/${row.membership_type_id}/edit`);
  };

  const handleDelete = async (membership: MembershipType) => {
    const membershipId = membership.membership_type_id;

    if (!token) {
      setDeleteError("No estás autenticado para realizar esta acción.");
      setDeleteRowId(null);
      return;
    }

    setPendingRow(membershipId);
    setDeleteError(null);

    try {
      await api.membership.deleteMembershipType(membershipId, token);
      setShowSuccess(true);
      onReload();
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error al eliminar la membresía:", error);
      setDeleteError("Error al eliminar la membresía. Intenta nuevamente.");
    } finally {
      setDeleteRowId(null);
      setPendingRow(null);
    }
  };

  const columns: Column<MembershipType>[] = [
    { header: "Nombre", accessor: "name" },
    { header: "Descripción", accessor: "description" },
    { header: "Duración (días)", accessor: "duration_days" },
    { header: "Precio", accessor: "price" },
    {
      header: "Status",
      accessor: "is_active",
      render: (value) => {
        const config = value
          ? { text: "Activa", color: "text-green-700 border-green-300" }
          : { text: "Inactiva", color: "text-yellow-700 border-yellow-300" };
        return (
          <Badge variant="outline" className={`border ${config.color}`}>
            {config.text}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* 🔍 Campo de búsqueda */}
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar membresía por nombre"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <ArrowDownTray className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>

      <DataTable<MembershipType>
        key={`page-${page}-${data.length}`}
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="membership_type_id"
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
                  onClick: () => setDeleteRowId(row.membership_type_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.membership_type_id && (
              <GeneralAlertDialog
                open={deleteRowId === row.membership_type_id}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar esta membresía? Esta acción no se puede deshacer."
                actionText="Eliminar"
                cancelText="Cancelar"
                onAction={() => handleDelete(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
      />

      {showSuccess && (
        <Notification
          variant="success"
          description="Membresía eliminada correctamente"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {deleteError && (
        <Notification
          variant="destructive"
          description={deleteError}
          onClose={() => setDeleteError(null)}
        />
      )}
    </>
  );
}
