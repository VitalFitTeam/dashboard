"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Notification } from "@/components/ui/Notification";
import ImageUploader from "@/components/features/services/ImageUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { SortableImage } from "@/models/service";
import { useState } from "react";

interface CreateServiceFormProps {
  onBack: () => void;
}

export default function CreateServiceForm({ onBack }: CreateServiceFormProps) {
  const [bannerImages, setBannerImages] = useState<SortableImage[]>([]);
  const [serviceImages, setServiceImages] = useState<SortableImage[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: "",
    priority: "",
    featured: "",
    bannerImages: [] as File[],
    serviceImages: [] as File[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNotification(true);
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
          CREAR NUEVO SERVICIO
        </h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Complete los siguientes campos para crear un nuevo servicio
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
            <Select value={formData.category || "0"}>
              <SelectTrigger id="category" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona un Item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Selecciona un Item</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción *</Label>
          <Textarea placeholder="Escribe una descripcion aqui..."></Textarea>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (Minutos) *</Label>
            <Input
              id="duration"
              className="bg-white"
              placeholder="Introduce el barrio"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Categoría del Servicio *</Label>
            <Select value={formData.priority || "0"}>
              <SelectTrigger id="priority" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona un Item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Selecciona un Item</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured">Destacado</Label>
          <Select value={formData.featured || "0"}>
            <SelectTrigger id="featured" className="mt-1 w-full">
              <SelectValue placeholder="Selecciona un Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Selecciona un Item</SelectItem>
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
            Crear
          </Button>
        </div>
        {showNotification && (
          <Notification
            variant="success"
            title="¡Servicio creado exitosamente!"
            description=""
            onClose={() => setShowNotification(false)}
          />
        )}
      </form>
    </div>
  );
}
