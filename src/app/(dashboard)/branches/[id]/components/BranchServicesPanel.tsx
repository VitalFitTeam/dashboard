"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import InputField from "@/components/ui/InputField";
import { api } from "@/lib/sdk-config";
import {
  BranchEquipmentInventory,
  Equipment,
  UpdateBranchEquipmentDetails,
} from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import EditBranchEquipmentModal from "./EditBranchEquipmentModal";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface BranchEquipmentPanelProps {
  branchId: string;
  mode?: "view" | "edit";
}

type InventoryRow = BranchEquipmentInventory & {
  name: string;
  brand: string;
  model: string;
  category: string;
};

const BranchEquipmentPanel: React.FC<BranchEquipmentPanelProps> = ({
  branchId,
  mode = "edit",
}) => {
  const { token } = useAuth();
  const isDisabled = mode === "view";

  const [currentInventory, setCurrentInventory] = useState<
    BranchEquipmentInventory[]
  >([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [editingEquipment, setEditingEquipment] =
    useState<BranchEquipmentInventory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {return;}
    const fetchAllEquipment = async () => {
      setLoading(true);
      try {
        const res = await api.equipment.getEquipment(token, {
          page: 1,
          limit: 100,
        });
        setAllEquipment(res.data || []);
      } catch (err) {
        console.error("Error cargando equipos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllEquipment();
  }, [token]);

  useEffect(() => {
    if (!token) {return;}
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const res = await api.equipment.getBranchEquipment(branchId, token);
        setCurrentInventory(res.data || []);
      } catch (err) {
        console.error("Error cargando inventario:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [branchId, token]);

  // Merge inventory for display
  const mergedInventory: InventoryRow[] = currentInventory.map((inv) => {
    const equip = allEquipment.find((e) => e.equipment_id === inv.equipment_id);
    return {
      ...inv,
      name: equip?.name ?? "-",
      brand: equip?.brand ?? "-",
      model: equip?.model ?? "-",
      category: equip?.category ?? "-",
    };
  });

  // Columns
  const inventoryColumns: Column<InventoryRow>[] = [
    { header: "Nombre", accessor: "name" },
    { header: "Marca", accessor: "brand" },
    { header: "Modelo", accessor: "model" },
    { header: "Categoría", accessor: "category" },
    { header: "Serial", accessor: "serial_number" },
    { header: "Estado", accessor: "status" },
    { header: "Adquisición", accessor: "acquisition_date" },
    { header: "Último mantenimiento", accessor: "last_maintenance_date" },
  ];

  // Actions
  const actionRenderer = (row: InventoryRow) => (
    <div className="flex gap-2">
      {!isDisabled && (
        <>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setEditingEquipment(row);
              setIsModalOpen(true);
            }}
            title="Editar equipamiento"
          >
            <Pencil size={16} />
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={async () => {
              if (!token) {return;}
              try {
                await api.equipment.removeBranchEquipment(
                  branchId,
                  row.equipment_id,
                  token,
                );
                setCurrentInventory((prev) =>
                  prev.filter((e) => e.equipment_id !== row.equipment_id),
                );
                toast.success("Equipamiento eliminado");
              } catch (err) {
                console.error(err);
                toast.error("Error eliminando equipamiento");
              }
            }}
            title="Eliminar equipamiento"
          >
            <Trash2 size={16} />
          </Button>
        </>
      )}
    </div>
  );

  // Save changes from modal
  const handleSaveEquipment = async (data: UpdateBranchEquipmentDetails) => {
    if (!editingEquipment || !token) {return;}
    try {
      await api.equipment.updateBranchEquipment(
        branchId,
        editingEquipment.equipment_id,
        data,
        token,
      );
      setCurrentInventory((prev) =>
        prev.map((e) =>
          e.equipment_id === editingEquipment.equipment_id
            ? { ...e, ...data }
            : e,
        ),
      );
      setIsModalOpen(false);
      setEditingEquipment(null);
      toast.success("Equipamiento actualizado");
    } catch (err) {
      console.error(err);
      toast.error("Error actualizando equipamiento");
    }
  };

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
                Buscar equipo
              </label>
              <InputField
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                value={selectedEquipmentId ?? ""}
                onValueChange={setSelectedEquipmentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar un equipo" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {allEquipment
                    .filter((e) =>
                      e.name.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((equip) => (
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
            <Button
              type="button"
              variant="outline"
              disabled={!selectedEquipmentId || loading}
            >
              <Plus size={16} className="mr-2" />
              Agregar
            </Button>
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold">Inventario de la sucursal</h3>
      {mergedInventory.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay equipamiento asignado a esta sucursal.
        </p>
      ) : (
        <DataTable<InventoryRow>
          columns={inventoryColumns}
          data={mergedInventory}
          rowIdKey={(row) => row.inventory_id}
          enableRowSelection
          actions={actionRenderer}
          page={1}
          pageSize={10}
        />
      )}

      {editingEquipment && (
        <EditBranchEquipmentModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          equipment={editingEquipment}
          onSave={handleSaveEquipment}
          mode={mode}
        />
      )}
    </div>
  );
};

export default BranchEquipmentPanel;
