"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Notification } from "@/components/ui/Notification";
import ImageUploader, {
  SortableImageLocal,
} from "@/components/features/services/ImageUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import {
  Banner,
  CreateBanner,
  CreateService,
  CreateServiceImage,
  ServiceCategoryInfo,
} from "@vitalfit/sdk";

const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3ltfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000";

interface CreateServiceFormProps {
  onBack: () => void;
}

export default function CreateServiceForm({ onBack }: CreateServiceFormProps) {
  const [bannerImages, setBannerImages] = useState<Banner[]>([]);
  const [localBanners, setLocalBanners] = useState<SortableImageLocal[]>([]);
  const [serviceImages, setServiceImages] = useState<CreateServiceImage[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [localServiceImages, setLocalServiceImages] = useState<
    SortableImageLocal[]
  >([]);
  const [availableBanners, setAvailableBanners] = useState<Banner[]>([]);

  const [categories, setCategories] = useState<ServiceCategoryInfo[]>([]);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: "",
    priority: "",
    featured: "",
    selectedBannerId: "",
    serviceImages: [] as File[],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!token) {
          return;
        }
        const response = await api.products.getCategories(token);
        console.log("Categorías:", response.data);
        setCategories(response.data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    const fetchBanners = async () => {
      if (!token) {
        return;
      }
      try {
        const bannerRes = await api.marketing.getBanner(token);
        setAvailableBanners(
          bannerRes.data.map((b: any) => ({
            banner_id: b.banner_id,
            name: b.name || "Sin nombre",
            image_url: b.image_url || "",
          })),
        );
      } catch (err) {
        console.error("Error cargando banners:", err);
      }
    };
    fetchBanners();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        throw new Error("Usuario no autenticado");
      }

      let banner_id = formData.selectedBannerId;
      if (!banner_id && localBanners.length > 0) {
        const firstLocalBanner = localBanners[0];

        // 🚨 Subir archivo de banner y obtener URL (REQUERIDO) 🚨
        let newBannerImageUrl = firstLocalBanner.imageUrl || ""; // Asume que la URL ya existe o usa la URL temporal

        if (firstLocalBanner.file) {
          // Aquí DEBE ir tu llamada a la API para subir firstLocalBanner.file y obtener la URL final.
          console.warn("Simulando subida de archivo para nuevo banner.");
          newBannerImageUrl = URL.createObjectURL(firstLocalBanner.file); // PLACHOLDER
        }

        if (newBannerImageUrl) {
          const bannerData: CreateBanner = {
            name: formData.name,
            image_url: newBannerImageUrl,
            link_url: "",
            is_active: true,
          };

          const newBanner = await api.marketing.createBanners(
            bannerData,
            token,
          );
        }
      }

      const service_images = serviceImages.map((img, index) => ({
        image_url: DEFAULT_IMAGE_URL,
        alt_text: img.alt_text || "",
        display_order: index,
        is_primary: index === 0,
      }));

      const priorityMap: { [key: string]: number } = {
        Alta: 3,
        Media: 2,
        Baja: 1,
      };

      const apiPayload: CreateService = {
        banner_id: banner_id, // Usará el del Select O el recién creado
        category_id: formData.category,
        description: formData.description,
        duration: parseInt(formData.duration, 10),
        is_featured: formData.featured === "1",
        name: formData.name,
        priority: priorityMap[formData.priority] || 2,
        service_images,
      };

      const data = await api.products.createService(apiPayload, token);
      console.log("Servicio creado:", data);

      setShowNotification(true);
      setTimeout(() => onBack(), 1000);
    } catch (err: any) {
      console.error("Error creando servicio:", err);
      alert("Error al crear servicio: " + (err?.message || String(err)));
    }
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
            placeholder="Escribe una descripcion aqui..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (Minutos) *</Label>
            <Input
              id="duration"
              className="bg-white"
              placeholder="Duración en minutos"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad *</Label>
            <Select
              value={formData.priority || "Media"}
              onValueChange={(val) =>
                setFormData({ ...formData, priority: val })
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
            value={formData.featured || "0"}
            onValueChange={(val) => setFormData({ ...formData, featured: val })}
          >
            <SelectTrigger id="featured" className="mt-1 w-full">
              <SelectValue placeholder="Selecciona un Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No</SelectItem>
              <SelectItem value="1">Sí</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bannerImages">Banner del servicio</Label>
          <Select
            value={formData.selectedBannerId}
            onValueChange={(value) =>
              setFormData({ ...formData, selectedBannerId: value })
            }
          >
            <SelectTrigger id="bannerSelect" className="mt-1 w-full">
              <SelectValue placeholder="Selecciona un banner existente" />
            </SelectTrigger>
            <SelectContent>
              {availableBanners.map((b) => (
                <SelectItem key={b.banner_id} value={b.banner_id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ImageUploader
          label="Banner del servicio"
          images={localBanners}
          inputId="banner-upload"
          onUpload={(newFiles) =>
            setLocalBanners([...localBanners, ...newFiles])
          }
          onRemove={(id) =>
            setLocalBanners(localBanners.filter((img) => img.id !== id))
          }
          onReorder={setLocalBanners}
        />

        <ImageUploader
          label="Imágenes del servicio"
          images={localServiceImages}
          inputId="service-upload"
          onUpload={(newFiles) =>
            setLocalServiceImages([...localServiceImages, ...newFiles])
          }
          onRemove={(id) =>
            setLocalServiceImages(
              localServiceImages.filter((img) => img.id !== id),
            )
          }
          onReorder={setLocalServiceImages}
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
