"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Branches, BranchInventoryItem } from "@/models/branches";
import { Equipment } from "@/models/equipment";
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

export default function BranchEquipmentPanel({
  formData = { inventory: [], id: "" } as unknown as Branches,
  mode,
  allEquipment = [],
  onAddItem = () => {},
  onRemoveItem = () => {},
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
        status: "Disponible",
        branch_id: formData.id,
      });
      setSelectedEquipmentId(null);
      setQuantity(1);
    } else {
      console.error(
        "Por favor, selecciona un equipo e ingresa una cantidad válida.",
      );
    }
  };

  const inventoryColumns = useMemo<Column<BranchInventoryItem>[]>(
    () => [
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
          serial ? serial : <span className="text-gray-400 italic">N/A</span>,
      },
      {
        header: "Estado",
        accessor: "status",
        render: (statusValue) => (
          <Badge
            variant={
              statusValue === "Disponible"
                ? "default"
                : statusValue === "Mantenimiento"
                  ? "secondary"
                  : "outline"
            }
          >
            {String(statusValue)}
          </Badge>
        ),
      },
    ],
    [],
  );

  const actionRenderer = useCallback(
    (row: BranchInventoryItem) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          size="icon"
          variant="ghost"
          title="Ver detalles"
          onClick={() => console.log("Ver detalles de", row)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        {!isDisabled && (
          <Button
            size="icon"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            title="Eliminar"
            onClick={() =>
              row.inventoryId && onRemoveItem(String(row.inventoryId))
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
    [isDisabled, onRemoveItem],
  );

  return (
    <div className="space-y-8">
      {!isDisabled && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Agregar nuevo equipamiento
          </h3>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            {/* Selector de equipo */}
            <div className="flex-grow space-y-1.5">
              <label
                htmlFor="equipment-select"
                className="text-sm font-medium text-gray-700"
              >
                Equipamiento
              </label>
              <Select
                value={selectedEquipmentId ?? ""}
                onValueChange={setSelectedEquipmentId}
              >
                <SelectTrigger id="equipment-select">
                  <SelectValue placeholder="Seleccionar un equipo" />
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
              <label
                htmlFor="quantity"
                className="text-sm font-medium text-gray-700"
              >
                Cantidad
              </label>
              <InputField
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
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

      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Inventario de la sucursal
        </h3>

        {currentInventory.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay equipamiento asignado a esta sucursal.
          </p>
        ) : (
          <DataTable
            columns={inventoryColumns}
            data={currentInventory}
            enableRowSelection={true}
            actions={actionRenderer}
            page={page}
            pageSize={10}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
