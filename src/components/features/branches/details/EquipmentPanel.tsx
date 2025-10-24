"use client";
import React, { useState, useMemo } from "react";
import { Branches, BranchInventoryItem } from "@/models/branches";
import { Equipment } from "@/models/equipment";
import PanelWrapper from "./PanelWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import InputField from "@/components/ui/InputField";

interface EquipmentPanelProps {
  formData: Branches;
  mode: "view" | "edit";
  allEquipment: Equipment[];
  onAddItem: (itemData: {
    equipmentId: string;
    quantity: number;
    status: string;
    branch_id: string;
  }) => void;
  onRemoveItem: (inventoryId: string) => void;
}

export default function EquipmentPanel({
  formData,
  mode,
  allEquipment,
  onAddItem,
  onRemoveItem,
}: EquipmentPanelProps) {
  const isDisabled = mode === "view";
  const currentInventory = formData.inventory ?? [];
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState<number | string>(1);
  const [page, setPage] = useState(1);

  const handleAddClick = () => {
    if (selectedEquipmentId && quantity !== "" && Number(quantity) > 0) {
      onAddItem({
        equipmentId: selectedEquipmentId,
        quantity: Number(quantity),
        status: "Available",
        branch_id: formData.id,
      });
      setSelectedEquipmentId(null);
      setQuantity(1);
    }
  };

  const inventoryColumnsMemo = useMemo(
    (): Column<BranchInventoryItem>[] => [
      {
        header: "ID",
        accessor: "inventoryId",
        render: (id) => (typeof id === "string" ? id.substring(0, 8) : "N/A"),
      },
      {
        header: "Equipamiento",
        accessor: "name",
        render: (name, row) => name ?? `Equipo ID: ${row.equipmentId}`,
      },
      {
        header: "Serial",
        accessor: "serialNumber",
        render: (serial) =>
          serial ?? <span className="text-gray-400">N/A</span>,
      },
      {
        header: "Status",
        accessor: "status",
        render: (statusValue) => {
          return <Badge>{String(statusValue)}</Badge>;
        },
      },
    ],
    [],
  );

  const actionRenderer = React.useCallback(
    (row: BranchInventoryItem) => (
      <div className="flex items-center justify-end gap-1">
        <Button size="icon" variant="ghost" title="Ver Detalles">
          <Eye className="h-4 w-4" />
        </Button>
        {!isDisabled && (
          <Button
            size="icon"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            title="Eliminar"
            onClick={() => onRemoveItem(row.inventoryId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
    [isDisabled, onRemoveItem],
  );

  return (
    <PanelWrapper
      title="Equipamiento"
      description={
        isDisabled
          ? "Inventario de la sucursal."
          : "Gestiona el inventario de la sucursal."
      }
    >
      {!isDisabled && (
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow w-full sm:w-auto space-y-1.5">
              <label className="text-sm font-medium leading-none">
                Agregar nuevo equipamiento
              </label>
              <Select
                value={selectedEquipmentId ?? ""}
                onValueChange={setSelectedEquipmentId}
              >
                <SelectTrigger id="equipment-select">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {allEquipment.map((equip) => (
                    <SelectItem key={equip.id} value={equip.id}>
                      {equip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32 space-y-1.5">
              <label className="text-sm font-medium leading-none">
                Cantidad
              </label>
              <InputField
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Value"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddClick}
              disabled={
                !selectedEquipmentId || !quantity || Number(quantity) <= 0
              }
              className="w-full sm:w-auto flex-shrink-0"
            >
              <Plus size={16} className="mr-2" />
              Agregar
            </Button>
          </div>
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-800 mb-4">
          Inventario de la sucursal
        </h3>
        <div>
          <DataTable
            columns={inventoryColumnsMemo}
            data={currentInventory}
            enableRowSelection={true}
            actions={actionRenderer}
            page={page}
            pageSize={10}
            onPageChange={setPage}
          />
        </div>
      </div>
    </PanelWrapper>
  );
}
