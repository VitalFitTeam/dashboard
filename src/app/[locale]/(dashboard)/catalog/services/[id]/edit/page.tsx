"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useEditServiceData } from "@/hooks/services/useEditServiceData";
import { useEditServiceForm } from "@/hooks/services/useEditServiceForm";
import { useServiceImages } from "@/hooks/services/useServiceImages";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ServiceForm } from "@/components/modules/services/ServiceForm";

export default function EditService() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const t = useTranslations("catalog.services");
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const serviceId = id as string;

  const { service, categories, banners, isLoading } = useEditServiceData(serviceId, token);
  const imgHook = useServiceImages();

  const formHook = useEditServiceForm(serviceId, token, () => {
    setTimeout(() => router.replace("/catalog/services"), 1500);
  });

  useEffect(() => {
    if (service) {
      formHook.fillForm(service);
      
      const initialImgs = service.images.map((img, i) => ({
        id: img.image_id || `idx-${i}`,
        file: new File([], "existing_file"), 
        preview: img.image_url,
        originalPreview: img.image_url,
        url: img.image_url,
        status: "uploaded" as const,
        isPrimary: img.is_primary,
        order: img.display_order || i,
        description: img.alt_text || "",
      }));
      
      imgHook.setServiceImages(initialImgs);
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHook.validate()) {
      return;
    }

    abortControllerRef.current = new AbortController();
    let toastId: string | number | undefined;

    try {
      toastId = toast.loading(t("notifications.uploadingImages"), {
        action: { 
          label: t("CreateService.buttons.cancel"), 
          onClick: () => {
             abortControllerRef.current?.abort();
             toast.dismiss(toastId);
          }
        }
      });

      const imagesPayload = await imgHook.processAndUpload(
        formHook.formData.name, 
        abortControllerRef.current.signal
      );
      
      toast.dismiss(toastId);

      await formHook.submitUpdate(imagesPayload);

    } catch (error: any) {
      if (toastId) {
        toast.dismiss(toastId);
      }
      
      if (error.name === "AbortError" || error.message === "AbortError") {
        return;
      }
      toast.error(t("notifications.processError"), { description: error.message });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">{t("CreateService.loadingData")}</div>;
  }

  if (!service) {
    return <div className="p-8 text-center text-red-500">Error: Service not found</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between border-b pb-4">
        <PageHeader 
          title={t("CreateService.title_edit")} 
          subtitle={`${t("CreateService.subtitle_edit")}: ${service.name}`} 
        />
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => router.back()}
            disabled={formHook.isSubmitting}
          >
            {t("CreateService.buttons.cancel")}
          </Button>
          <Button 
            variant="default" 
            type="submit" 
            form="service-edit-form" 
            disabled={formHook.isSubmitting || imgHook.isUploading}
          >
            {imgHook.isUploading 
              ? t("CreateService.buttons.uploading") 
              : formHook.isSubmitting 
                ? t("CreateService.buttons.saving") 
                : t("CreateService.buttons.create")}
          </Button>
        </div>
      </div>

      <form id="service-edit-form" onSubmit={handleSubmit}>
        <ServiceForm
          mode="edit"
          formData={formHook.formData}
          formErrors={formHook.formErrors}
          handleChange={formHook.handleChange}
          categories={categories}
          banners={banners}
          serviceImages={imgHook.serviceImages}
          onImagesChange={imgHook.setServiceImages}
          isSubmitting={formHook.isSubmitting}
          isUploadingImages={imgHook.isUploading}
        />
      </form>
    </div>
  );
}