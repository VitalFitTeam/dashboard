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

import { useTranslations } from "next-intl";

const BranchEquipmentPanel: React.FC<BranchEquipmentPanelProps> = ({
  branchId,
  mode = "edit",
}) => {
  const t = useTranslations("branches");
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

  const [equipmentPage, setEquipmentPage] = useState(1);
  const [equipmentPageSize, setEquipmentPageSize] = useState(10);

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
        toast.error(t("details.equipment.error_loading_catalog"));
      } finally {
        setLoading(false);
      }
    };
    fetchAllEquipment();
  }, [token, t]);

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
      toast.error(t("details.equipment.error_loading_inventory"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [branchId, token]);

  const handleAddEquipment = () => {
    if (!selectedEquipmentId) {
      toast.error(t("details.equipment.select_before_adding"));
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
      toast.error(t("details.equipment.error_adding", { errors: errorMessages }));
      return;
    }

    setPendingInventory((prev) => [...prev, newPending]);
    setSelectedEquipmentId(null);
    setSerialNumber("");
    setNotes("");
    toast.success(
      t("details.equipment.success_added_pending", { name: newPending.name }),
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
        t("details.equipment.success_removed_pending", { name: isPending.name }),
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

    toast.success(t("details.equipment.success_removed", { name: removed.name }));
  };

  const handleSaveChanges = async () => {
    if (!token) {
      toast.error(t("details.equipment.error_invalid_token"));
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

      toast.success(t("details.equipment.success_save"));
      setPendingInventory([]);
      setRemovedInventoryIds([]);
      await fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error(t("details.equipment.error_save"));
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
      toast.error(t("details.equipment.error_invalid_update"));
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
      toast.error(t("details.equipment.error_update", { errors: errorMessages }));
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
        t("details.equipment.success_update", { name: equipmentToEdit.name }),
      );
      setEditModalOpen(false);
      setEquipmentToEdit(null);
    } catch (err) {
      console.error(err);
      toast.error(t("details.equipment.error_updating"));
    } finally {
      setLoading(false);
    }
  };

  const inventoryColumns: Column<BranchEquipmentInventory>[] = [
    { header: t("details.equipment.table.name"), accessor: "name" },
    { header: t("details.equipment.table.serial"), accessor: "serial_number" },
    { header: t("details.equipment.table.status"), accessor: "status" },
    { header: t("details.equipment.table.acquisition"), accessor: "acquisition_date" },
    { header: t("details.equipment.table.last_maintenance"), accessor: "last_maintenance_date" },
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
        title={t("details.equipment.actions.view")}
      >
        <Eye size={16} />
      </Button>

      {!isDisabled && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleEdit(row)}
          title={t("details.equipment.actions.edit")}
        >
          <Pencil size={16} />
        </Button>
      )}

      {!isDisabled && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleRemoveEquipment(row.inventory_id)}
          title={t("details.equipment.actions.delete")}
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

  const totalPages = Math.ceil(displayedInventory.length / equipmentPageSize);
  const currentDisplayedInventory = displayedInventory.slice(
    (equipmentPage - 1) * equipmentPageSize,
    equipmentPage * equipmentPageSize,
  );

  useEffect(() => {
    if (equipmentPage > 1 && currentDisplayedInventory.length === 0 && totalPages > 0) {
      setEquipmentPage(totalPages);
    }
  }, [displayedInventory.length, equipmentPageSize, equipmentPage, currentDisplayedInventory.length, totalPages]);

  return (
    <div className="space-y-6">
      {!isDisabled && (
        <div className="p-6 border rounded-xl bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t("details.equipment.add.title")}
          </h3>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              {t("details.equipment.add.search_label")}
            </label>
            <InputField
              placeholder={t("details.equipment.add.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={selectedEquipmentId ?? ""}
              onValueChange={setSelectedEquipmentId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("details.equipment.add.select_placeholder")} />
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
              label={t("details.equipment.add.serial_label")}
              type="text"
              placeholder={t("details.equipment.add.serial_placeholder")}
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="flex-1"
            />
            <InputField
              label={t("details.equipment.add.notes_label")}
              type="text"
              placeholder={t("details.equipment.add.notes_placeholder")}
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
              <Plus size={16} className="mr-2" /> {t("details.equipment.add.button")}
            </Button>
            <Button
              type="button"
              onClick={handleSaveChanges}
              disabled={
                pendingInventory.length === 0 &&
                removedInventoryIds.length === 0
              }
            >
              {loading ? t("create.form.buttons.saving") : t("create.form.buttons.save")}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">{t("details.equipment.inventory_title")}</h3>
        {displayedInventory.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {t("pagination.show")}
            </span>
            <Select
              value={equipmentPageSize.toString()}
              onValueChange={(val) => {
                setEquipmentPageSize(Number(val));
                setEquipmentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              {t("pagination.per_page")}
            </span>
          </div>
        )}
      </div>

      {displayedInventory.length === 0 ? (
        <p className="text-sm text-gray-500">
          {t("details.equipment.empty")}
        </p>
      ) : (
        <DataTable
          columns={inventoryColumns}
          data={currentDisplayedInventory}
          enableRowSelection
          actions={actionRenderer}
          page={equipmentPage}
          pageSize={equipmentPageSize}
          totalPages={totalPages}
          onPageChange={setEquipmentPage}
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
