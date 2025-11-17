"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Column, DataTable } from "@/components/ui/table/DataTable";
import InputField from "@/components/ui/InputField";
import { api } from "@/lib/sdk-config";
import {
  BranchEquipmentInventory,
  CreateBranchEquipment,
  Equipment,
  EquipmentStatus,
} from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import EditBranchEquipmentModal from "./EditBranchEquipmentModal";
import { branchEquipmentSchema } from "@/lib/validation/branchEquipmentSchema";

interface BranchEquipmentPanelProps {
  branchId: string;
  mode?: "view" | "edit";
}

const BranchEquipmentPanel: React.FC<BranchEquipmentPanelProps> = ({
  branchId,
  mode = "edit",
}) => {
  const { token } = useAuth();
  const isDisabled = mode === "view";

  const [currentInventory, setCurrentInventory] = useState<
    BranchEquipmentInventory[]
  >([]);
  const [pendingInventory, setPendingInventory] = useState<
    BranchEquipmentInventory[]
  >([]);
  const [removedInventoryIds, setRemovedInventoryIds] = useState<string[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null,
  );
  const [notes, setNotes] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] =
    useState<BranchEquipmentInventory | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("edit");

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchAllEquipment = async () => {
      setLoading(true);
      try {
        const res = await api.equipment.getEquipment(token, {
          page: 1,
          limit: 100,
        });
        setAllEquipment(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Error cargando equipos");
      } finally {
        setLoading(false);
      }
    };
    fetchAllEquipment();
  }, [token]);

  const fetchInventory = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const res = await api.equipment.getBranchEquipment(branchId, token);
      setCurrentInventory(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [branchId, token]);

  const handleAddEquipment = () => {
    if (!selectedEquipmentId) {
      toast.error("Debes seleccionar un equipo antes de agregarlo");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const newPending: BranchEquipmentInventory = {
      inventory_id: crypto.randomUUID(),
      equipment_id: selectedEquipmentId,
      name:
        allEquipment.find((e) => e.equipment_id === selectedEquipmentId)
          ?.name || "",
      serial_number: serialNumber,
      notes,
      acquisition_date: today,
      last_maintenance_date: today,
      status: "Available",
    };

    const validation = branchEquipmentSchema.safeParse(newPending);
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      toast.error(`Error al agregar equipo: ${errorMessages}`);
      return;
    }

    setPendingInventory((prev) => [...prev, newPending]);
    setSelectedEquipmentId(null);
    setSerialNumber("");
    setNotes("");
    toast.success(
      `Equipo "${newPending.name}" agregado al inventario pendiente`,
    );
  };

  const handleRemoveEquipment = (inventoryId: string) => {
    const isPending = pendingInventory.find(
      (e) => e.inventory_id === inventoryId,
    );
    if (isPending) {
      setPendingInventory((prev) =>
        prev.filter((e) => e.inventory_id !== inventoryId),
      );
      toast.success(
        `Equipo "${isPending.name}" eliminado del inventario pendiente`,
      );
      return;
    }

    const removed = currentInventory.find(
      (e) => e.inventory_id === inventoryId,
    );
    if (!removed) {
      return;
    }

    setRemovedInventoryIds((prev) => [...prev, inventoryId]);
    setCurrentInventory((prev) =>
      prev.filter((e) => e.inventory_id !== inventoryId),
    );

    toast.success(`Equipo "${removed.name}" eliminado del inventario`);
  };

  const handleSaveChanges = async () => {
    if (!token) {
      toast.error("Token inválido");
      return;
    }

    setLoading(true);

    try {
      for (const item of pendingInventory) {
        const payload: CreateBranchEquipment = {
          equipment_id: item.equipment_id,
          serial_number: item.serial_number,
          notes: item.notes,
          acquisition_date: item.acquisition_date,
          last_maintenance_date: item.last_maintenance_date,
          status: item.status,
        };
        await api.equipment.addBranchEquipment(branchId, payload, token);
      }

      for (const invId of removedInventoryIds) {
        await api.equipment.removeBranchEquipment(branchId, invId, token);
      }

      toast.success("Cambios guardados correctamente");
      setPendingInventory([]);
      setRemovedInventoryIds([]);
      await fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error("Error guardando cambios");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEquipment = async (data: {
    last_maintenance_date: string;
    notes: string;
    status: EquipmentStatus;
  }) => {
    if (!token || !equipmentToEdit) {
      toast.error("Equipo inválido para actualizar");
      return;
    }

    const updatedEquipment: BranchEquipmentInventory = {
      ...equipmentToEdit,
      ...data,
    };

    const validation = branchEquipmentSchema.safeParse(updatedEquipment);
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      toast.error(`Error al actualizar equipo: ${errorMessages}`);
      return;
    }

    setLoading(true);
    try {
      await api.equipment.updateBranchEquipment(
        branchId,
        equipmentToEdit.inventory_id,
        data,
        token,
      );

      setCurrentInventory((prev) =>
        prev.map((e) =>
          e.inventory_id === equipmentToEdit.inventory_id
            ? { ...e, ...data }
            : e,
        ),
      );

      toast.success(
        `Equipo "${equipmentToEdit.name}" actualizado correctamente`,
      );
      setEditModalOpen(false);
      setEquipmentToEdit(null);
    } catch (err) {
      console.error(err);
      toast.error("Error actualizando equipamiento");
    } finally {
      setLoading(false);
    }
  };

  const inventoryColumns: Column<BranchEquipmentInventory>[] = [
    { header: "Nombre", accessor: "name" },
    { header: "Serial", accessor: "serial_number" },
    { header: "Estado", accessor: "status" },
    { header: "Adquisición", accessor: "acquisition_date" },
    { header: "Último mantenimiento", accessor: "last_maintenance_date" },
  ];

  const handleEdit = (equipment: BranchEquipmentInventory) => {
    setEquipmentToEdit(equipment);
    setModalMode("edit");
    setEditModalOpen(true);
  };
  const handleView = (equipment: BranchEquipmentInventory) => {
    setEquipmentToEdit(equipment);
    setModalMode("view");
    setEditModalOpen(true);
  };
  const actionRenderer = (row: BranchEquipmentInventory) => (
    <div className="flex gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={() => handleView(row)}
        title="Ver equipamiento"
      >
        <Eye size={16} />
      </Button>

      {!isDisabled && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleEdit(row)}
          title="Editar equipamiento"
        >
          <Pencil size={16} />
        </Button>
      )}

      {!isDisabled && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleRemoveEquipment(row.inventory_id)}
          title="Eliminar equipamiento"
        >
          <Trash2 size={16} />
        </Button>
      )}
    </div>
  );
  const filteredEquipment = allEquipment.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  const displayedInventory = currentInventory
    .filter((e) => !removedInventoryIds.includes(e.inventory_id))
    .concat(pendingInventory);

  return (
    <div className="space-y-6">
      {!isDisabled && (
        <div className="p-6 border rounded-xl bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Agregar nuevo equipamiento
          </h3>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Buscar equipo
            </label>
            <InputField
              placeholder="Ej: Monster Power Rack"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={selectedEquipmentId ?? ""}
              onValueChange={setSelectedEquipmentId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar un equipo (Ej: Monster Power Rack)" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto w-full">
                {filteredEquipment.map((equipment) => (
                  <SelectItem
                    key={equipment.equipment_id}
                    value={equipment.equipment_id}
                  >
                    {equipment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-3">
            <InputField
              label="Número de serie"
              type="text"
              placeholder="Ej: SN-ROG-123"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="flex-1"
            />
            <InputField
              label="Notas"
              type="text"
              placeholder="Ej: Equipo listo para usar"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex gap-4 mt-4 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddEquipment}
              className="flex items-center"
            >
              <Plus size={16} className="mr-2" /> Agregar
            </Button>
            <Button
              type="button"
              onClick={handleSaveChanges}
              disabled={
                pendingInventory.length === 0 &&
                removedInventoryIds.length === 0
              }
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold">Inventario de la sucursal</h3>
      {displayedInventory.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay equipamiento asignado a esta sucursal.
        </p>
      ) : (
        <DataTable
          columns={inventoryColumns}
          data={displayedInventory}
          enableRowSelection
          actions={actionRenderer}
          page={1}
          pageSize={10}
          rowIdKey="inventory_id"
        />
      )}
      <EditBranchEquipmentModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        equipment={equipmentToEdit}
        onSave={handleUpdateEquipment}
        mode={modalMode}
      />
    </div>
  );
};

export default BranchEquipmentPanel;
