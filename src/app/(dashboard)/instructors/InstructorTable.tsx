"use client";
import { useState } from "react";
import type { Instructor } from "@/models/instructor";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Notification } from "@/components/ui/Notification";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ArrowDownTray from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/sdk-config";

interface InstructorTableProps {
  data: Instructor[];
  isLoading: boolean;
  onView: (instructor: Instructor) => void;
  onEdit: (instructor: Instructor) => void;
  filters: Record<string, string | undefined>;
  setFilters: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  sort: "asc" | "desc";
  setSort: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  totalInstructor: number;
  refreshKey: number;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

export default function InstructorTable({
  data,
  isLoading,
  onView,
  onEdit,
  filters,
  setFilters,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  setSort,
  totalInstructor,
  refreshKey,
  setRefreshKey,
}: InstructorTableProps) {
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const handleDelete = async (row: Instructor) => {
    console.warn("Instructor Eliminado ", row.id);
    setDeleteRowId(null);

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("Token no disponible");
      return;
    }

    try {
      const response = await api.instructor.deleteInstructor(row.id, token);
      console.log("Instructor borrado:", response);
      setShowSuccessNotification(true);
      setRefreshKey((prev) => prev + 1);
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 4000);
    } catch (err) {
      console.error("Error eliminando instructor:", err);
      setShowErrorNotification(true);
    }
  };

  const visibleColumns: Column<Instructor>[] = [
    { header: "ID", accessor: "id", render: (id) => <div>{id}</div> },
    { header: "Nombre", accessor: "first_name", filterType: "text" },
    { header: "Email", accessor: "email", filterType: "text" },
  ];

  const invisibleColumns: Column<Instructor>[] = [
    { header: "Teléfono", accessor: "phone" },
    { header: "Fecha de nacimiento", accessor: "birth_date" },
    { header: "Género", accessor: "gender" },
    { header: "Documento", accessor: "identity_document" },
    { header: "Biografía", accessor: "biography" },
    { header: "Foto", accessor: "profile_picture_url" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar por nombre o email"
            className="pl-9"
            value={filters?.email || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <ArrowDownTray className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {showSuccessNotification && (
        <Notification
          variant="success"
          title="Eliminacion exitosa"
          description="El instructor ha sido eliminado."
          onClose={() => setShowSuccessNotification(false)}
        />
      )}

      {showErrorNotification && (
        <Notification
          variant="destructive"
          title="Error al eliminar"
          description="No se pudo eliminar el instructor. Intenta nuevamente."
          onClose={() => setShowErrorNotification(false)}
        />
      )}

      <DataTable<Instructor>
        columns={visibleColumns}
        data={data}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver", icon: Eye, onClick: () => onView(row) },
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
                  ¿Estás seguro de que deseas eliminar este metodo? Esta acción
                  no se puede deshacer.
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
                    onClick={() => handleDelete(row)}
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
