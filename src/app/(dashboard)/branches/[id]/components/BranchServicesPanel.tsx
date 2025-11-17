"use client";

import React, { useEffect, useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getInitials } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputField from "@/components/ui/InputField";
import EntityItem from "@/components/features/EntityItem";
import { useAuth } from "@/context/AuthContext";
import {
  BranchServicePrice,
  CreateBranchServicePriceItem,
  ServiceFullDetail,
  UpdateBranchServicePrice,
} from "@vitalfit/sdk";
import { api } from "@/lib/sdk-config";
import EditBranchServiceModal from "./EditBranchServiceModal";

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

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await api.products.getServices(token, { page: 1 });
        setAllServices(response.data || []);
      } catch (err) {
        console.error("Error cargando servicios:", err);
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
        console.log(response.data);
        setServices(response?.data || []);
      } catch (err) {
        console.error("Error cargando servicios de la sucursal:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranchServices();
  }, [token, branchId]);

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
              //onClick={handleAddService}
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
                      //onClick={() => handleRemoveService(service.service_id)}
                      variant="outline"
                    >
                      <Trash2 size={20} />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setServiceToEdit(service);
                        setEditModalOpen(true);
                      }}
                      variant="outline"
                    >
                      <Pencil size={20} />
                    </Button>
                  </div>
                ) : undefined
              }
            />
          ))
        )}
      </div>
      {!isDisabled && (
        <Button
          //onClick={handleSave}
          disabled={!dirty || loading}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      )}

      {/* <EditBranchServiceModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        service={serviceToEdit}
        onSave={handleUpdateService}
        mode={mode}
      /> */}
    </div>
  );
});

export default BranchServicePanel;
