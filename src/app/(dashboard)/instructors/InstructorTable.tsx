"use client";
import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { InstructorDataList } from "@vitalfit/sdk";
import { useRouter } from "next/navigation";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { Notification } from "@/components/ui/Notification";

interface instructorsTableProps {
  data: InstructorDataList[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string; category: string };
  onFilterChange: (filters: { search?: string; category?: string }) => void;
}

export default function instructorsTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: instructorsTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const [notification, setNotification] = useState({
    isVisible: false,
    description: "",
    title: "",
  });

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

  const handleView = (row: InstructorDataList) => {
    router.push(`/instructors/${row.instructor_id}`);
  };

  const handleEdit = (row: InstructorDataList) => {
    router.push(`/instructors/${row.instructor_id}/edit`);
  };

  const handleDeleteinstructors = async (instructors: InstructorDataList) => {
    if (!token) {
      console.error("sesion no autenticada");
      setDeleteRowId(null);
      return;
    }
    try {
      await api.instructor.deleteInstructor(instructors.instructor_id, token);

      // Primero mostrar la notificación
      setNotification({
        isVisible: true,
        description: "Registro borrado exitosamente",
        title: "Éxito",
      });

      setDeleteRowId(null);

      setTimeout(() => {
        onReload();
      }, 1000);
    } catch (error) {
      console.error("Error al eliminar el Instructor:", error);
      setDeleteRowId(null);

      setNotification({
        isVisible: true,
        description: "Error al borrar el registro",
        title: "Error",
      });
    }
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const visibleColumns: Column<InstructorDataList>[] = [
    {
      header: "ID",
      accessor: "instructor_id",
      render: (id) => <div>{id}</div>,
    },
    { header: "Nombre", accessor: "first_name", filterType: "text" },
    { header: "Email", accessor: "email", filterType: "text" },
  ];

  const invisibleColumns: Column<InstructorDataList>[] = [
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
            placeholder="Filtrar por nombre"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descarga
          </Button>
        </div>
      </div>

      <DataTable<InstructorDataList>
        key={`page-${page}-${data.length}`}
        columns={visibleColumns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="instructor_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver", icon: Eye, onClick: () => handleView(row) },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => handleEdit(row),
                },
                {
                  label: "Eliminar",
                  icon: Trash2,
                  onClick: () => setDeleteRowId(row.instructor_id),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />
            {deleteRowId === row.instructor_id && (
              <GeneralAlertDialog
                open={deleteRowId === row.instructor_id}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar este Instructor? Esta acción no se puede deshacer."
                actionText="Eliminar"
                cancelText="Cancelar"
                onAction={() => handleDeleteinstructors(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
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
    </>
  );
}
