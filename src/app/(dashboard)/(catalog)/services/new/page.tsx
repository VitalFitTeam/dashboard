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
import { TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { useRouter } from "next/navigation";
import {
  ServiceCategoryInfo,
  CreateService as CreateServiceType,
  CreateServiceImage,
  CreateBanner,
  Banner,
} from "@vitalfit/sdk";
import { serviceSchema, ServiceFormData } from "@/lib/validation/serviceSchema";
import { z } from "zod";

const DEFAULT_BANNER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjNmMyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYW5uZXIgZGUgU2VydmljaW88L3RleHQ+Cjwvc3ZnPg==";

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB;

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

  const [bannerImage, setBannerImage] = useState<string>("");
  const [serviceImages, setServiceImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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

  const uploadToImgBB = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        console.warn(`Error ${response.status}: No se pudo subir la imagen`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(
          data.error?.message || "Error desconocido al subir imagen",
        );
      }
    } catch (error) {
      console.error("Error subiendo a ImgBB:", error);
      return DEFAULT_BANNER_IMAGE;
    } finally {
      setUploading(false);
    }
  };

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
        setFormErrors((prev) => {
          return {
            ...prev,
            [field]: error.issues[0]?.message,
          };
        });
      }
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

    if (!validateForm()) {
      setShowError({
        visible: true,
        message: "Por favor, corrige los errores en el formulario.",
      });
      return;
    }

    setIsSubmitting(true);
    setShowError({ visible: false, message: "" });

    try {
      let bannerId = formData.banner_id;

      if (bannerId) {
        console.log("Usando banner existente:", bannerId);
      } else if (bannerImage) {
        try {
          console.log("Creando nuevo banner desde imagen subida...");
          const bannerPayload: CreateBanner = {
            name: `Banner - ${formData.name}`,
            image_url: bannerImage,
            link_url: bannerImage,
            is_active: true,
          };

          await api.marketing.createBanners(bannerPayload, token);

          const bannersResponse = await api.marketing.getBanner(token);
          const updatedBanners = bannersResponse.data || [];
          const newBanner = updatedBanners.find((banner: Banner) => {
            return banner.image_url === bannerImage;
          });

          if (newBanner?.banner_id) {
            bannerId = newBanner.banner_id;
            console.log("Banner creado exitosamente:", bannerId);
          } else {
            throw new Error("No se pudo obtener el ID del banner creado");
          }
        } catch (error) {
          console.error("Error creando banner desde imagen:", error);
        }
      }

      if (!bannerId) {
        try {
          console.log("Creando banner por defecto...");
          bannerId = await createDefaultBanner(formData.name);
          console.log("Banner por defecto creado:", bannerId);
        } catch (error) {
          console.error("Error creando banner por defecto:", error);
          const activeBanners = banners.filter((b) => {
            return b.is_active;
          });
          if (activeBanners.length > 0 && activeBanners[0].banner_id) {
            bannerId = activeBanners[0].banner_id;
            console.log("Usando primer banner activo disponible:", bannerId);
          } else {
            throw new Error("No se pudo obtener un banner válido.");
          }
        }
      }

      const serviceImagesPayload: CreateServiceImage[] = serviceImages.map(
        (url, index) => {
          return {
            image_url: url,
            alt_text: `Imagen ${index + 1} - ${formData.name}`,
            display_order: index,
            is_primary: index === 0,
          };
        },
      );

      if (!bannerId) {
        throw new Error("No se pudo obtener un banner válido para el servicio");
      }

      const servicePayload: CreateServiceType = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        duration: parseInt(formData.duration_minutes),
        priority: parseInt(formData.priority_score),
        is_featured: formData.is_featured === "true",
        banner_id: bannerId,
        service_images: serviceImagesPayload,
      };

      console.log("Enviando servicio:", servicePayload);

      await api.products.createService(servicePayload, token);

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/services");
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

  const createDefaultBanner = async (serviceName: string): Promise<string> => {
    if (!token) {
      throw new Error("No token available");
    }

    try {
      const bannerPayload: CreateBanner = {
        name: `Banner - ${serviceName}`,
        image_url: DEFAULT_BANNER_IMAGE,
        link_url: DEFAULT_BANNER_IMAGE,
        is_active: true,
      };

      await api.marketing.createBanners(bannerPayload, token);

      const bannersResponse = await api.marketing.getBanner(token);
      const updatedBanners = bannersResponse.data || [];

      const newBanner = updatedBanners.find((banner: Banner) => {
        return banner.name === `Banner - ${serviceName}`;
      });

      if (!newBanner || !newBanner.banner_id) {
        throw new Error("No se pudo obtener el ID del banner creado");
      }

      return newBanner.banner_id;
    } catch (error) {
      console.error("Error creando banner por defecto:", error);
      throw error;
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imageUrl = await uploadToImgBB(file);
      setBannerImage(imageUrl);
      setFormData((prev) => {
        return { ...prev, banner_id: "" };
      });
    } catch (error) {
      console.error("Error subiendo banner:", error);
      setShowError({
        visible: true,
        message: "Error al subir el banner. Se usará una imagen por defecto.",
      });
    }
  };

  const handleServiceImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }

    try {
      for (const file of files) {
        const imageUrl = await uploadToImgBB(file);
        setServiceImages((prev) => {
          return [...prev, imageUrl];
        });
      }
    } catch (error) {
      console.error("Error subiendo imágenes de servicio:", error);
      setShowError({
        visible: true,
        message:
          "Error al subir algunas imágenes. Se usarán imágenes por defecto.",
      });
    }
  };

  const handleChange = (field: keyof ServiceFormData, value: string) => {
    setFormData((prev) => {
      return { ...prev, [field]: value };
    });

    if (
      field === "name" ||
      field === "description" ||
      field === "duration_minutes"
    ) {
      validateField(field, value);
    }
  };

  const handleBannerRemove = () => {
    setBannerImage("");
  };

  const removeServiceImage = (index: number) => {
    setServiceImages((prev) => {
      return prev.filter((_, i) => i !== index);
    });
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
                {categories.map((cat) => {
                  return (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </SelectItem>
                  );
                })}
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
                if (value) {
                  setBannerImage("");
                }
              }}
              required
            >
              <SelectTrigger id="banner_id" className="w-full">
                <SelectValue placeholder="Selecciona un banner existente" />
              </SelectTrigger>
              <SelectContent>
                {banners
                  .filter((b) => {
                    return b.is_active;
                  })
                  .map((banner) => {
                    return (
                      <SelectItem
                        key={banner.banner_id}
                        value={banner.banner_id || ""}
                      >
                        {banner.name}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Este campo es obligatorio. Selecciona un banner existente.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>O subir nuevo banner (Opcional)</Label>

          {bannerImage ? (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={bannerImage}
                    alt="Banner preview"
                    className="w-20 h-20 rounded border object-cover"
                  />
                  <div>
                    <p className="font-medium">Banner subido exitosamente</p>
                    <p className="text-sm text-gray-500">
                      Listo para crear el servicio
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBannerRemove}
                >
                  <TrashIcon className="h-6 w-6 text-red-500" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <input
                type="file"
                id="banner-upload"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
              <label htmlFor="banner-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">+</span>
                  </div>
                  <span className="hover:text-orange-600">
                    {uploading
                      ? "Subiendo..."
                      : "Haz clic para subir un banner"}
                  </span>
                </div>
              </label>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Si subes un nuevo banner, se creará automáticamente y se usará para
            este servicio.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Imágenes del servicio (Opcional)</Label>

          {serviceImages.length > 0 && (
            <div className="space-y-3 mb-4">
              {serviceImages.map((url, index) => {
                return (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={url}
                          alt={`Service image ${index + 1}`}
                          className="w-16 h-16 rounded border object-cover"
                        />
                        <div>
                          <p className="font-medium">Imagen {index + 1}</p>
                          <p className="text-sm text-gray-500">
                            {index === 0
                              ? "Imagen principal"
                              : "Imagen secundaria"}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          removeServiceImage(index);
                        }}
                      >
                        <TrashIcon className="h-6 w-6 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <input
              type="file"
              id="service-upload"
              accept="image/*"
              multiple
              onChange={handleServiceImagesUpload}
              className="hidden"
            />
            <label htmlFor="service-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">+</span>
                </div>
                <span className="hover:text-gray-600">
                  {uploading
                    ? "Subiendo..."
                    : "Haz clic para agregar imágenes del servicio"}
                </span>
              </div>
            </label>
          </div>

          <p className="text-sm text-gray-500">
            Puedes subir múltiples imágenes para el servicio
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              router.push("/services");
            }}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || uploading}
            className="flex-1"
          >
            {isSubmitting ? "Creando servicio..." : "Crear Servicio"}
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
