"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { CreatePackagePayload } from "@vitalfit/sdk";
import PackageForm, { PackageFormState, PackageItemUI } from "../PackageForm";
import { api } from "@/lib/sdk-config";
import { useTranslations } from "next-intl";


export default function CreatePackagePage() {
  const router = useRouter();
  const { token } = useAuth();
  const t = useTranslations("catalog.packages");

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
        console.log(response);
        setAvailableServices(
          response.data.map((s) => ({ id: s.service_id, name: s.name })),
        );
      } catch (err) {
        console.error("Error cargando servicios:", err);
        setServicesError(t("notifications.services_load_error"));
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [token, t]);

  const handleChange = (data: Partial<PackageFormState>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      return;
    }

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

      toast.success(t("create.success"));
      setTimeout(() => router.push("/catalog/packages"), 1500);
    } catch (err: unknown) {
      console.error("Error creando paquete:", err);
      toast.error(t("create.error_create"));
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingServices) {
    return <div className="p-6">{t("form.labels.add_service")}...</div>; // Reusing "Add service" for loading
  }

  if (servicesError) {
    return <div className="p-6 text-red-500">{servicesError}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title={t("create.title")}
          subtitle={t("create.subtitle")}
        />

        <PackageForm
          formData={formData}
          onChange={handleChange}
          mode="edit"
          services={availableServices}
        />

        <Button
          type="submit"
          variant="default"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? t("create.button_creating") : t("create.button_create")}
        </Button>
      </form>
    </div>
  );
}
