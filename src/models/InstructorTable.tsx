"use client";
import { useState } from "react";
import type { Instructor } from "@/models/instructor";
import { InstructorData } from "./data";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import { RowActions } from "@/components/ui/table/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import ArrowDownTray from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

interface PaymentTableProps {
  onView: (payment: Instructor) => void;
  onEdit: (payment: Instructor) => void;
}

export default function PaymentTable({ onView,onEdit }: PaymentTableProps) {
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [inputFilters, setInputFilters] = useState<Record<string, string>>({});

  const handleDelete = (row: Instructor) => {
    console.warn("Equipo Eliminado ", row.id);
    setDeleteRowId(null);
  };

  const columns: Column<Instructor>[] = [
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
    { header: "Email", accessor: "email", filterType: "text" },
    { header: "Especialidad", accessor: "specialty", filterType: "text" },
    {
      header: "Status",
      accessor: "status",
      filterType: "select",
      filterOptions: [
        { label: "Activa", value: "active" },
        { label: "Inactiva", value: "inactive" },
        { label: "En mantenimiento", value: "maintenance" },
        { label: "Bloqueado", value: "blocked" },
      ],
      render: (value) => {
        const statusConfig = {
          active: { text: "Activa", color: "text-green-700 border-green-300" },
          inactive: { text: "Inactiva", color: "text-red-700 border-red-300" },
          maintenance: {
            text: "En mantenimiento",
            color: "text-yellow-700 border-yellow-300",
          },
          blocked: { text: "Bloqueado", color: "text-red-700 border-red-300" },
        };
        const config = statusConfig[value as keyof typeof statusConfig] ?? {
          text: "Desconocido",
          color: "bg-gray-100 text-gray-700 border-gray-300",
        };
        return (
          <Badge variant="outline" className={`border ${config.color}`}>
            {config.text}
          </Badge>
        );
      },
    },
    { header: "Ultimo Acceso", accessor: "uacceso", filterType: "text" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[250px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar por nombre o email"
            className="pl-9"
            value={inputFilters.search || ""}
            onChange={(e) =>
              setInputFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
        <Select
          value={inputFilters.type || ""}
          onValueChange={(value) =>
            setInputFilters((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Entrenador">Entrenador</SelectItem>
            <SelectItem value="Yoga">Yoga</SelectItem>
            <SelectItem value="Pilates">Pilates</SelectItem>
            <SelectItem value="Crosfit">Crosfit</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={inputFilters.type || ""}
          onValueChange={(value) =>
            setInputFilters((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Administrador</SelectItem>
            <SelectItem value="user">Usuario</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <Button variant="outline">
            <ArrowDownTray className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      <DataTable<Instructor>
        columns={columns}
        data={InstructorData}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        actions={(row) => (
          <div className="flex flex-col items-center justify-center w-full">
            <RowActions
              actions={[
                { label: "Ver", icon: Eye, onClick: () => onView(row) },
                { label: "Modificar", icon: Pencil, onClick: () => onEdit(row) },
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
                <AlertTitle className="text-black">Confirmar Eliminación</AlertTitle>
                <AlertDescription className="text-gray-900">
                  ¿Estás seguro de que deseas eliminar este metodo? Esta acción no se puede deshacer.
                </AlertDescription>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" className="border-white" onClick={() => setDeleteRowId(null)}>
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