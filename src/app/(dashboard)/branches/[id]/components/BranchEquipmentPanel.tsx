"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye } from "lucide-react";
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
import { Equipment, BranchEquipmentInventory } from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface BranchEquipmentPanelProps {
  mode?: "view" | "edit";
  branchId: string;
}

const BranchEquipmentPanel: React.FC<BranchEquipmentPanelProps> = ({
  mode = "edit",
  branchId,
}) => {
  const { token } = useAuth();
  const [currentInventory, setCurrentInventory] = useState<
    BranchEquipmentInventory[]
  >([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const isDisabled = mode === "view";

  // Traer todos los equipos disponibles
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

  // Traer inventario de la sucursal
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

  // Columnas para la tabla
  const inventoryColumns: Column<BranchEquipmentInventory>[] = [
    { header: "Nombre", accessor: "name" },
    { header: "Serial", accessor: "serial_number" },
    { header: "Estado", accessor: "status" },
    { header: "Adquisición", accessor: "acquisition_date" },
    { header: "Último mantenimiento", accessor: "last_maintenance_date" },
    { header: "Notas", accessor: "notes" },
    { header: "Creado", accessor: "created_at" },
    { header: "Actualizado", accessor: "updated_at" },
  ];

  // Render de acciones (ver detalles / eliminar)
  const actionRenderer = (row: BranchEquipmentInventory) => (
    <div className="flex items-center justify-end gap-1">
      <Button size="icon" variant="ghost" title="Ver detalles">
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
              if (!token) {return;}

              await api.equipment.removeBranchEquipment(
                branchId,
                row.inventory_id,
                token,
              );

              setCurrentInventory((prev) =>
                prev.filter((e) => e.inventory_id !== row.inventory_id),
              );

              toast.success("Equipo eliminado correctamente");
            } catch (err) {
              console.error(err);
              toast.error("Error eliminando equipo");
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
              disabled={!selectedEquipmentId || loading}
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
          <DataTable<BranchEquipmentInventory>
            columns={inventoryColumns}
            data={currentInventory}
            getRowId={(row) => row.inventory_id}
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
