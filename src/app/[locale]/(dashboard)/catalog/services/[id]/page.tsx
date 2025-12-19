"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { useEditServiceData } from "@/hooks/services/useEditServiceData";
import { ServiceForm } from "@/components/modules/services/ServiceForm";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { EyeIcon } from "@heroicons/react/24/outline";

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const t = useTranslations("catalog.services.CreateService");
  const serviceId = id as string;
  const { service, categories, banners, isLoading } = useEditServiceData(serviceId, token);

  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    imageSrc?: string;
    imageName?: string;
  }>({ open: false });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    duration_minutes: "",
    priority_score: "",
    is_featured: "false",
    banner_id: "",
  });

  const [viewableImages, setViewableImages] = useState<any[]>([]);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        category_id: service.category_id,
        duration_minutes: service.duration_minutes.toString(),
        priority_score: service.priority_score.toString(),
        is_featured: service.is_featured ? "true" : "false",
        banner_id: service.banners?.[0]?.banner_id || "",
      });

      const convertedImages = service.images.map((img, i) => ({
        id: img.image_id || `img-${i}`,
        url: img.image_url,
        description: img.alt_text,
        isPrimary: img.is_primary,
        fileName: img.image_url.split("/").pop() || "image.png"
      }));
      
      setViewableImages(convertedImages);
    }
  }, [service]);

  const openPreview = (image: any) => {
    setPreviewModal({
      open: true,
      imageSrc: image.url,
      imageName: image.description || image.fileName,
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">{t("loadingData")}</div>;
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <h2 className="text-xl font-semibold">Servicio no encontrado</h2>
        <Button onClick={() => router.replace("/catalog/services")}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between border-b pb-4">
        <PageHeader 
          title="DETALLES DE SERVICIO" 
          subtitle={`Consultando: ${service.name}`} 
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            {t("buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={() => router.push(`/catalog/services/${serviceId}/edit`)}>
            Modificar
          </Button>
        </div>
      </div>

      <ServiceForm
        mode="view"
        formData={formData}
        formErrors={{}}
        handleChange={() => {}} 
        categories={categories}
        banners={banners}
        serviceImages={viewableImages}
        onImagesChange={() => {}}
        onPreviewImage={openPreview}
      />

      {previewModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-3">
                <EyeIcon className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold text-lg truncate max-w-xs md:max-w-md">
                  {previewModal.imageName}
                </h3>
              </div>
              <button onClick={() => setPreviewModal({ open: false })} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh] flex justify-center bg-gray-50">
              <img
                src={previewModal.imageSrc}
                alt="Preview"
                className="max-w-full h-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => setPreviewModal({ open: false })}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}