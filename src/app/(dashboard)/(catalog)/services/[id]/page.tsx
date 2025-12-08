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
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { ServiceFullDetail, ServiceCategoryInfo } from "@vitalfit/sdk";
import ImageUploader, {
  UploadableImage,
} from "@/components/modules/services/ImageUploader";

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

  const [bannerImages, setBannerImages] = useState<UploadableImage[]>([]);
  const [serviceImages, setServiceImages] = useState<UploadableImage[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: "",
    priority: "",
    featured: "false",
  });

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

        // Llenar el formulario con los datos del servicio
        setFormData({
          name: serviceData.name,
          description: serviceData.description,
          category: serviceData.category_id,
          duration: serviceData.duration_minutes.toString(),
          priority: serviceData.priority_score.toString(),
          featured: serviceData.is_featured ? "true" : "false",
        });

        // Convertir imágenes del servicio a UploadableImage
        const convertedServiceImages: UploadableImage[] =
          serviceData.images.map((image, index) => ({
            id: image.image_id,
            file: new File([], `image-${index}`),
            description: image.alt_text,
            url: image.image_url,
          }));

        setServiceImages(convertedServiceImages);

        // Convertir banners a UploadableImage (tomamos el primer banner si existe)
        if (serviceData.banners && serviceData.banners.length > 0) {
          const banner = serviceData.banners[0];
          const convertedBannerImages: UploadableImage[] = [
            {
              id: banner.banner_id,
              file: new File([], "banner-0"),
              description: banner.name,
              url: banner.image_url,
            },
          ];
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
    router.push(`/services/${serviceId}/edit`);
  };

  const handleBack = () => {
    router.push("/services");
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
    <div className="flex-1 space-y-6 p-8 pt-6">
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

      <form className="space-y-2">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Introduce el nombre del servicio"
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
            placeholder="Escribe una descripción aquí..."
            value={formData.description}
            disabled
            className="bg-gray-50 min-h-[120px]"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (Minutos) *</Label>
            <Input
              id="duration"
              className="bg-gray-50"
              placeholder="Ej. 60"
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

        {/* Banner del servicio */}
        <div className="space-y-2">
          <Label>Banner del servicio</Label>
          <ImageUploader
            label=""
            images={bannerImages}
            inputId="banner-upload"
            onUpload={() => {}} // Deshabilitado en modo vista
            onRemove={() => {}} // Deshabilitado en modo vista
            onReorder={() => {}} // Deshabilitado en modo vista
          />
          <p className="text-sm text-gray-500">
            Vista del banner asociado al servicio
          </p>
        </div>

        {/* Imágenes del servicio */}
        <div className="space-y-2">
          <Label>Imágenes del servicio</Label>
          <ImageUploader
            label=""
            images={serviceImages}
            inputId="service-upload"
            onUpload={() => {}} // Deshabilitado en modo vista
            onRemove={() => {}} // Deshabilitado en modo vista
            onReorder={() => {}} // Deshabilitado en modo vista
          />
          <p className="text-sm text-gray-500">
            Vista de las imágenes asociadas al servicio
          </p>
        </div>
      </form>

      {/* Notificación de error */}
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
