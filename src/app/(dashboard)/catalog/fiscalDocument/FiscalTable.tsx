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
import { FiscalDocument } from "./data";

interface FiscalTableProps {
  data: FiscalDocument[];
  onReload: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: { search: string };
  onFilterChange: (filters: { search?: string }) => void;
}

export default function FiscalTable({
  data,
  onReload,
  page,
  pageSize,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
}: FiscalTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

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
  }, [searchInput, filters.search, onFilterChange]);

  const handleView = (row: FiscalDocument) => {
    router.push(`/catalog/fiscalDocument/${row.document_id}`);
  };

  const handleEdit = (row: FiscalDocument) => {
    router.push(`/catalog/fiscalDocument/${row.document_id}/edit`);
  };

  const handleDeleteDocument = async (document: FiscalDocument) => {
    try {
      console.warn("Eliminando documento:", document);
      
      setShowSuccess(true);
      setDeleteRowId(null);
      onReload();
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setDeleteError("Error al eliminar el documento");
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  const columns: Column<FiscalDocument>[] = [
    { 
      header: "Nombre del Documento", 
      accessor: "name", 
      filterType: "text" 
    },
    { 
      header: "Prefijo o Serie", 
      accessor: "prefix", 
      filterType: "text" 
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar documento..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>

      {showSuccess && (
        <Notification
          variant="success"
          description="Documento eliminado correctamente"
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

      <DataTable<FiscalDocument>
        key={`page-${page}-${data.length}`}
        columns={columns}
        data={data}
        onPageChange={onPageChange}
        totalPages={totalPages}
        rowIdKey="document_id"
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
                  onClick: () => setDeleteRowId(row.document_id || null),
                  variant: "danger",
                  separatorBefore: true,
                },
              ]}
            />

            {deleteRowId === row.document_id && (
              <GeneralAlertDialog
                open={true}
                onOpenChange={(open) => !open && setDeleteRowId(null)}
                trigger={null}
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar este documento fiscal? Esta acción no se puede deshacer."
                actionText="Eliminar"
                cancelText="Cancelar"
                onAction={() => handleDeleteDocument(row)}
                actionVariant="destructive"
              />
            )}
          </div>
        )}
      />
    </>
  );
}