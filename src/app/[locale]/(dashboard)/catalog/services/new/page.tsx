"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Notification } from "@/components/ui/Notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { useRouter } from "next/navigation";
import {
  ServiceCategoryInfo,
  CreateService as CreateServiceType,
  CreateServiceImage,
  Banner,
} from "@vitalfit/sdk";
import { serviceSchema, ServiceFormData } from "@/lib/validation/serviceSchema";
import ImageUploader from "@/components/modules/services/ImageUploader";
import { z } from "zod";

export type UploadedImage = {
  id: string;
  file: File;
  preview: string;
  originalPreview: string;
  croppedBlob?: Blob;
  croppedPreview?: string;
  status: "pending" | "cropped" | "uploading" | "uploaded" | "error";
  url?: string;
  error?: string;
  isPrimary?: boolean;
  order: number;
  description?: string;
};

export default function CreateService() {
  const router = useRouter();
  const { token } = useAuth();

  const [categories, setCategories] = useState<ServiceCategoryInfo[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState({
    visible: false,
    message: "",
  });

  const [serviceImages, setServiceImages] = useState<UploadedImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [bannerError, setBannerError] = useState<string>("");

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    category_id: "",
    duration_minutes: "",
    priority_score: "5",
    is_featured: "false",
    banner_id: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ServiceFormData, string>>
  >({});

  useEffect(() => {
    const loadInitialData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [categoriesResponse, bannersResponse] = await Promise.all([
          api.products.getCategories(token),
          api.marketing.getBanner(token),
        ]);

        setCategories(categoriesResponse.data || []);
        setBanners(bannersResponse.data || []);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
        setShowError({
          visible: true,
          message: "Error al cargar los datos iniciales",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [token]);

  const validateForm = (): boolean => {
    try {
      serviceSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ServiceFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof ServiceFormData] = issue.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const validateField = (field: keyof ServiceFormData, value: string) => {
    try {
      serviceSchema.pick({ [field]: true }).parse({ [field]: value });
      setFormErrors((prev) => {
        return { ...prev, [field]: undefined };
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: error.issues[0]?.message,
        }));
      }
    }
  };

  const handleChange = (field: keyof ServiceFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "banner_id" && value) {
      setBannerError("");
    }

    if (
      field === "name" ||
      field === "description" ||
      field === "duration_minutes"
    ) {
      validateField(field, value);
    }
  };

  const handleImagesChange = (images: UploadedImage[]) => {
    setServiceImages(images);
  };

  // Función para subir una imagen a ImgBB
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB;

    if (!imgbbKey) {
      throw new Error("No se encontró la clave de API de ImgBB");
    }

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error de ImgBB:", errorText);
      throw new Error(`Error al subir la imagen: ${res.status}`);
    }

    const json = await res.json();

    if (!json.data || !json.data.url) {
      throw new Error("Respuesta inválida de ImgBB");
    }

    return json.data.url;
  };

  // Función para procesar y subir todas las imágenes
  const processAndUploadImages = async (): Promise<CreateServiceImage[]> => {
    if (serviceImages.length === 0) { return []; }

    setIsUploadingImages(true);
    const uploadedImages: CreateServiceImage[] = [];

    try {
      for (const [index, img] of serviceImages.entries()) {
        try {
          let imageUrl = img.url;

          // Si la imagen no tiene URL, subirla a ImgBB
          if (!imageUrl) {
            // Determinar qué archivo subir (recortado u original)
            let fileToUpload: File;

            if (img.croppedBlob) {
              // Usar la versión recortada si existe
              fileToUpload = new File(
                [img.croppedBlob],
                img.file.name || "cropped-image.jpg",
                { type: "image/jpeg" }
              );
            } else {
              fileToUpload = img.file;
            }
            imageUrl = await uploadToImgBB(fileToUpload);
          }

          uploadedImages.push({
            image_url: imageUrl,
            alt_text: img.description || `Imagen ${index + 1} - ${formData.name}`,
            display_order: img.order,
            is_primary: img.isPrimary || index === 0,
          });

        } catch (error) {
          console.error(`Error procesando imagen ${index + 1}:`, error);
          throw new Error(`Error al procesar la imagen ${index + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`);
        }
      }

      return uploadedImages;
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setShowError({
        visible: true,
        message: "No estás autenticado. Por favor, inicia sesión nuevamente.",
      });
      return;
    }

    // Validar que se haya seleccionado un banner
    if (!formData.banner_id) {
      setBannerError("Por favor, selecciona un banner para el servicio.");
      return;
    } else {
      setBannerError("");
    }

    if (!validateForm()) {
      setShowError({
        visible: true,
        message: "Por favor, corrige los errores en el formulario.",
      });
      return;
    }

    // Validar que haya al menos una imagen
    if (serviceImages.length === 0) {
      setShowError({
        visible: true,
        message: "El servicio debe tener al menos una imagen.",
      });
      return;
    }

    setIsSubmitting(true);
    setShowError({ visible: false, message: "" });

    try {
      const serviceImagesPayload = await processAndUploadImages();

      const servicePayload: CreateServiceType = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        duration: parseInt(formData.duration_minutes),
        priority: parseInt(formData.priority_score),
        is_featured: formData.is_featured === "true",
        banner_id: formData.banner_id,
        service_images: serviceImagesPayload,
      };

      await api.products.createService(servicePayload, token);

      setShowSuccess(true);

      setTimeout(() => {
        router.replace("/services");
      }, 1500);
    } catch (error) {
      console.error("Error al crear servicio:", error);
      setShowError({
        visible: true,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al crear el servicio",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="text-center">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title="CREAR NUEVO SERVICIO"
          subtitle="Complete la información del nuevo servicio"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Introduce el nombre del servicio"
              value={formData.name}
              onChange={(e) => {
                handleChange("name", e.target.value);
              }}
              className={`bg-white ${formErrors.name ? "border-red-500" : ""}`}
              required
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Categoría del Servicio *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => {
                handleChange("category_id", value);
              }}
            >
              <SelectTrigger
                id="category_id"
                className={`w-full ${formErrors.category_id ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.category_id && (
              <p className="text-red-500 text-sm">{formErrors.category_id}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción *</Label>
          <Textarea
            id="description"
            placeholder="Escribe una descripción aquí..."
            value={formData.description}
            onChange={(e) => {
              handleChange("description", e.target.value);
            }}
            className={`bg-white ${formErrors.description ? "border-red-500" : ""}`}
            rows={3}
            required
          />
          {formErrors.description && (
            <p className="text-red-500 text-sm">{formErrors.description}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duración (Minutos) *</Label>
            <Input
              id="duration_minutes"
              type="number"
              min="1"
              placeholder="Ej: 60"
              value={formData.duration_minutes}
              onChange={(e) => {
                handleChange("duration_minutes", e.target.value);
              }}
              className={`bg-white ${formErrors.duration_minutes ? "border-red-500" : ""}`}
              required
            />
            {formErrors.duration_minutes && (
              <p className="text-red-500 text-sm">
                {formErrors.duration_minutes}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority_score">Prioridad *</Label>
            <Select
              value={formData.priority_score}
              onValueChange={(value) => {
                handleChange("priority_score", value);
              }}
            >
              <SelectTrigger id="priority_score" className="w-full">
                <SelectValue placeholder="Selecciona una prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Muy Baja</SelectItem>
                <SelectItem value="2">2 - Baja</SelectItem>
                <SelectItem value="3">3 - Media</SelectItem>
                <SelectItem value="4">4 - Alta</SelectItem>
                <SelectItem value="5">5 - Muy Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="is_featured">Destacado</Label>
            <Select
              value={formData.is_featured}
              onValueChange={(value) => {
                handleChange("is_featured", value);
              }}
            >
              <SelectTrigger id="is_featured" className="w-full">
                <SelectValue placeholder="¿Es un servicio destacado?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Sí</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_id">Banner del Servicio *</Label>
            <Select
              value={formData.banner_id}
              onValueChange={(value) => {
                handleChange("banner_id", value);
              }}
              required
            >
              <SelectTrigger
                id="banner_id"
                className={`w-full ${bannerError ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Selecciona un banner existente" />
              </SelectTrigger>
              <SelectContent>
                {banners
                  .filter((b) => b.is_active)
                  .map((banner) => (
                    <SelectItem
                      key={banner.banner_id}
                      value={banner.banner_id || ""}
                    >
                      {banner.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {bannerError && (
              <p className="text-red-500 text-sm">{bannerError}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Imágenes del Servicio *</Label>
          <p className="text-sm text-gray-600">
            Las imágenes se subirán automáticamente al crear el servicio.
          </p>

          <ImageUploader
            maxFiles={8}
            aspect={16 / 9}
            onChange={handleImagesChange}
            disableManualUpload={true}
          />

          {serviceImages.length > 0 && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <span className="font-medium">{serviceImages.length}</span>
                <span> imágenes listas para subir al guardar</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              router.replace("/services");
            }}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isUploadingImages}
            className="flex-1"
          >
            {isSubmitting ? "Creando servicio..." : isUploadingImages ? "Subiendo imágenes..." : "Crear Servicio"}
          </Button>
        </div>
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="¡Servicio creado exitosamente!"
          onClose={() => {
            setShowSuccess(false);
          }}
        />
      )}
      {showError.visible && (
        <Notification
          variant="destructive"
          title="Error al crear servicio"
          description={showError.message}
          onClose={() => {
            setShowError({ visible: false, message: "" });
          }}
        />
      )}
    </div>
  );
}