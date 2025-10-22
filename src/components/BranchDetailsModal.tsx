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
import { BranchAdmin } from "@/types/users";
import { BranchDetails, deleteBranch, fetchBranchDetails } from "@/services/branches";

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string | null;
  initialMode: "view" | "edit";
  allInstructors: Instructor[];
  allCities: City[];
  allStates: State[];
  allCountries: Country[];
  allServices: Service[];
  allEquipment: Equipment[];
  allPaymentMethods: PaymentMethodUI[];
  allBranchAdmins: BranchAdmin[];
  onBranchDeleted?: () => void | Promise<void>;
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
  branchId,
  initialMode,
  allInstructors,
  allCities,
  allStates,
  allCountries,
  allServices,
  allEquipment,
  allPaymentMethods,
  allBranchAdmins,
  onBranchDeleted
}: BranchDetailsModalProps) {

  if (!isOpen || !branchId) {
    return null;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Branches | null>(null); // Inicia como null
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [schedule, setSchedule] = useState<BranchOperatingHours[]>(defaultSchedule);
  const [pristineData, setPristineData] = useState<BranchDetails | null>(null);

  const isEditing = currentMode === "edit";

  const mapDetailsToFormData = (data: BranchDetails): Branches => {
    const country = allCountries.find(c => c.name === data.location.country);
    const state = allStates.find(s => s.name === data.location.state && s.countryId === country?.id);
    const city = allCities.find(c => c.name === (data as any).location.city && c.stateId === state?.id); 
    const manager = allBranchAdmins.find(a => a.firstName === data.manager.firstName && a.lastName === data.manager.lastName);

    const mappedSchedule: BranchOperatingHours[] = (data.operatingHours || []).map(h => ({
      dayOfWeek: h.dayOfWeek as DayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      isClosed: h.isClosed,
    }));
    
    const paymentMethodIds = data.paymentMethods.map(pm => pm.id);
    const formStatus = (data.status?.toLowerCase() || "inactive") as "active" | "inactive" | "maintenance";
    
    return {
      id: data.id,
      name: data.name,
      taxId: data.taxId,
      status: formStatus,
      phone: data.phone,
      address: data.location.address,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      capacity: data.capacity,
      countryId: country?.id || "",
      stateId: state?.id || "",
      cityId: city?.id || "",
      administrator: manager?.id || "",
      operatingHours: mappedSchedule,
      paymethods: paymentMethodIds, 
      instructors: (data as any).instructors || [], 
      services: (data as any).services || [],
      inventory: (data as any).inventory || [],
      city: (data as any).location.city || "",
      country: data.location.country,
      state: data.location.state,
    };
  };

 useEffect(() => {
    setCurrentMode(initialMode);
    
    if (isOpen && branchId) {
      const loadDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchBranchDetails(branchId); 
          setPristineData(data); 
          
          const mappedData = mapDetailsToFormData(data);
          setFormData(mappedData); 
          
          setSchedule(
            mappedData.operatingHours?.length
              ? mappedData.operatingHours
              : defaultSchedule,
          );
        } catch (err) {
          setError("No se pudieron cargar los detalles.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      loadDetails();
    } else if (!isOpen) {
      setFormData(null);
      setError(null);
      setPristineData(null);
      setSchedule(defaultSchedule);
    }
  }, [branchId, initialMode, isOpen]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const type = e.target.type;
    setFormData((prevData) => ({
      ...prevData!, 
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

 const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData!, [name]: value })); 
    if (name === "countryId") {
      setFormData((prevData) => ({ ...prevData!, stateId: "", cityId: "" }));
    } else if (name === "stateId") {
      setFormData((prevData) => ({ ...prevData!, cityId: "" }));
    }
  };
  const handleScheduleChange = (updatedSchedule: BranchOperatingHours[]) => {
    setSchedule(updatedSchedule);
    setFormData((prevData) => {
      if (!prevData){
        return prevData; 
      }
      return {
        ...prevData,
        operatingHours: updatedSchedule,
      };
    });
  };


 const handleDelete = async () => {
    if (!branchId) {
      return;
    }
    if (!window.confirm("¿Seguro que deseas eliminar esta sucursal?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró el token de autenticación. Inicie sesión de nuevo.");
      }
      await deleteBranch(branchId, token); 

      if (onBranchDeleted){
        await onBranchDeleted();
      }
      onClose(); 
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar la sucursal.");
    } finally {
      setIsLoading(false);
    }
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

    setFormData((prevData) => {
    
      if (!prevData) {
        return prevData;
      }

      return {
        ...prevData,
        latitude: parseFloat(data.latitud),
        longitude: parseFloat(data.longitud),
        address: data.address,
        countryId: selectedCountry?.id ?? prevData.countryId,
        stateId: selectedState?.id ?? prevData.stateId,
        cityId: selectedCity?.id ?? prevData.cityId,
        city: data.city,
        country: data.country,
      };
    });
  };

const handlePaymentMethodChange = (selectedIds: string[]) => {
    setFormData((prevData) => {
      
      if (!prevData) {
        return prevData;
      }
      return {
        ...prevData,
        paymethods: selectedIds,
      };
    });
  };
  const handleSwitchToEdit = () => setCurrentMode("edit");
  const handleSave = () => {
    console.log("Guardando:", formData);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] p-8">
          Cargando detalles...
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] p-8">
          <p className="text-red-500">{error}</p>
          <Button onClick={onClose} variant="outline" className="mt-4">Cerrar</Button>
        </Card>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  
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
          allBranchAdmins={allBranchAdmins}
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
    /*{
      value: "services",
      label: "Servicios",
      content: (
        <ServicesPanel
          formData={formData}
          mode={currentMode}
          allServices={allServices}
        />
      ),
    },
    {
      value: "instructors",
      label: "Instructores",
      content: (
        <InstructorsPanel
          mode={currentMode}
          assignedInstructors={formData?.instructors ?? []}
          allInstructors={allInstructors}
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
        />
      ),
    },*/
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
                  if (pristineData) {
                    const mappedData = mapDetailsToFormData(pristineData);
                    setFormData(mappedData);
                    setSchedule(mappedData.operatingHours?.length ? mappedData.operatingHours : defaultSchedule);
                  }
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
                onClick={handleDelete}
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
