"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Notification } from "@/components/ui/Notification";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CreatePackagePayload } from "@vitalfit/sdk";
import PackageForm from "../PackageForm";
import { api } from "@/lib/sdk-config";

interface PackageItemUI {
  serviceId: string;
  sessionsIncluded: number;
  name: string;
}

export interface PackageFormState {
  name: string;
  description: string;
  price: number;
  startAt: string;
  endAt: string;
  packageItems: PackageItemUI[];
}

export default function CreatePackagePage() {
  const router = useRouter();
  const { token } = useAuth();

  const [formData, setFormData] = useState<PackageFormState>({
    name: "",
    description: "",
    price: 0,
    startAt: "",
    endAt: "",
    packageItems: [],
  });

  const [availableServices, setAvailableServices] = useState<
    { id: string; name: string }[]
  >([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showServerError, setShowServerError] = useState({
    visible: false,
    message: "",
  });

  // ---------------- CARGAR SERVICIOS ----------------
  useEffect(() => {
    if (!token) {return;}

    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const response = await api.products.getServices(token, {
          page: 1,
          limit: 100,
        });
        console.log(response);
        setAvailableServices(
          response.data.map((s) => ({ id: s.service_id, name: s.name })),
        );
      } catch (err) {
        console.error("Error cargando servicios:", err);
        setServicesError("No se pudieron cargar los servicios.");
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [token]);

  // ---------------- HANDLERS ----------------
  const handleChange = (data: Partial<PackageFormState>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleAddService = (service: { id: string; name: string }) => {
    if (formData.packageItems.some((s) => s.serviceId === service.id)) {return;}
    const newItem: PackageItemUI = {
      serviceId: service.id,
      name: service.name,
      sessionsIncluded: 1,
    };
    setFormData((prev) => ({
      ...prev,
      packageItems: [...prev.packageItems, newItem],
    }));
  };

  const handleRemoveService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      packageItems: prev.packageItems.filter((s) => s.serviceId !== serviceId),
    }));
  };

  const handleUpdateSessions = (serviceId: string, sessions: number) => {
    setFormData((prev) => ({
      ...prev,
      packageItems: prev.packageItems.map((item) =>
        item.serviceId === serviceId
          ? { ...item, sessionsIncluded: sessions }
          : item,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {return;}

    setShowServerError({ visible: false, message: "" });
    setIsLoading(true);

    try {
      const payload: CreatePackagePayload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        startAt: formData.startAt,
        endAt: formData.endAt,
        packageItems: formData.packageItems.map(
          ({ serviceId, sessionsIncluded }) => ({
            serviceId,
            sessionsIncluded,
          }),
        ),
      };

      await api.packages.createPackage(payload, token);

      setShowSuccess(true);
      setTimeout(() => router.push("/packages"), 1500);
    } catch (err: unknown) {
      console.error("Error creando paquete:", err);
      setShowServerError({
        visible: true,
        message: "No se pudo crear el paquete. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingServices) {
    return <div className="p-6">Cargando servicios...</div>;
  }

  if (servicesError) {
    return <div className="p-6 text-red-500">{servicesError}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title="Crear Paquete"
          subtitle="Complete la información del nuevo paquete"
        />

        {/* FORM */}
        <PackageForm
          formData={formData}
          onChange={handleChange}
          mode="edit"
          services={availableServices}
        />

        {/* BOTÓN */}
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Creando..." : "Crear paquete"}
        </Button>
      </form>

      {/* NOTIFICACIONES */}
      {showSuccess && (
        <Notification
          variant="success"
          description="¡Paquete creado exitosamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showServerError.visible && (
        <Notification
          variant="destructive"
          title="Error"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
