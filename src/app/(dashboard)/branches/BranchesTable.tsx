"use client";
import { Column, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EyeIcon from "@heroicons/react/24/outline/EyeIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { useState } from "react";
import BranchDetailsModal from "@/components/BranchDetailsModal";
import { Instructor } from "@/types/instructor";
import { City, Country, State } from "@/types/location";
import { Service } from "@/types/service";
import { Equipment } from "@/types/equipment";
import { PaymentMethod } from "@/types/paymentMethod";
import { BranchesTableRow } from "@/services/branches";
import { PaymentMethodUI } from "./page";

interface BranchesTableProps {
  data: BranchesTableRow[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  allInstructors: Instructor[];
  allCities: City[];
  allStates: State[];
  allCountries: Country[];
  allServices: Service[];
  allEquipment: Equipment[];
  allPaymentMethods: PaymentMethodUI[];
}
export default function BranchesTable({
  data,
  isLoading,
  allInstructors,
  allCities,
  allStates,
  allServices,
  allEquipment,
  allPaymentMethods,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  allCountries,
}: BranchesTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchesTableRow | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  if (isLoading) {
    return <p className="text-center p-4">Cargando sucursales...</p>;
  }

  const handleViewDetails = (branch: BranchesTableRow) => {
    setSelectedBranch(branch);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditBranch = (branch: BranchesTableRow) => {
    setSelectedBranch(branch);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
  };

  const columns: Column<BranchesTableRow>[] = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "name", filterType: "text" },
    { header: "RIF", accessor: "taxId" },
    { header: "Administrador", accessor: "administrator" },
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
        data={data}
        page={page}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        enableFilters
        actions={(row) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              title="Editar Sucursal"
              onClick={() => handleEditBranch(row)}
            >
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
      {/*<BranchDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        branchData={selectedBranch} // Aquí ya puedes mapear solo los datos que tengas
        initialMode={modalMode}
        allInstructors={allInstructors}
        allCities={allCities}
        allStates={allStates}
        allCountries={allCountries}
        allServices={allServices}
        allEquipment={allEquipment}
        allPaymentMethods={allPaymentMethods}
      /> */}
    </>
  );
}
