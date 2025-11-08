"use client";

import React, {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
  BranchDetails,
  BranchServicePrice,
  CreateBranchServicePriceItem,
  ServiceFullDetail,
} from "@vitalfit/sdk";
import { api } from "@/lib/sdk-config";

export interface BranchPanelRef {
  saveData: () => Promise<void>;
}

interface ServicesPanelProps {
  formData: BranchDetails & { services: BranchServicePrice[] };
  setFormData: React.Dispatch<
    React.SetStateAction<BranchDetails & { services: BranchServicePrice[] }>
  >;
  mode: "view" | "edit";
  allServices?: ServiceFullDetail[];
}

const BranchServicePanel = forwardRef<BranchPanelRef, ServicesPanelProps>(
  ({ formData, setFormData, mode = "edit", allServices = [] }, ref) => {
    const { token } = useAuth();
    const isDisabled = mode === "view";

    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
      null,
    );
    const [aforo, setAforo] = useState<number | string>("");
    const [priceMember, setPriceMember] = useState<number | string>("");
    const [priceNonMember, setPriceNonMember] = useState<number | string>("");
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);

    const assignedServices: BranchServicePrice[] = formData.services ?? [];

    useEffect(() => {
      if (!token) {
        return;
      }
      const fetchServices = async () => {
        try {
          const response = await api.products.getServices(token);
          setAllServicesFromApi(response.data || []);
        } catch (err) {
          console.error("❌ Error cargando servicios:", err);
        }
      };
      fetchServices();
    }, [token]);

    // Cargar servicios de la sucursal desde la API
    useEffect(() => {
      const loadServices = async () => {
        if (!token || !formData.branch_id) {
          return;
        }
        setIsLoading(true);
        try {
          const response = await api.products.getBranchServices(
            formData.branch_id,
            token,
          );
          console.log("✅ Servicios cargados correctamente", response?.data);
          if (response?.data) {
            setFormData((prev) => ({ ...prev, services: response.data }));
          }
        } catch (err) {
          console.error("❌ Error cargando servicios:", err);
        } finally {
          setIsLoading(false);
        }
      };
      loadServices();
    }, [token, formData.branch_id, setFormData]);

    const handleRemoveService = async (serviceId: string) => {
      if (!token || !formData.branch_id) {
        return;
      }
      try {
        await api.products.removeBranchService(
          formData.branch_id,
          serviceId,
          token,
        );
        // Actualizar lista local
        setFormData((prev) => ({
          ...prev,
          services: prev.services.filter((s) => s.service_id !== serviceId),
        }));
      } catch (err) {
        console.error("❌ Error al eliminar servicio:", err);
        alert(
          "No se pudo eliminar el servicio (posiblemente ya no existe o hubo un error en el servidor).",
        );
      }
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
                          !assignedServices.some(
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
                id="aforo"
                name="aforo"
                type="number"
                min="0"
                value={aforo}
                onChange={(e) => setAforo(e.target.value)}
                placeholder="Capacidad"
              />

              <InputField
                label="Precio miembros"
                id="price_member"
                name="price_member"
                type="number"
                min="0"
                value={priceMember}
                onChange={(e) => setPriceMember(e.target.value)}
                placeholder="0.00"
              />

              <InputField
                label="Precio no miembros"
                id="price_non_member"
                name="price_non_member"
                type="number"
                min="0"
                value={priceNonMember}
                onChange={(e) => setPriceNonMember(e.target.value)}
                placeholder="0.00"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="visible" className="text-sm">
                  Visible
                </label>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={!selectedServiceId || aforo === ""}
              >
                <Plus size={16} className="mr-2" />
                Agregar
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
          ) : assignedServices.length === 0 ? (
            <p className="text-sm text-gray-500">No hay servicios asignados.</p>
          ) : (
            assignedServices.map((service) => (
              <EntityItem
                key={service.service_id}
                initials={getInitials(service.service_name ?? "??")}
                title={
                  service.service_name ?? `Servicio ID: ${service.service_id}`
                }
                description={`Aforo: ${service.max_capacity} | Miembros: $${service.price_for_member} | No miembros: $${service.price_for_non_member} | Visible: ${
                  service.is_visible ? "Sí" : "No"
                }`}
                action={
                  !isDisabled ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service.service_id)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:text-red-600"
                      aria-label="Eliminar servicio"
                    >
                      <Trash2 size={20} />
                    </button>
                  ) : undefined
                }
              />
            ))
          )}
        </div>
      </div>
    );
  },
);

export default BranchServicePanel;
