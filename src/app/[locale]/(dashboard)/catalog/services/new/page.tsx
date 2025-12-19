"use client";

import { useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { useServiceData } from "@/hooks/services/useServiceData";
import { useServiceImages } from "@/hooks/services/useServiceImages";
import { useServiceForm } from "@/hooks/services/useServiceForm";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploader from "@/components/modules/services/ImageUploader";

export default function CreateService() {
  const router = useRouter();
  const { token } = useAuth();
  
  const t = useTranslations("catalog.services");

  const abortControllerRef = useRef<AbortController | null>(null);

  const { categories, banners, isLoading } = useServiceData(token);
  const imgHook = useServiceImages();

  const formHook = useServiceForm(token, () => {
    setTimeout(() => router.replace("/catalog/services"), 1500);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formHook.validate()) {
      return;
    }

    if (imgHook.serviceImages.length === 0) {
      toast.warning(t("notifications.missingImages"), {
        description: t("notifications.missingImagesDesc")
      });
      return;
    }

    abortControllerRef.current = new AbortController();
    let uploadToastId: string | number | undefined;

    try {

      uploadToastId = toast.loading(t("notifications.uploadingImages"), {
        action: {
          label: t("CreateService.buttons.cancel"), 
          onClick: () => {
            abortControllerRef.current?.abort();
            toast.dismiss(uploadToastId);
          }
        }
      });

      const uploadedImages = await imgHook.processAndUpload(
        formHook.formData.name,
        abortControllerRef.current.signal
      );

      toast.dismiss(uploadToastId);

      await formHook.submitService(uploadedImages);

    } catch (error: any) {
      if (uploadToastId) {
        toast.dismiss(uploadToastId);
      }

      if (error.name === "AbortError" || error.message === "AbortError") {
        return;
      }

      toast.error(t("notifications.processError"), {
        description: error.message || t("notifications.tryAgain")
      });
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort(); 
    router.back();
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">{t("CreateService.loadingData")}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 3. Agregamos el prefijo 'CreateService' a los campos del formulario */}
        <PageHeader 
            title={t("CreateService.title")} 
            subtitle={t("CreateService.subtitle")} 
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("CreateService.fields.name")} *</Label>
            <Input
              value={formHook.formData.name}
              onChange={(e) => formHook.handleChange("name", e.target.value)}
              className={formHook.formErrors.name ? "border-red-500 shadow-sm focus-visible:ring-red-500" : ""}
              placeholder={t("CreateService.fields.namePlaceholder")}
            />
            {formHook.formErrors.name && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formHook.formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("CreateService.fields.category")} *</Label>
            <Select
              value={formHook.formData.category_id}
              onValueChange={(v) => formHook.handleChange("category_id", v)}
            >
              <SelectTrigger className={formHook.formErrors.category_id ? "border-red-500 focus:ring-red-500" : ""}>
                <SelectValue placeholder={t("CreateService.fields.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.category_id} value={c.category_id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formHook.formErrors.category_id && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formHook.formErrors.category_id}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("CreateService.fields.description")} *</Label>
          <Textarea
            placeholder={t("CreateService.fields.descriptionPlaceholder")}
            value={formHook.formData.description}
            onChange={(e) => formHook.handleChange("description", e.target.value)}
            className={formHook.formErrors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
            rows={4}
          />
          {formHook.formErrors.description && (
            <p className="text-xs text-red-500 mt-1 font-medium">{formHook.formErrors.description}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("CreateService.fields.duration")} *</Label>
            <Input
              type="number"
              value={formHook.formData.duration_minutes}
              onChange={(e) => formHook.handleChange("duration_minutes", e.target.value)}
              className={formHook.formErrors.duration_minutes ? "border-red-500 focus-visible:ring-red-500" : ""}
              placeholder="60"
            />
            {formHook.formErrors.duration_minutes && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formHook.formErrors.duration_minutes}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("CreateService.fields.banner")} *</Label>
            <Select
              value={formHook.formData.banner_id}
              onValueChange={(v) => formHook.handleChange("banner_id", v)}
            >
              <SelectTrigger className={formHook.formErrors.banner_id ? "border-red-500 focus:ring-red-500" : ""}>
                <SelectValue placeholder={t("CreateService.fields.bannerPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {banners.filter(b => b.is_active).map((b) => (
                  <SelectItem key={b.banner_id} value={b.banner_id || ""}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formHook.formErrors.banner_id && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formHook.formErrors.banner_id}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <Label className="text-lg font-semibold">{t("CreateService.fields.imagesTitle")} *</Label>
          <ImageUploader
            maxFiles={8}
            aspect={16 / 9}
            onChange={imgHook.setServiceImages}
            disableManualUpload={true}
          />
          <p className="text-xs text-muted-foreground italic">
            {t("CreateService.fields.imagesHelper")}
          </p>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            {t("CreateService.buttons.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={formHook.isSubmitting || imgHook.isUploading}
            className="flex-1"
          >
            {imgHook.isUploading
              ? t("CreateService.buttons.uploading")
              : formHook.isSubmitting
                ? t("CreateService.buttons.saving")
                : t("CreateService.buttons.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}