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

interface ServicesPanelProps {
  formData: BranchDetails & { services: BranchServicePrice[] };
  setFormData: React.Dispatch<
    React.SetStateAction<BranchDetails & { services: BranchServicePrice[] }>
  >;
  mode: "view" | "edit";
  allServices?: ServiceFullDetail[];
}

export default forwardRef(function BranchServicePanel(
  {
    formData,
    setFormData,
    mode = "edit",
    allServices = [],
  }: ServicesPanelProps,
  ref,
) {
  const { token } = useAuth();
  const isDisabled = mode === "view";
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [aforo, setAforo] = useState<number | string>("");
  const [isLoading, setIsLoading] = useState(false);

  const assignedServices: BranchServicePrice[] = formData.services ?? [];

  useImperativeHandle(ref, () => ({
    saveData: async () => {
      if (!token || !formData.branch_id) {
        return;
      }

      const servicesToSave: CreateBranchServicePriceItem[] =
        assignedServices.map((s) => ({
          service_id: s.service_id,
          max_capacity: s.max_capacity,
          is_visible: s.is_visible,
          price_for_member: s.price_for_member,
          price_for_non_member: s.price_for_non_member,
        }));

      await api.products.addBranchService(
        servicesToSave,
        formData.branch_id,
        token,
      );
    },
  }));

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
        if (response?.data) {
          setFormData((prev) => ({ ...prev, services: response.data }));
        }
      } catch (err) {
        console.error("Error cargando servicios:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, [token, formData.branch_id, setFormData]);

  const handleAddClick = () => {
    if (!selectedServiceId || aforo === "" || Number(aforo) <= 0) {
      return;
    }

    const newService: BranchServicePrice = {
      branch_id: formData.branch_id,
      service_id: selectedServiceId,
      max_capacity: Number(aforo),
      is_visible: true,
      price_for_member: 0,
      price_for_non_member: 0,
      service_name:
        allServices.find((s) => s.service_id === selectedServiceId)?.name ?? "",
    };

    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));

    setSelectedServiceId(null);
    setAforo("");
  };

  const handleRemoveService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.service_id !== serviceId),
    }));
  };

  return (
    <div className="space-y-10">
      {!isDisabled && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow w-full sm:w-auto space-y-1.5">
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

            <div className="w-full sm:w-32 space-y-1.5">
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
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddClick}
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
        {assignedServices.length === 0 ? (
          <p className="text-sm text-gray-500">No hay servicios asignados.</p>
        ) : (
          assignedServices.map((service) => (
            <EntityItem
              key={service.service_id}
              initials={getInitials(service.service_name ?? "??")}
              title={
                service.service_name ?? `Servicio ID: ${service.service_id}`
              }
              description={`Aforo máximo: ${service.max_capacity} personas`}
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
});
