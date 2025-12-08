"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { BranchPaymentMethodInfo, PaymentMethod } from "@vitalfit/sdk";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import EntityItem from "@/components/layout/EntityItem";

interface BranchPaymentMethodPanelProps {
  branchId: string;
  mode?: "edit" | "view";
}

export default function BranchPaymentMethodPanel({
  branchId,
  mode = "edit",
}: BranchPaymentMethodPanelProps) {
  const { token } = useAuth();

  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethod[]>(
    [],
  );
  const [selectedMethods, setSelectedMethods] = useState<
    BranchPaymentMethodInfo[]
  >([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchAllMethods = async () => {
      try {
        setLoading(true);
        const res = await api.paymentMethod.getPaymentMethods(token);
        setAllPaymentMethods(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("No se pudieron cargar los métodos de pago disponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMethods();
  }, [token]);

  useEffect(() => {
    if (!token || !branchId) {
      return;
    }

    const fetchBranchMethods = async () => {
      try {
        setLoading(true);
        const res = await api.paymentMethod.getBranchPaymentMethods(
          branchId,
          token,
        );
        setSelectedMethods(res.data || []);
        setDirty(false);
        toast.success("Métodos de pago de la sucursal cargados correctamente");
      } catch (err) {
        console.error(err);
        toast.error("No se pudieron cargar los métodos de pago de la sucursal");
      } finally {
        setLoading(false);
      }
    };

    fetchBranchMethods();
  }, [branchId, token]);

  const handleAddMethod = () => {
    if (!branchId || !selectedId) {
      return;
    }

    const method = allPaymentMethods.find((m) => m.method_id === selectedId);
    if (!method) {
      return;
    }

    const newMethod: BranchPaymentMethodInfo = {
      method_id: method.method_id,
      branch_id: branchId,
      is_active: true,
      name: method.name,
      type: method.type,
    };

    setSelectedMethods((prev) => [...prev, newMethod]);
    setSelectedId("");
    setDirty(true);
    toast.success(`Método de pago "${method.name}" agregado`);
  };

  const handleRemove = async (id: string) => {
    if (!token || !branchId) {
      return;
    }
    setLoading(true);
    try {
      await api.paymentMethod.removeBranchPaymentMethod(branchId, id, token);
      setSelectedMethods((prev) => prev.filter((m) => m.method_id !== id));
      setDirty(true);
      toast.success("Método de pago eliminado correctamente");
    } catch (err) {
      console.error("Error eliminando método de pago:", err);
      toast.error("No se pudo eliminar el método de pago");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !branchId) {
      return;
    }

    setLoading(true);
    try {
      const payload = selectedMethods.map((m) => m.method_id);

      await toast.promise(
        api.paymentMethod.addBranchPaymentMethod(branchId, payload, token),
        {
          loading: "Guardando métodos de pago...",
          success: "Métodos de pago guardados correctamente",
          error: "No se pudieron guardar los métodos de pago",
        },
      );

      setDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Métodos de pago aceptados
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Selecciona los métodos de pago que estarán disponibles en esta
          sucursal.
        </p>
      </section>

      {mode === "edit" && (
        <div className="flex gap-2 items-end">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecciona un método..." />
            </SelectTrigger>
            <SelectContent>
              {allPaymentMethods
                .filter(
                  (m) =>
                    !selectedMethods.some((s) => s.method_id === m.method_id),
                )
                .map((method) => (
                  <SelectItem key={method.method_id} value={method.method_id}>
                    {method.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddMethod} disabled={!selectedId}>
            Agregar
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {selectedMethods.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay métodos de pago seleccionados.
          </p>
        ) : (
          selectedMethods.map((method) => (
            <EntityItem
              key={method.method_id}
              initials={method.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
              title={method.name}
              description={`Tipo: ${method.type}`}
              action={
                mode === "edit" ? (
                  <button
                    className="text-sm text-red-500 hover:underline"
                    onClick={() => handleRemove(method.method_id)}
                  >
                    Eliminar
                  </button>
                ) : null
              }
            />
          ))
        )}
      </div>

      {mode === "edit" && (
        <Button onClick={handleSave} disabled={!dirty || loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      )}
    </div>
  );
}
