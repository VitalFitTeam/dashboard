"use client";

import React, { useState, useEffect } from "react";
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
import { api } from "@/lib/sdk-config";
import { Equipment, CreateBranchEquipment } from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";

interface BranchEquipmentPanelProps {
  mode?: "view" | "edit";
  branchId: string;
}

const BranchEquipmentPanel: React.FC<BranchEquipmentPanelProps> = ({
  mode = "edit",
  branchId,
}) => {
  const { token } = useAuth();
  const [currentInventory, setCurrentInventory] = useState<Equipment[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = mode === "view";

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
        console.log(res.data);
        setAllEquipment(res.data || []);
      } catch (err: any) {
        console.error("Error cargando equipamiento:", err);
        setError(err.message || "Error cargando equipamiento");
      } finally {
        setLoading(false);
      }
    };

    fetchAllEquipment();
  }, [token]);

  useEffect(() => {
    if (!token || !branchId) {
      return;
    }

    const fetchBranchInventory = async () => {
      setLoading(true);
      try {
        const res = await api.equipment.getBranchEquipment(branchId, token);
        console.log(res.data);
        setCurrentInventory(res.data || []);
      } catch (err: any) {
        console.error("Error cargando inventario de la sucursal:", err);
        setError(err.message || "Error cargando inventario");
      } finally {
        setLoading(false);
      }
    };

    fetchBranchInventory();
  }, [branchId, token]);

  const handleAddClick = async () => {
    if (!selectedEquipmentId || !token) {
      return;
    }
    const now = new Date();
    const formattedDate = now.toISOString().split(".")[0];

    const newEquipment: CreateBranchEquipment = {
      equipment_id: selectedEquipmentId,
      acquisition_date: formattedDate,
      last_maintenance_date: "",
      notes: "",
      serial_number: "",
      status: "Available",
    };

    try {
      await api.equipment.addBranchEquipment(branchId, newEquipment, token);

      const res = await api.equipment.getBranchEquipment(branchId, token);
      setCurrentInventory(res.data || []);

      setSelectedEquipmentId(null);
      setSearch("");
    } catch (err: any) {
      console.error("Error agregando equipamiento:", err);
      setError(err.message || "Error agregando equipamiento");
    }
  };

  const inventoryColumns = React.useMemo<Column<Equipment>[]>(
    () => [
      { header: "Nombre", accessor: "name" },
      {
        header: "Marca",
        accessor: "brand",
      },
      {
        header: "Modelo",
        accessor: "model",
      },
      {
        header: "Categoría",
        accessor: "category",
      },
      {
        header: "Último mantenimiento",
        accessor: "updated_at",
        render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
      },
    ],
    [],
  );

  const actionRenderer = (row: Equipment) => (
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
          onClick={async () => {
            try {
              await api.equipment.removeBranchEquipment(
                branchId,
                row.equipment_id,
                token!,
              );
              setCurrentInventory((prev) =>
                prev.filter((e) => e.equipment_id !== row.equipment_id),
              );
            } catch (err) {
              console.error("Error eliminando equipo:", err);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

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
              onClick={handleAddClick}
              disabled={!selectedEquipmentId || loading}
              className="w-full sm:w-auto flex-shrink-0"
            >
              <Plus size={16} className="mr-2" />
              Agregar
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
            page={1}
            pageSize={10}
          />
        )}
      </div>
    </div>
  );
};

export default BranchEquipmentPanel;
