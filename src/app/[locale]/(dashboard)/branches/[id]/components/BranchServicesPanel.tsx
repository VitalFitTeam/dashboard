"use client";

import React, { useEffect, useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { getInitials } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputField from "@/components/ui/InputField";
import { useAuth } from "@/context/AuthContext";
import {
  BranchServicePrice,
  CreateBranchServicePriceItem,
  ServiceFullDetail,
  UpdateBranchServicePrice,
} from "@vitalfit/sdk";
import { api } from "@/lib/sdk-config";
import EditBranchServiceModal from "./EditBranchServiceModal";
import { toast } from "sonner";
import { branchServiceSchema } from "@/lib/validation/branchServiceSchema";
import EntityItem from "@/components/layout/EntityItem";

interface BranchServicePanelProps {
  branchId: string;
  mode: "view" | "edit";
}

const BranchServicePanel = forwardRef((props: BranchServicePanelProps, ref) => {
  const { branchId, mode = "edit" } = props;
  const { token } = useAuth();
  const isDisabled = mode === "view";

  const [allServices, setAllServices] = useState<ServiceFullDetail[]>([]);
  const [services, setServices] = useState<BranchServicePrice[]>([]);
  const [newServices, setNewServices] = useState<
    CreateBranchServicePriceItem[]
  >([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [aforo, setAforo] = useState<number>(0);
  const [priceMember, setPriceMember] = useState<number>(0);
  const [priceNonMember, setPriceNonMember] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<BranchServicePrice | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchServices = async () => {
      try {
        const response = await api.products.getServices(token, { page: 1 });
        toast.success("Servicios de la sucursal cargados correctamente");
        setAllServices(response.data || []);
      } catch (err) {
        console.error("Error cargando servicios:", err);
        toast.error("No se pudieron cargar los servicios disponibles");
      }
    };
    fetchServices();
  }, [token]);

  useEffect(() => {
    if (!token || !branchId) {
      return;
    }
    const fetchBranchServices = async () => {
      setIsLoading(true);
      try {
        const response = await api.products.getBranchServices(branchId, token);
        setServices(response.data || []);
      } catch (err) {
        console.error("Error cargando servicios de la sucursal:", err);
        toast.error("No se pudieron cargar los servicios de la sucursal");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranchServices();
  }, [token, branchId]);

  const handleAddService = () => {
    if (!selectedServiceId) {return;}

    const service = allServices.find((s) => s.service_id === selectedServiceId);
    if (!service) {return;}

    const newService: CreateBranchServicePriceItem = {
      service_id: service.service_id,
      max_capacity: aforo,
      price_for_member: priceMember,
      price_for_non_member: priceNonMember,
      is_visible: isVisible,
    };

    const result = branchServiceSchema.safeParse(newService);
    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => `${String(issue.path[0])}: ${issue.message}`)
        .join("\n");

      toast.error(messages);
      return;
    }

    setServices((prev) => [
      ...prev,
      { ...newService, service_name: service.name } as BranchServicePrice,
    ]);
    setNewServices((prev) => [...prev, newService]);
    setDirty(true);

    setSelectedServiceId(null);
    setAforo(0);
    setPriceMember(0);
    setPriceNonMember(0);
    setIsVisible(true);

    toast.success(`Servicio "${service.name}" agregado`);
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!token || !branchId) {
      return;
    }
    setIsLoading(true);
    try {
      const isNew = newServices.find((s) => s.service_id === serviceId);
      if (isNew) {
        setNewServices((prev) =>
          prev.filter((s) => s.service_id !== serviceId),
        );
      } else {
        await api.products.removeBranchService(branchId, serviceId, token);
      }
      const removedService = services.find((s) => s.service_id === serviceId);
      setServices((prev) => prev.filter((s) => s.service_id !== serviceId));
      setDirty(true);
      toast.success(
        `Servicio "${removedService?.service_name ?? ""}" eliminado`,
      );
    } catch (err) {
      console.error("Error eliminando servicio:", err);
      toast.error("No se pudo eliminar el servicio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !branchId) {
      return;
    }
    if (newServices.length === 0) {
      toast.error("No hay servicios nuevos para guardar");
      return;
    }

    setLoading(true);
    try {
      await api.products.addBranchService(newServices, branchId, token);
      const response = await api.products.getBranchServices(branchId, token);
      setServices(response.data || []);
      setNewServices([]);
      setDirty(false);

      toast.success("Servicios guardados correctamente");
    } catch (err) {
      console.error("Error guardando servicios:", err);
      toast.error("Error al guardar los servicios");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateService = async (updatedData: {
    max_capacity: number;
    price_for_member: number;
    price_for_non_member: number;
    is_visible: boolean;
  }) => {
    if (!serviceToEdit || !token || !branchId) {
      return;
    }

    try {
      await api.products.updateBranchService(
        branchId,
        serviceToEdit.service_id,
        updatedData,
        token,
      );

      setServices((prev) =>
        prev.map((s) =>
          s.service_id === serviceToEdit.service_id
            ? { ...s, ...updatedData }
            : s,
        ),
      );

      setEditModalOpen(false);
      setServiceToEdit(null);

      toast.success(`Servicio "${serviceToEdit.service_name}" actualizado`);
    } catch (err) {
      console.error("Error actualizando servicio:", err);
      toast.error("Error al actualizar el servicio");
    }
  };

  const handleViewService = (service: BranchServicePrice) => {
    setServiceToEdit(service);
    setModalMode("view");
    setEditModalOpen(true);
  };

  const handleEditService = (service: BranchServicePrice) => {
    setServiceToEdit(service);
    setModalMode("edit");
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Servicios de la sucursal
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Administra los servicios disponibles y sus precios.
        </p>
      </section>

      {!isDisabled && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
            <div className="flex-grow min-w-[200px] space-y-1.5">
              <p className="text-sm font-medium text-gray-700">
                Agregar nuevo servicio
              </p>
              <Select
                value={selectedServiceId ?? ""}
                onValueChange={setSelectedServiceId}
              >
                <SelectTrigger id="service-select">
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {allServices
                    .filter(
                      (s) =>
                        !services.some(
                          (asv) => asv.service_id === s.service_id,
                        ),
                    )
                    .map((service) => (
                      <SelectItem
                        key={service.service_id}
                        value={service.service_id}
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <InputField
              label="Aforo"
              type="number"
              min={0}
              value={aforo}
              onChange={(e) => setAforo(Number(e.target.value))}
            />
            <InputField
              label="Precio miembros"
              type="number"
              min={0}
              value={priceMember}
              onChange={(e) => setPriceMember(Number(e.target.value))}
            />
            <InputField
              label="Precio no miembros"
              type="number"
              min={0}
              value={priceNonMember}
              onChange={(e) => setPriceNonMember(Number(e.target.value))}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm">Visible</label>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={!selectedServiceId || aforo <= 0}
              onClick={handleAddService}
            >
              <Plus size={16} className="mr-2" /> Agregar
            </Button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-800 mb-4">
          Servicios asignados
        </h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">Cargando servicios...</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-gray-500">No hay servicios asignados.</p>
        ) : (
          services.map((service) => (
            <EntityItem
              key={service.service_id}
              initials={getInitials(service.service_name ?? "??")}
              title={
                service.service_name ?? `Servicio ID: ${service.service_id}`
              }
              description={`Aforo: ${service.max_capacity} | Miembros: $${service.price_for_member} | No miembros: $${service.price_for_non_member} | Visible: ${service.is_visible ? "Sí" : "No"}`}
              action={
                !isDisabled ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => handleViewService(service)}
                      variant="outline"
                    >
                      <Eye size={20} />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleEditService(service)}
                      variant="outline"
                    >
                      <Pencil size={20} />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleRemoveService(service.service_id)}
                      variant="outline"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                ) : undefined
              }
            />
          ))
        )}
      </div>

      {!isDisabled && (
        <Button onClick={handleSave} disabled={!dirty || loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      )}

      <EditBranchServiceModal
        open={editModalOpen && !!serviceToEdit}
        onClose={() => setEditModalOpen(false)}
        service={serviceToEdit!}
        onSave={handleUpdateService}
        mode={modalMode}
      />
    </div>
  );
});

export default BranchServicePanel;
