"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Notification } from "@/components/ui/Notification";
import { PackageDetail, ServiceFullDetail } from "@vitalfit/sdk";
import { useAuth } from "@/context/AuthContext";
import PackageForm from "../../PackageForm";

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [packageD, setPackageD] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!id || !token) {
      return;
    }

    const loadPackage = async () => {
      try {
        setLoading(true);
        const response = await api.packages.getPackageByID(id, token);
        setPackageD(response.data);
      } catch (err: any) {
        console.error("Error cargando paquete:", err);
        setError("No se pudo cargar el paquete.");
      } finally {
        setLoading(false);
      }
    };

    loadPackage();
  }, [id, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const response = await api.products.getServices(token, {
          page: 1,
          limit: 100,
        });
        const allServices = response.data.map((s: ServiceFullDetail) => ({
          id: s.service_id,
          name: s.name,
        }));
        setAvailableServices(allServices);
      } catch (err) {
        console.error("Error cargando servicios:", err);
        setServicesError("No se pudieron cargar los servicios.");
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [token]);

  const handleChange = (data: Partial<PackageDetail>) => {
    setPackageD((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageD || !token) {
      return;
    }

    setShowServerError({ visible: false, message: "" });
    setIsLoading(true);

    try {
      await api.packages.updatePackage(packageD.packageId, packageD, token);
      setShowSuccess(true);
      setTimeout(() => router.push("/packages"), 1500);
    } catch (err: any) {
      console.error("Error al guardar paquete:", err);
      setShowServerError({
        visible: true,
        message:
          err?.response?.data?.error ||
          "Error desconocido al actualizar el paquete",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando paquete...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  if (!packageD) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PageHeader
          title="Editar Paquete"
          subtitle={`Modifica los datos del paquete: ${packageD.name}`}
          actionButton={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.push("/packages")}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          }
        />

        {servicesError && (
          <div className="text-red-500 mb-2">{servicesError}</div>
        )}

        <PackageForm
          formData={packageD}
          onChange={handleChange}
          mode="edit"
          services={availableServices}
        />
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="¡Paquete actualizado exitosamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showServerError.visible && (
        <Notification
          variant="destructive"
          title="Error al actualizar paquete"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
