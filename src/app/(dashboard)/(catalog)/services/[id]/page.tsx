"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { ServiceFullDetail, ServiceCategoryInfo } from "@vitalfit/sdk";
<<<<<<< HEAD:src/app/(dashboard)/services/[id]/page.tsx

interface ViewableImage {
  id: string;
  url: string;
  description?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  fileName?: string;
  fileSize?: string;
}
=======
import ImageUploader, {
  UploadableImage,
} from "@/components/modules/services/ImageUploader";
>>>>>>> development:src/app/(dashboard)/(catalog)/services/[id]/page.tsx

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const serviceId = params.id as string;

  const [service, setService] = useState<ServiceFullDetail | null>(null);
  const [categories, setCategories] = useState<ServiceCategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState({
    visible: false,
    message: "",
  });
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    imageSrc?: string;
    imageName?: string;
  }>({
    open: false,
  });

  const [bannerImages, setBannerImages] = useState<ViewableImage[]>([]);
  const [serviceImages, setServiceImages] = useState<ViewableImage[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: "",
    priority: "",
    featured: "false",
    banner_name: "",
  });

  // Función para extraer nombre de archivo de URL
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split("/").pop() || "image.png";
      return fileName.includes(".") ? fileName : `${fileName}.png`;
    } catch {
      return "image.png";
    }
  };

  // Función para obtener tamaño legible
  const formatFileSize = (sizeInMB: number): string => {
    return `${sizeInMB.toFixed(1)} MB`;
  };

  // Cargar detalles del servicio y categorías
  useEffect(() => {
    const loadServiceDetail = async () => {
      if (!token || !serviceId) {
        setIsLoading(false);
        return;
      }

      try {
        const [serviceResponse, categoriesResponse] = await Promise.all([
          api.products.getServiceByID(serviceId, token),
          api.products.getCategories(token),
        ]);

        const serviceData = serviceResponse.data;
        setService(serviceData);
        setCategories(categoriesResponse.data || []);

        const selectedCategory = categoriesResponse.data?.find(
          cat => cat.category_id === serviceData.category_id
        );

        setFormData({
          name: serviceData.name,
          description: serviceData.description,
          category: serviceData.category_id,
          duration: serviceData.duration_minutes.toString(),
          priority: serviceData.priority_score.toString(),
          featured: serviceData.is_featured ? "true" : "false",
          banner_name: serviceData.banners?.[0]?.name || "Sin banner",
        });

        const convertedServiceImages: ViewableImage[] =
          serviceData.images.map((image, index) => {
            const fileName = getFileNameFromUrl(image.image_url);
            return {
              id: image.image_id || `service-img-${index}`,
              url: image.image_url,
              description: image.alt_text,
              fileName: fileName,
              fileSize: formatFileSize(6.5),
              isPrimary: image.is_primary,
              displayOrder: image.display_order,
            };
          });

        // Ordenar por display_order
        setServiceImages(convertedServiceImages.sort((a, b) =>
          (a.displayOrder || 0) - (b.displayOrder || 0)
        ));

        if (serviceData.banners && serviceData.banners.length > 0) {
          const banner = serviceData.banners[0];
          const fileName = getFileNameFromUrl(banner.image_url);
          const convertedBannerImages: ViewableImage[] = [{
            id: banner.banner_id || `banner-${banner.name}`,
            url: banner.image_url,
            description: banner.name,
            fileName: fileName,
            fileSize: formatFileSize(6.5),
            isPrimary: true,
          }];
          setBannerImages(convertedBannerImages);
        }
      } catch (error) {
        console.error("Error cargando detalles del servicio:", error);
        setShowError({
          visible: true,
          message: "Error al cargar los detalles del servicio",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceDetail();
  }, [token, serviceId]);

  const handleEdit = () => {
    router.replace(`/services/${serviceId}/edit`);
  };

  const handleBack = () => {
    router.replace("/services");
  };

  const openPreview = (image: ViewableImage) => {
    setPreviewModal({
      open: true,
      imageSrc: image.url,
      imageName: image.fileName || image.description || "Imagen del servicio",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="text-center">Cargando detalles del servicio...</div>
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
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a servicios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            DETALLES DE SERVICIO
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            Modificar
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Consulta los campos del servicio seleccionado
      </p>

      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría del Servicio *</Label>
            <Select value={formData.category} disabled>
              <SelectTrigger id="category" className="w-full bg-gray-50">
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
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción *</Label>
          <Textarea
            id="description"
            value={formData.description}
            disabled
            className="bg-gray-50 min-h-[120px]"
            rows={4}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (Minutos) *</Label>
            <Input
              id="duration"
              className="bg-gray-50"
              value={formData.duration}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={formData.priority} disabled>
              <SelectTrigger id="priority" className="w-full bg-gray-50">
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

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="featured">Destacado</Label>
            <Select value={formData.featured} disabled>
              <SelectTrigger id="featured" className="w-full bg-gray-50">
                <SelectValue placeholder="¿Está destacado?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_name">Banner Asociado</Label>
            <Input
              id="banner_name"
              className="bg-gray-50"
              value={formData.banner_name}
              disabled
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-lg font-semibold">Banner del servicio</Label>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            {bannerImages.length > 0 ? (
              <div className="space-y-4">
                {bannerImages.map((banner) => (
                  <div
                    key={banner.id}
                    className="rounded-lg overflow-hidden border bg-gray-50"
                  >
                    <img
                      src={banner.url}
                      alt="Banner del servicio"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">No hay banner asociado a este servicio</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-lg font-semibold">Imágenes del servicio</Label>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            {serviceImages.length > 0 ? (
              <div className="space-y-4">
                {serviceImages.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center justify-between gap-4 border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-24 h-16 rounded overflow-hidden border bg-white">
                      <img
                        src={image.url}
                        alt={image.description || image.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {image.fileName}
                        </p>
                        {image.isPrimary && (
                          <StarIconSolid className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-orange-400">{image.fileSize}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openPreview(image)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                      title="Ver imagen"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No hay imágenes asociadas a este servicio</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewModal.open && previewModal.imageSrc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <EyeIcon className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {previewModal.imageName}
                  </h3>
                  <p className="text-sm text-gray-500">Vista previa de imagen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal({ open: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Cerrar vista previa"
              >
                <span className="text-2xl text-gray-500 group-hover:text-gray-700">×</span>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh] flex justify-center bg-gray-50">
              <img
                src={previewModal.imageSrc}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewModal({ open: false })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showError.visible && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{showError.message}</span>
            <button
              onClick={() => setShowError({ visible: false, message: "" })}
              className="absolute top-0 right-0 px-4 py-3"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}