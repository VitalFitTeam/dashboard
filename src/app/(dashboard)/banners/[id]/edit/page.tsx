"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Notification } from "@/components/ui/Notification";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import { useRouter, useParams } from "next/navigation";
import type { Banner } from "@vitalfit/sdk";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui/PageHeader";

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB;

const DEFAULT_BANNER_IMAGE =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjNmMyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYW5uZXI8L3RleHQ+Cjwvc3ZnPg==";

export default function EditBannerPage() {
    const router = useRouter();
    const params = useParams();
    const { token } = useAuth();

    const [banner, setBanner] = useState<Banner | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState({
        visible: false,
        message: "",
    });

    const [bannerImage, setBannerImage] = useState<string>("");
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        link_url: "",
        is_active: true,
    });

    const [formErrors, setFormErrors] = useState<{
        name?: string;
        link_url?: string;
    }>({});

    useEffect(() => {
        const loadBanner = async () => {
            if (!token || !params.id) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.marketing.getBanner(token);
                const banners = response.data || [];
                const foundBanner = banners.find((b: Banner) => {
                    return b.banner_id === params.id;
                });

                if (foundBanner) {
                    setBanner(foundBanner);
                    setFormData({
                        name: foundBanner.name || "",
                        link_url: foundBanner.link_url || "",
                        is_active: foundBanner.is_active ?? true,
                    });
                    setBannerImage(foundBanner.image_url || "");
                } else {
                    router.replace("/banners");
                }
            } catch (error) {
                console.error("Error cargando banner:", error);
                router.replace("/banners");
            } finally {
                setLoading(false);
            }
        };

        loadBanner();
    }, [token, params.id, router]);

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
                }
            );

            if (!response.ok) {
                console.warn(`Error ${response.status}: No se pudo subir la imagen`);
            }

            const data = await response.json();

            if (data.success) {
                return data.data.url;
            } else {
                throw new Error(
                    data.error?.message || "Error desconocido al subir imagen"
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
        const errors: { name?: string; link_url?: string } = {};

        if (!formData.name.trim()) {
            errors.name = "El nombre es obligatorio";
        }

        if (!formData.link_url.trim()) {
            errors.link_url = "La URL del sitio es obligatoria";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !banner) {
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

        if (!bannerImage) {
            setShowError({
                visible: true,
                message: "Por favor, sube una imagen para el banner.",
            });
            return;
        }

        setIsSubmitting(true);
        setShowError({ visible: false, message: "" });

        try {
            await api.marketing.updateBanner(
                banner.banner_id || "",
                {
                    name: formData.name,
                    image_url: bannerImage,
                    link_url: formData.link_url,
                    is_active: formData.is_active,
                },
                token
            );

            setShowSuccess(true);
            setTimeout(() => {
                router.replace("/banners");
            }, 1500);
        } catch (error) {
            console.error("Error al actualizar banner:", error);
            setShowError({
                visible: true,
                message:
                    error instanceof Error
                        ? error.message
                        : "Error desconocido al actualizar el banner",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBannerUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        try {
            const imageUrl = await uploadToImgBB(file);
            setBannerImage(imageUrl);
            setFormData((prev) => ({ ...prev, link_url: imageUrl }));
        } catch (error) {
            console.error("Error subiendo banner:", error);
            setShowError({
                visible: true,
                message: "Error al subir el banner. Se usará una imagen por defecto.",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="text-center">Cargando datos...</div>
            </div>
        );
    }

    if (!banner) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="text-center">Banner no encontrado</div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <PageHeader
                title="Banners"
                subtitle="Completa la información para gestionar un banner"
            />

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            placeholder="Banner principal Verano"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (formErrors.name) {
                                    setFormErrors({ ...formErrors, name: undefined });
                                }
                            }}
                            className={`bg-white ${formErrors.name ? "border-red-500" : ""}`}
                            required
                        />
                        {formErrors.name && (
                            <p className="text-red-500 text-sm">{formErrors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link_url">URL imagen *</Label>
                        <Input
                            id="link_url"
                            placeholder="http://ejemploURL.com"
                            value={formData.link_url}
                            onChange={(e) => {
                                setFormData({ ...formData, link_url: e.target.value });
                                if (formErrors.link_url) {
                                    setFormErrors({ ...formErrors, link_url: undefined });
                                }
                            }}
                            className={`bg-white ${formErrors.link_url ? "border-red-500" : ""}`}
                            required
                            disabled
                        />
                        {formErrors.link_url && (
                            <p className="text-red-500 text-sm">{formErrors.link_url}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Label htmlFor="is_active">Estado(Activo/Inactivo)</Label>
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => {
                                setFormData({ ...formData, is_active: checked });
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>URL Carga de Imagen *</Label>

                    {bannerImage ? (
                        <div className="border-2 border-orange-300 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <img
                                        src={bannerImage}
                                        alt="Banner preview"
                                        className="w-full h-48 rounded border object-cover"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        id="banner-upload-edit"
                                        accept="image/*"
                                        onChange={handleBannerUpload}
                                        className="hidden"
                                    />
                                    <label htmlFor="banner-upload-edit">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                document.getElementById("banner-upload-edit")?.click();
                                            }}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                />
                                            </svg>
                                            Editar
                                        </Button>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-orange-300 rounded-lg p-12 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                id="banner-upload"
                                accept="image/*"
                                onChange={handleBannerUpload}
                                className="hidden"
                            />
                            <label htmlFor="banner-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-white"
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
                                    <div>
                                        <p className="text-lg font-medium hover:text-orange-600">
                                            {uploading
                                                ? "Subiendo..."
                                                : "Haz clic para subir tu imagen y"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Formato permitido:PNG,JPG,JPEG hasta 10MB
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            router.replace("/banners");
                        }}

                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={isSubmitting || uploading}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </form>

            {showSuccess && (
                <Notification
                    variant="success"
                    description="¡Banner actualizado exitosamente!"
                    onClose={() => {
                        setShowSuccess(false);
                    }}
                />
            )}
            {showError.visible && (
                <Notification
                    variant="destructive"
                    title="Error al actualizar banner"
                    description={showError.message}
                    onClose={() => {
                        setShowError({ visible: false, message: "" });
                    }}
                />
            )}
        </div>
    );
}
