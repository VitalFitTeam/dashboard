"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import {
  ServiceFullDetail,
  ServiceCategoryInfo,
  UpdateServiceManual,
  UpdateServiceImageManual,
  Banner,
} from "@vitalfit/sdk";
import { serviceSchema, ServiceFormData } from "@/lib/validation/serviceSchema";
import ImageUploader from "@/components/modules/services/ImageUploader";
import { z } from "zod";

type UploadedImage = {
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

export default function EditService() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const serviceId = params.id as string;

  const [service, setService] = useState<ServiceFullDetail | null>(null);
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
  const [selectedBannerId, setSelectedBannerId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("general");

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
      if (!token || !serviceId) {
        setIsLoading(false);
        return;
      }

      try {
        const [serviceResponse, categoriesResponse, bannersResponse] =
          await Promise.all([
            api.products.getServiceByID(serviceId, token),
            api.products.getCategories(token),
            api.marketing.getBanner(token),
          ]);

        const serviceData = serviceResponse.data;
        setService(serviceData);
        setCategories(categoriesResponse.data || []);
        setBanners(bannersResponse.data || []);

        setFormData({
          name: serviceData.name,
          description: serviceData.description,
          category_id: serviceData.category_id,
          duration_minutes: serviceData.duration_minutes.toString(),
          priority_score: serviceData.priority_score.toString(),
          is_featured: serviceData.is_featured ? "true" : "false",
          banner_id:
            serviceData.banners && serviceData.banners.length > 0
              ? serviceData.banners[0].banner_id || ""
              : "",
        });

        if (serviceData.banners && serviceData.banners.length > 0) {
          setSelectedBannerId(serviceData.banners[0].banner_id || "");
        }

        const convertedServiceImages: UploadedImage[] =
          serviceData.images.map((image, index) => {
            const file = new File([], `service-image-${index}.png`, { type: "image/png" });
            return {
              id: image.image_id || `service-img-${index}`,
              file: file,
              preview: image.image_url,
              originalPreview: image.image_url,
              url: image.image_url,
              status: "uploaded" as const,
              isPrimary: image.is_primary,
              order: image.display_order || index,
              description: image.alt_text,
            };
          });

        setServiceImages(convertedServiceImages);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
        setShowError({
          visible: true,
          message: "Error al cargar los datos del servicio",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [token, serviceId]);

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

    if (
      field === "name" ||
      field === "description" ||
      field === "duration_minutes"
    ) {
      validateField(field, value);
    }
  };

  const handleImagesChange = useCallback((images: UploadedImage[]) => {
    setServiceImages(images);
  }, []);

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
  const processAndUploadImages = async (): Promise<UpdateServiceImageManual[]> => {
    if (serviceImages.length === 0) { return []; }

    setIsUploadingImages(true);
    const uploadedImages: UpdateServiceImageManual[] = [];

    try {
      for (const [index, img] of serviceImages.entries()) {
        try {
          let imageUrl = img.url;

          if (!imageUrl) {
            let fileToUpload: File;

            if (img.croppedBlob) {
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

    if (!token || !service) {
      setShowError({
        visible: true,
        message: "No estás autenticado o el servicio no existe.",
      });
      return;
    }

    if (!validateForm()) {
      setShowError({
        visible: true,
        message: "Por favor, corrige los errores en el formulario.",
      });
      return;
    }

    // Validar que se haya seleccionado un banner
    const finalBannerId = selectedBannerId || formData.banner_id;
    if (!finalBannerId) {
      setShowError({
        visible: true,
        message: "Por favor, selecciona un banner para el servicio.",
      });
      return;
    }

    const hasImages = serviceImages.length > 0;

    if (!hasImages) {
      const originalHadImages = service.images && service.images.length > 0;

      let message = "El servicio no tendrá imágenes. ¿Estás seguro de que quieres continuar?";
      if (originalHadImages) {
        message = "Estás eliminando todas las imágenes del servicio. ¿Estás seguro de que quieres continuar?";
      }

      const confirmDelete = window.confirm(message);
      if (!confirmDelete) {
        return;
      }
    }

    setIsSubmitting(true);
    setShowError({ visible: false, message: "" });

    try {
      let serviceImagesPayload: UpdateServiceImageManual[] = [];

      if (hasImages) {
        serviceImagesPayload = await processAndUploadImages();
      } else {
        console.warn("No hay imágenes para procesar");
      }

      const updatePayload: UpdateServiceManual = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        duration: parseInt(formData.duration_minutes),
        priority: parseInt(formData.priority_score),
        is_featured: formData.is_featured === "true",
        banner_id: finalBannerId,
        service_images: serviceImagesPayload, // Esto puede ser un array vacío
      };

      await api.products.updateService(serviceId, updatePayload, token);

      setShowSuccess(true);

      setTimeout(() => {
        router.replace("/services");
      }, 1500);
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      setShowError({
        visible: true,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al actualizar el servicio",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBannerSelect = (bannerId: string) => {
    setSelectedBannerId(bannerId);
    handleChange("banner_id", bannerId);
  };

  const handleBack = () => {
    router.replace("/services");
  };

  const selectedBanner = banners.find(b => b.banner_id === selectedBannerId);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="text-center">Cargando datos del servicio...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Servicio no encontrado
          </h2>
          <Button onClick={handleBack} variant="primary">
            Volver a servicios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between">
        <PageHeader
          title="EDITAR SERVICIO"
          subtitle={`Modifica la información del servicio ${service.name}`}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImages}
            className="px-6"
          >
            {isSubmitting ? "Guardando..." : isUploadingImages ? "Subiendo imágenes..." : "Guardar"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Gestión de imágenes</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">

          <TabsContent value="general" className="space-y-6">
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
                rows={5}
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
                <Label htmlFor="priority_score">Prioridad</Label>
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
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="banner_id" className="text-base font-semibold">
                Banner del Servicio *
              </Label>
              <Select
                value={selectedBannerId}
                onValueChange={handleBannerSelect}
              >
                <SelectTrigger id="banner_id" className="w-full">
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
              {!selectedBannerId && (
                <p className="text-red-500 text-sm">Debes seleccionar un banner</p>
              )}
            </div>

            {/* Vista previa del banner seleccionado */}
            {selectedBanner && (
              <div className="border border-gray-200 rounded-lg p-6 bg-white space-y-4">
                <h3 className="font-semibold text-lg">Vista previa del banner seleccionado</h3>
                <div className="flex items-start gap-6 p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 relative">
                      <img
                        src={selectedBanner.image_url}
                        alt={selectedBanner.name}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 text-lg">
                        {selectedBanner.name}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Estado:</span>
                          <span className={`px-2 py-1 text-xs rounded ${selectedBanner.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}>
                            {selectedBanner.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Este banner se mostrará como imagen principal del servicio.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Imágenes del Servicio
              </Label>
              <p className="text-sm text-gray-600">
                Agrega o modifica las imágenes del servicio. Las imágenes se subirán automáticamente al guardar.
              </p>

              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <ImageUploader
                  maxFiles={8}
                  aspect={16 / 9}
                  onChange={handleImagesChange}
                  initialImages={serviceImages}
                  disableManualUpload={true}
                />
              </div>
            </div>
          </TabsContent>
        </form>
      </Tabs>

      {showSuccess && (
        <Notification
          variant="success"
          description="¡Servicio actualizado exitosamente!"
          onClose={() => {
            setShowSuccess(false);
          }}
        />
      )}
      {showError.visible && (
        <Notification
          variant="destructive"
          title="Error al actualizar servicio"
          description={showError.message}
          onClose={() => {
            setShowError({ visible: false, message: "" });
          }}
        />
      )}
    </div>
  );
}