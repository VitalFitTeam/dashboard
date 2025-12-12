"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Notification } from "@/components/ui/Notification";
import ImageUploader from "@/components/modules/services/ImageUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { Service, SortableImage } from "@/models/service";
import { ServicesData } from "./data";

interface EditServiceFormProps {
  service: Service & {
    featured?: boolean;
    imagePaths?: string[];
  };
  onBack: () => void;
}

export default function EditServiceForm({
  service,
  onBack,
}: EditServiceFormProps) {
  type ServiceFormData = {
    name: string;
    description: string;
    category: string;
    duration: string;
    priority: string;
    featured: string;
    bannerImages: File[];
    serviceImages: File[];
  };

  const [bannerImages, setBannerImages] = useState<SortableImage[]>([]);
  const [serviceImages, setServiceImages] = useState<SortableImage[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: service.name || "",
    description: "",
    category: service.categoryId || "",
    duration: service.durationMinutes?.toString() || "",
    priority: "Media",
    featured: service.featured ? "1" : "0",
    bannerImages: [],
    serviceImages: [],
  });

  const uniqueCategories = Array.from(
    new Set(ServicesData.map((s) => s.categoryId)),
  );

  useEffect(() => {
    if (service.imagePaths) {
      const preloadImages: SortableImage[] = service.imagePaths.map(
        (path, index) => ({
          id: `static-${index}`,
          file: new File([], path),
          description: "",
          previewUrl: path,
        }),
      );
      setBannerImages(preloadImages);
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNotification(true);
    // Aquí podrías enviar los datos al backend
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          MODIFICAR SERVICIO
        </h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Complete los siguientes campos para editar el servicio
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Introduce el nombre del servicio"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría del Servicio *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger id="category" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
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
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (Minutos) *</Label>
            <Input
              id="duration"
              className="bg-white"
              placeholder="Ej. 60"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad del Servicio *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger id="priority" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona una prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured">Destacado</Label>
          <Select
            value={formData.featured}
            onValueChange={(value) =>
              setFormData({ ...formData, featured: value })
            }
          >
            <SelectTrigger id="featured" className="mt-1 w-full">
              <SelectValue placeholder="¿Está destacado?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Sí</SelectItem>
              <SelectItem value="0">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ImageUploader
          label="Banner del servicio"
          images={bannerImages}
          inputId="banner-upload"
          onUpload={(newFiles) =>
            setBannerImages((prev) => [...prev, ...newFiles])
          }
          onRemove={(id) =>
            setBannerImages((prev) => prev.filter((img) => img.id !== id))
          }
          onReorder={(newOrder) => setBannerImages(newOrder)}
        />

        <ImageUploader
          label="Imágenes del servicio"
          images={serviceImages}
          inputId="service-upload"
          onUpload={(newFiles) =>
            setServiceImages((prev) => [...prev, ...newFiles])
          }
          onRemove={(id) =>
            setServiceImages((prev) => prev.filter((img) => img.id !== id))
          }
          onReorder={(newOrder) => setServiceImages(newOrder)}
        />

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-primary hover:bg-orange-600 text-white my-4 px-8"
          >
            Guardar Cambios
          </Button>
        </div>

        {showNotification && (
          <Notification
            variant="success"
            title="¡Servicio modificado exitosamente!"
            description=""
            onClose={() => setShowNotification(false)}
          />
        )}
      </form>
    </div>
  );
}
