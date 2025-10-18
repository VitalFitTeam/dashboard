"use client";
import { Column, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import BranchDetailsModal from "@/components/BranchDetailsModal";
import { Branches } from "@/types/branches";
import { branches } from "./data";

export default function BranchesTable() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branches | null>(null);

  const handleViewDetails = (branch: Branches) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
  };

  const columns: Column<Branches>[] = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "name", filterType: "text" },
    { header: "RIF", accessor: "taxId" },
    { header: "Administrador", accessor: "administrator" },
    { header: "Ciudad", accessor: "city" },
    {
      header: "País",
      accessor: "country",
      filterType: "select",
      filterOptions: [
        { label: "Venezuela", value: "Venezuela" },
        { label: "Colombia", value: "Colombia" },
        { label: "Perú", value: "Perú" },
      ],
    },
    {
      header: "Status",
      accessor: "status",
      filterType: "select",
      filterOptions: [
        { label: "Activa", value: "active" },
        { label: "Inactiva", value: "inactive" },
        { label: "En mantenimiento", value: "maintenance" },
      ],
      render: (value) => {
        const statusConfig = {
          active: { text: "Activa", color: "text-green-700 border-green-300" },
          inactive: { text: "Inactiva", color: "text-red-700 border-red-300" },
          maintenance: {
            text: "En mantenimiento",
            color: "text-yellow-700 border-yellow-300",
          },
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
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={branches}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        enableFilters
        actions={(row) => (
          <div className="flex items-center justify-center gap-2">
            <Button size="icon" variant="ghost" title="Editar Sucursal">
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Ver Detalles"
              onClick={() => handleViewDetails(row)}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
      <BranchDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        branchData={selectedBranch}
      />
    </>
  );
}
