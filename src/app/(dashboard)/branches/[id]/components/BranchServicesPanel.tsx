"use client";

import React, { useMemo, useState } from "react";
import { Branches, BranchService } from "@/models/branches";
import { Service } from "@/models/service";
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

interface ServicesPanelProps {
  formData: Branches;
  mode: "view" | "edit";
  allServices: Service[];
  onAddService: (
    serviceData: Omit<BranchService, "name" | "description">,
  ) => void;
  onRemoveService: (serviceId: string) => void;
}

export default function BranchServicePanel({
  // Asigna un valor por defecto a formData
  formData = { services: [] } as unknown as Branches,
  mode = "edit",
  allServices = [],
  onAddService = () => {},
  onRemoveService = () => {},
}: ServicesPanelProps) {
  const isDisabled = mode === "view";
  const assignedServices = formData.services ?? [];

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [aforo, setAforo] = useState<number | string>("");

  const availableServicesToAdd = useMemo(() => {
    const assignedIds = new Set(assignedServices.map((s) => s.serviceId));
    return allServices.filter((s) => !assignedIds.has(s.id));
  }, [allServices, assignedServices]);

  const handleAddClick = () => {
    if (selectedServiceId && aforo !== "" && !isNaN(Number(aforo))) {
      const newServiceData: Omit<BranchService, "name" | "description"> = {
        serviceId: selectedServiceId,
        maxCapacity: Number(aforo),
        isVisible: true,
        priceForMember: 0,
        priceForNonMember: 0,
      };
      onAddService(newServiceData);
      setSelectedServiceId(null);
      setAforo("");
    } else {
      console.error(
        "Por favor, selecciona un servicio e ingresa un aforo válido.",
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
          Administra los servicios disponibles y su capacidad máxima.
        </p>
      </section>
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
                  {availableServicesToAdd.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
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
              className="w-full sm:w-auto flex-shrink-0"
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

        <div className="space-y-3">
          {assignedServices.length === 0 ? (
            <p className="text-sm text-gray-500">No hay servicios asignados.</p>
          ) : (
            assignedServices.map((service) => (
              <EntityItem
                key={service.serviceId}
                initials={getInitials(service.name ?? "??")}
                title={service.name ?? `Servicio ID: ${service.serviceId}`}
                description={`Aforo máximo: ${service.maxCapacity} personas`}
                action={
                  !isDisabled ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveService(service.serviceId);
                      }}
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
    </div>
  );
}
