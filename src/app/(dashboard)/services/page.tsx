"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import EditServiceForm from "./EditServiceForm";
import ViewServiceForm from "./ViewServiceForm";
import { Button } from "@/components/ui/button";
import type { Service } from "@/models/service";
import { useState, useEffect } from "react"; // Importar 'useEffect'
import { PlusIcon } from "@heroicons/react/24/outline";
import ServicesTable from "./ServicesTable";
import { StatCard } from "@/components/ui/StatCard";
import CreateServiceForm from "./CreateServiceForm";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { ServiceFullDetail } from "@vitalfit/sdk";

// Los datos de estadísticas se calcularán a partir de la lista real de servicios
const initialStatsData = {
  total: 0,
  active: 0,
  featured: 0,
};

const statCardsConfig = [
  {
    title: "Total",
    valueKey: "total" as keyof typeof initialStatsData,
    fontColor: "text-black-600",
  },
  {
    title: "Activos",
    valueKey: "active" as keyof typeof initialStatsData,
    fontColor: "text-green-600",
  },
  {
    title: "Destacados",
    valueKey: "featured" as keyof typeof initialStatsData,
    fontColor: "text-yellow-600",
  },
];

export default function Services() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewService, setViewService] = useState<Service | null>(null); // 1. Nuevo estado para almacenar la lista de servicios
  const [services, setServices] = useState<ServiceFullDetail[]>([]); // 2. Nuevo estado para manejar el estado de carga
  const [isLoading, setIsLoading] = useState(true); // 3. Estado para las estadísticas, se calculará de 'services'
  const [statsData, setStatsData] = useState(initialStatsData);
  const { token } = useAuth(); // Función para obtener los servicios y actualizar el estado

  const fetchServices = async () => {
    if (!token) {
      // Si no hay token (e.g., cargando auth), simplemente salimos
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Aquí ya se corrigió el acceso a 'response.data'
      const response = await api.products.getServices(token);
      setServices(response.data || []);
      console.log("Servicios obtenidos:", response.data);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }; // 🔑 1. useEffect: Carga inicial de datos al montar el componente

  useEffect(() => {
    fetchServices();
  }, [token]); // Se ejecuta cuando el componente se monta y cuando el token cambie/cargue

  if (showCreateForm) {
    return (
      <CreateServiceForm
        onBack={() => {
          setShowCreateForm(false);
          fetchServices();
        }}
      />
    );
  }

  if (editingService) {
    return (
      <EditServiceForm
        service={editingService}
        onBack={() => {
          setEditingService(null);
          fetchServices();
        }}
      />
    );
  }

  if (viewService) {
    return (
      <ViewServiceForm
        service={viewService}
        onBack={() => setViewService(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6 text-center">
                <h2>Cargando servicios...</h2>   
      </div>
    );
  }
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCardsConfig.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={
              <>
                {/* 7. Usar statsData para mostrar el valor correcto */}       
                        {statsData[card.valueKey] ?? 0}
                <span className={`ml-1.5 font-normal ${card.fontColor}`}>
                                    SERVICIOS  
                </span>
              </>
            }
          />
        ))}
      </div>

      <PageHeader title="SERVICIOS">
        <Button variant="default" onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Servicios
        </Button>
      </PageHeader>

      <ServicesTable
        services={services}
        onView={(service) => setViewService(service)}
        onEdit={(service) => setEditingService(service)}
      />
    </div>
  );
}
