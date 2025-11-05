"use client";

import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import InputField from "@/components/ui/InputField";
import { BranchPanelRef } from "./BranchServicesPanel";
import { api } from "@/lib/sdk-config";
import {
  BranchEquipmentInventory,
  Equipment,
  CreateBranchEquipment,
} from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";

interface BranchEquipmentPanelProps {
  mode?: "view" | "edit";
  branchId: string;
}

const BranchEquipmentPanel = forwardRef<
  BranchPanelRef,
  BranchEquipmentPanelProps
>(({ mode = "edit", branchId }, ref) => {
  const { token } = useAuth();
  const [currentInventory, setCurrentInventory] = useState<Equipment[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState<number | string>(1);
  const [page, setPage] = useState(1);

  const isDisabled = mode === "view";

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        if (!token) {
          return;
        }
        const res = await api.equipment.getEquipment(token);
        console.log("✅ Equipamiento cargado correctamente", res.data);
        setAllEquipment(res.data || []);
      } catch (err) {
        console.error("Error cargando equipamiento:", err);
      }
    };
    fetchEquipment();
  }, [token]);

  // Cargar el inventario actual de la sucursal
  useEffect(() => {
    const fetchBranchInventory = async () => {
      try {
        if (!token) {
          return;
        }
        const res = await api.equipment.getBranchEquipment(branchId, token);
        console.log(
          "✅ Inventario de la sucursal cargado correctamente",
          res.data,
        );
        setCurrentInventory(res.data);
      } catch (err) {
        console.error("Error cargando inventario de la sucursal:", err);
      }
    };
    fetchBranchInventory();
  }, [branchId, token]);

  const handleAddClick = () => {
    if (!selectedEquipmentId || Number(quantity) <= 0) {
      return;
    }

    const equipment = allEquipment.find(
      (e) => e.equipment_id === selectedEquipmentId,
    );
    if (!equipment) {
      return;
    }

    const newItem: BranchEquipmentInventory = {
      inventory_id: crypto.randomUUID(),
      equipment_id: equipment.equipment_id,
      acquisition_date: new Date().toISOString(),
      last_maintenance_date: new Date().toISOString(),
      notes: "",
      serial_number: "",
      status: "Available", // default
    };

    //setCurrentInventory(prev => [...prev, newItem]);
    setSelectedEquipmentId(null);
    setQuantity(1);
  };

  const handleRemoveItem = (inventoryId: string) => {
    setCurrentInventory((prev) =>
      prev.filter((item) => item.equipment_id !== inventoryId),
    );
  };

  const inventoryColumns = React.useMemo<Column<BranchEquipmentInventory>[]>(
    () => [
      {
        header: "ID",
        accessor: "inventory_id",
        render: (id) => String(id).substring(0, 8),
      },
      //{
      //   header: "Equipamiento",
      //   accessor: "name",
      //   render: (name, row) => name ?? allEquipment.find(e => e.equipment_id === row.equipment_id)?.name ?? "Sin nombre",
      // },
      {
        header: "Nota",
        accessor: "notes",
      },
      {
        header: "Serial",
        accessor: "serial_number",
        render: (serial) =>
          serial || <span className="text-gray-400 italic">N/A</span>,
      },
      {
        header: "Fecha adquisición",
        accessor: "acquisition_date",
        render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
      },
      {
        header: "Último mantenimiento",
        accessor: "last_maintenance_date",
        render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
      },
      {
        header: "Estado",
        accessor: "status",
        render: (status) => {
          const label =
            status === "Available"
              ? "Disponible"
              : status === "Maintenance"
                ? "Mantenimiento"
                : status;
          const variant =
            status === "Available"
              ? "default"
              : status === "Maintenance"
                ? "secondary"
                : "outline";
          return <Badge variant={variant}>{label}</Badge>;
        },
      },
    ],
    [allEquipment],
  );

  const actionRenderer = (row: BranchEquipmentInventory) => (
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
          onClick={() => handleRemoveItem(row.inventory_id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  // useImperativeHandle(ref, () => ({
  //   saveData: async () => {
  //     if (!token) {throw new Error("Token no válido");}
  //     try {
  //       for (const item of currentInventory) {
  //         const equipmentData: CreateBranchEquipment = {
  //           equipment_id: item.equipment_id,
  //           acquisition_date: item || new Date().toISOString(),
  //           last_maintenance_date: item.last_maintenance_date || new Date().toISOString(),
  //           notes: item.notes || "",
  //           serial_number: item.serial_number || "",
  //         };
  //         await api.equipment.addBranchEquipment(branchId, equipmentData, token);
  //       }
  //       alert("Equipamiento guardado correctamente");
  //     } catch (err) {
  //       console.error("Error guardando equipamiento:", err);
  //       throw err;
  //     }
  //   },
  // }));

  return (
    <div className="space-y-8">
      {!isDisabled && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Agregar nuevo equipamiento
          </h3>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Equipamiento
              </label>
              <Select
                value={selectedEquipmentId ?? ""}
                onValueChange={setSelectedEquipmentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {allEquipment.map((equip) => (
                    <SelectItem
                      key={equip.equipment_id}
                      value={equip.equipment_id}
                    >
                      {equip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Cantidad
              </label>
              <InputField
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddClick}
              disabled={!selectedEquipmentId || Number(quantity) <= 0}
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
            enableRowSelection
            actions={actionRenderer}
            page={page}
            pageSize={10}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
});

BranchEquipmentPanel.displayName = "BranchEquipmentPanel";

export default BranchEquipmentPanel;
