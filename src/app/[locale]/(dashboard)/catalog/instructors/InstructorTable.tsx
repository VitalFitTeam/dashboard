"use client";

import { useState, useEffect } from "react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { InstructorDataList } from "@vitalfit/sdk";
import { useRouter } from "next/navigation";
import { GeneralAlertDialog } from "@/components/ui/GeneralAlertDialog";
import { toast } from "sonner"; 

interface InstructorsTableProps {
  data: InstructorDataList[];
  isLoading: boolean; 
  onReload: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string; sort: string }; // Actualizado según tu API
  onFilterChange: (filters: { search?: string; sort?: string }) => void;
}

export default function InstructorsTable({
  data,
  isLoading,
  onReload,
  page,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: InstructorsTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleDeleteInstructor = async (instructor: InstructorDataList) => {
    if (!token) {
      return;
    }

    const toastId = toast.loading("Eliminando instructor...");
    try {
      await api.instructor.deleteInstructor(instructor.instructor_id, token);
      toast.success("Instructor eliminado", { id: toastId });
      onReload();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al borrar el registro", { id: toastId });
    } finally {
      setDeleteRowId(null);
    }
  };

  const columns: Column<InstructorDataList>[] = [
    {
      header: "Nombre",
      accessor: "first_name",
      render: (value, row) => (
        <div className="font-medium text-slate-900">
          {value} {row.last_name}
        </div>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      render: (email) => (
        <div className="text-slate-500 hover:text-orange-400 transition-colors cursor-default">
          {email}
        </div>
      ),
    },
    {
      header: "Documento",
      accessor: "identity_document",
    },
    {
      header: "Teléfono",
      accessor: "phone",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[350px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido o email..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => toast.info("Exportación iniciada...")}>
            <Download className="mr-2 h-4 w-4" />
            Descargar CSV
          </Button>
        </div>
      </div>

      <DataTable<InstructorDataList>
        key={`instructor-page-${page}`} 
        columns={columns}
        data={data}
        isLoading={isLoading}
        onPageChange={onPageChange}
        page={page}
        totalPages={totalPages}
        rowIdKey="instructor_id"
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { 
                  label: "Ver Detalles", 
                  icon: Eye, 
                  onClick: () => router.push(`/instructors/${row.instructor_id}`) 
                },
                {
                  label: "Modificar",
                  icon: Pencil,
                  onClick: () => router.push(`/instructors/${row.instructor_id}/edit`),
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
            <GeneralAlertDialog
              open={deleteRowId === row.instructor_id}
              onOpenChange={(open) => !open && setDeleteRowId(null)}
              title="¿Estás seguro?"
              description={`Se eliminará permanentemente al instructor ${row.first_name} ${row.last_name}.`}
              actionText="Eliminar"
              onAction={() => handleDeleteInstructor(row)}
              actionVariant="destructive"
            />
          </div>
        )}
      />
    </>
  );
}
