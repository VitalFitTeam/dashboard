"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { TabSelector } from "./TabSelector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import {
  Branches,
  BranchInstructor,
  BranchInventoryItem,
  BranchOperatingHours,
  BranchService,
  DayOfWeek,
} from "@/types/branches";
import GeneralPanel from "./branches/details/GeneralPanel";
import PaymentMethodPanel from "./branches/details/PaymentMethodsPanel";
import EquipmentPanel from "./branches/details/EquipmentPanel";
import InstructorsPanel from "./branches/details/InstructorsPanel";
import ServicesPanel from "./branches/details/ServicesPanel";
import SchedulePanel from "./branches/details/SchedulePanel";
import { Instructor } from "@/types/instructor";
import { City, State, Country } from "@/types/location";
import { Service } from "@/types/service";
import { Equipment } from "@/types/equipment";
import LocationPanel from "./branches/details/LocationPanel";
import { PaymentMethodUI } from "@/app/(dashboard)/branches/page";

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchData: Branches | null;
  initialMode: "view" | "edit";
  allInstructors: Instructor[];
  allCities: City[];
  allStates: State[];
  allCountries: Country[];
  allServices: Service[];
  allEquipment: Equipment[];
  allPaymentMethods: PaymentMethodUI[];
}

type ArrayChange = {
  target: { name: string; value: string[] };
};

const defaultSchedule: BranchOperatingHours[] = (
  [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ] as DayOfWeek[]
).map((day) => ({
  dayOfWeek: day,
  openTime: "09:00",
  closeTime: "17:00",
  isClosed: day === "Sunday",
}));

export default function BranchDetailsModal({
  isOpen,
  onClose,
  branchData,
  initialMode,
  allInstructors,
  allCities,
  allStates,
  allCountries,
  allServices,
  allEquipment,
  allPaymentMethods,
}: BranchDetailsModalProps) {
  if (!isOpen || !branchData) {
    return null;
  }

  const [formData, setFormData] = useState<Branches>(branchData);
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [schedule, setSchedule] = useState<BranchOperatingHours[]>(
    branchData.operatingHours?.length
      ? branchData.operatingHours
      : defaultSchedule,
  );
  const isEditing = currentMode === "edit";

  useEffect(() => {
    if (branchData) {
      setFormData(branchData);
      setSchedule(
        branchData.operatingHours?.length
          ? branchData.operatingHours
          : defaultSchedule,
      );
    }
    setCurrentMode(initialMode);
  }, [branchData, initialMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const type = e.target.type;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (name === "countryId") {
      setFormData((prevData) => ({ ...prevData, stateId: "", cityId: "" }));
    } else if (name === "stateId") {
      setFormData((prevData) => ({ ...prevData, cityId: "" }));
    }
  };

  const handleScheduleChange = (updatedSchedule: BranchOperatingHours[]) => {
    setSchedule(updatedSchedule);
    setFormData((prevData) => ({
      ...prevData,
      operatingHours: updatedSchedule,
    }));
  };

  const handleAssignInstructor = (instructorId: string) => {
    const instructorInfo = allInstructors.find(
      (inst) => inst.id === instructorId,
    );
    if (!instructorInfo) {
      return;
    }
    if (
      (formData.instructors ?? []).find(
        (inst) => inst.instructorId === instructorId,
      )
    ) {
      return console.warn("Instructor ya asignado.");
    }
    const newBranchInstructor: BranchInstructor = {
      instructorId: instructorInfo.id,
      status: "Active",
      name: instructorInfo.name,
      user_id: instructorInfo.user_id,
      specialty: instructorInfo.specialty ?? undefined,
    };
    setFormData((prevData) => ({
      ...prevData,
      instructors: [...(prevData.instructors ?? []), newBranchInstructor],
    }));
  };

  const handleRemoveInstructor = (instructorId: string) => {
    setFormData((prevData) => ({
      ...prevData,
      instructors: (prevData.instructors ?? []).filter(
        (inst) => inst.instructorId !== instructorId,
      ),
    }));
  };

  const handleMapSelect = (data: {
    latitud: string;
    longitud: string;
    address: string;
    city: string;
    state: string;
    country: string;
  }) => {
    const selectedCountry = allCountries.find((c) => c.name === data.country);
    const selectedState = allStates.find(
      (s) => s.name === data.state && s.countryId === selectedCountry?.id,
    );
    const selectedCity = allCities.find(
      (c) => c.name === data.city && c.stateId === selectedState?.id,
    );

    setFormData((prevData) => ({
      ...prevData,
      latitude: parseFloat(data.latitud),
      longitude: parseFloat(data.longitud),
      address: data.address,
      countryId: selectedCountry?.id ?? prevData.countryId,
      stateId: selectedState?.id ?? prevData.stateId,
      cityId: selectedCity?.id ?? prevData.cityId,
      city: data.city,
      country: data.country,
    }));
  };

  const handlePaymentMethodChange = (selectedIds: string[]) => {
    setFormData((prevData) => ({
      ...prevData,
      paymethods: selectedIds,
    }));
  };

  const handleSwitchToEdit = () => setCurrentMode("edit");
  const handleSave = () => {
    console.log("Guardando:", formData);
    onClose();
  };

  const handleAddService = (
    serviceData: Omit<BranchService, "name" | "description">,
  ) => {
    const serviceInfo = allServices.find((s) => s.id === serviceData.serviceId);
    const newBranchService: BranchService = {
      ...serviceData,
      name: serviceInfo?.name,
    };

    setFormData((prevData) => ({
      ...prevData,
      services: [...(prevData.services ?? []), newBranchService],
    }));
  };

  const handleRemoveService = (serviceId: string) => {
    setFormData((prevData) => ({
      ...prevData,
      services: (prevData.services ?? []).filter(
        (s) => s.serviceId !== serviceId,
      ),
    }));
  };

  const handleAddInventoryItem = (itemData: {
    equipmentId: string;
    quantity: number;
    status: string;
    branch_id: string;
  }) => {
    const equipmentInfo = allEquipment.find(
      (eq) => eq.id === itemData.equipmentId,
    );
    if (!equipmentInfo) {
      return;
    }

    const newItems: BranchInventoryItem[] = Array.from({
      length: itemData.quantity,
    }).map((_, index) => ({
      inventoryId: `temp-${Date.now()}-${index}`,
      equipmentId: itemData.equipmentId,
      status: itemData.status as any,
      name: equipmentInfo.name,
      category: equipmentInfo.category,
    }));

    setFormData((prev) => ({
      ...prev,
      inventory: [...(prev.inventory ?? []), ...newItems],
    }));
  };

  const handleRemoveInventoryItem = (inventoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      inventory: (prev.inventory ?? []).filter(
        (item) => item.inventoryId !== inventoryId,
      ),
    }));
  };

  const tabItems = [
    {
      value: "general",
      label: "General",
      content: (
        <GeneralPanel
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          mode={currentMode}
          allCities={allCities}
          allStates={allStates}
        />
      ),
    },
    {
      value: "location",
      label: "Ubicación",
      content: (
        <LocationPanel
          formData={formData}
          mode={currentMode}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleMapSelect={handleMapSelect}
          allCountries={allCountries}
          allStates={allStates}
          allCities={allCities}
        />
      ),
    },
    {
      value: "schedule",
      label: "Horarios",
      content: (
        <SchedulePanel
          schedule={schedule}
          onScheduleChange={handleScheduleChange}
          mode={currentMode}
        />
      ),
    },
    {
      value: "payment",
      label: "Métodos de pago",
      content: (
        <PaymentMethodPanel
          formData={formData}
          handlePaymentMethodChange={handlePaymentMethodChange}
          mode={currentMode}
          allPaymentMethods={allPaymentMethods}
        />
      ),
    },
    {
      value: "services",
      label: "Servicios",
      content: (
        <ServicesPanel
          formData={formData}
          mode={currentMode}
          allServices={allServices}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
        />
      ),
    },
    {
      value: "instructors",
      label: "Instructores",
      content: (
        <InstructorsPanel
          mode={currentMode}
          assignedInstructors={formData.instructors ?? []}
          allInstructors={allInstructors}
          onAdd={handleAssignInstructor}
          onRemove={handleRemoveInstructor}
        />
      ),
    },
    {
      value: "equipment",
      label: "Equipamiento",
      content: (
        <EquipmentPanel
          formData={formData}
          mode={currentMode}
          allEquipment={allEquipment}
          onAddItem={handleAddInventoryItem}
          onRemoveItem={handleRemoveInventoryItem}
        />
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-lg border rounded-lg">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Detalles de sucursal
            </h2>
            <p className="text-sm text-gray-500">{formData.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Activa
            </span>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-gray-700 flex-shrink-0"
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto">
          <TabSelector tabs={tabItems} defaultValue="general" />
        </CardContent>

        <CardFooter className="flex justify-end space-x-3 pt-6 bg-gray-50">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentMode("view");
                  setFormData(branchData);
                  setSchedule(
                    branchData.operatingHours?.length
                      ? branchData.operatingHours
                      : defaultSchedule,
                  );
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#F58025] hover:bg-[#E07122] text-white"
                onClick={handleSave}
              >
                Guardar cambios
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Eliminar sucursal
              </Button>
              <Button
                className="bg-[#F58025] hover:bg-[#E07122] text-white"
                onClick={handleSwitchToEdit}
              >
                Modificar
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
