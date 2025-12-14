"use client";

import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { useState, useEffect, useRef, useCallback } from "react";
import { getCroppedBlob } from "@/lib/cropImage";
import {
    DocumentPlusIcon,
    TrashIcon,
    EyeIcon,
    ScissorsIcon,
    StarIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import {
    StarIcon as StarIconSolid,
    EllipsisVerticalIcon,
} from "@heroicons/react/24/solid";

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

export type ImageUploaderProps = {
    maxFiles?: number;
    aspect?: number;
    onChange?: (images: UploadedImage[]) => void;
    initialImages?: UploadedImage[];
    // Nueva prop para deshabilitar funcionalidad de subida manual
    disableManualUpload?: boolean;
};

export default function ImageUploader({
    maxFiles = 10,
    aspect = 1,
    onChange,
    initialImages = [],
    disableManualUpload = false,
}: ImageUploaderProps) {
    const imagePreviews = useRef<Map<string, string>>(new Map());
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Notificar cambios al padre usando useEffect
    useEffect(() => {
        if (onChange) {
            onChange(images);
        }
    }, [images, onChange, hasInitialized]);

    // Inicializar imágenes solo una vez
    useEffect(() => {
        if (!hasInitialized && initialImages.length > 0) {
            setImages(initialImages);
            setHasInitialized(true);
        }
    }, [initialImages, hasInitialized]);

    const [cropModal, setCropModal] = useState<{
        open: boolean;
        imageId?: string;
        imageSrc?: string;
        crop: { x: number; y: number };
        zoom: number;
        rotation: number;
        croppedAreaPixels?: { x: number; y: number; width: number; height: number };
    }>({
        open: false,
        crop: { x: 0, y: 0 },
        zoom: 1,
        rotation: 0,
    });

    const [previewModal, setPreviewModal] = useState<{
        open: boolean;
        imageSrc?: string;
        fileName?: string;
    }>({
        open: false,
    });

    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const createAndStorePreview = useCallback((file: File, id: string) => {
        const preview = URL.createObjectURL(file);
        const originalPreview = URL.createObjectURL(file);

        imagePreviews.current.set(`${id}_preview`, preview);
        imagePreviews.current.set(`${id}_original`, originalPreview);

        return { preview, originalPreview };
    }, []);

    const getPreview = useCallback((id: string, type = "preview") => {
        return imagePreviews.current.get(`${id}_${type}`);
    }, []);

    const onDrop = (acceptedFiles: File[]) => {
        const next = acceptedFiles
            .slice(0, maxFiles - images.length)
            .filter(file => file && file.size > 0)
            .map((file, index) => {
                const id = crypto.randomUUID();
                const { preview, originalPreview } = createAndStorePreview(file, id);

                return {
                    id,
                    file,
                    preview,
                    originalPreview,
                    status: "pending" as const,
                    isPrimary: images.length === 0 && index === 0,
                    order: images.length + index,
                    description: "",
                };
            });

        const updated = [...images, ...next];

        const primaryCount = updated.filter(img => img.isPrimary).length;
        if (primaryCount > 1) {
            updated.forEach((img, idx) => {
                img.isPrimary = idx === 0;
            });
        }

        setImages(updated);
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/*": [] },
        onDrop,
        multiple: true,
    });

    const openCrop = (img: UploadedImage) => {
        const imageToCrop = img.croppedPreview ? img.originalPreview : img.preview;

        setCropModal({
            open: true,
            imageId: img.id,
            imageSrc: imageToCrop,
            crop: { x: 0, y: 0 },
            zoom: 1,
            rotation: 0,
        });
    };

    const applyCrop = async () => {
        if (!cropModal.imageSrc || !cropModal.croppedAreaPixels || !cropModal.imageId) { return; }

        try {
            const blob = await getCroppedBlob(
                cropModal.imageSrc,
                cropModal.croppedAreaPixels,
                cropModal.rotation,
                0.92
            );

            const croppedPreview = URL.createObjectURL(blob);

            imagePreviews.current.set(`${cropModal.imageId}_cropped`, croppedPreview);

            setImages((prev) =>
                prev.map((img) =>
                    img.id === cropModal.imageId ? {
                        ...img,
                        croppedBlob: blob,
                        croppedPreview: croppedPreview,
                        preview: croppedPreview,
                        status: "cropped" as const
                    } : img
                )
            );

            setCropModal((s) => ({ ...s, open: false }));
        } catch (error) {
            console.error("Error al recortar la imagen:", error);
            setCropModal((s) => ({ ...s, open: false }));
        }
    };

    const handleRevertCrop = (id: string) => {
        setImages((prev) =>
            prev.map((img) => {
                if (img.id === id && img.croppedPreview) {
                    URL.revokeObjectURL(img.croppedPreview);
                    imagePreviews.current.delete(`${id}_cropped`);

                    const originalPreview = getPreview(id, "original");

                    return {
                        ...img,
                        croppedBlob: undefined,
                        croppedPreview: undefined,
                        preview: originalPreview || img.originalPreview,
                        status: "pending" as const
                    };
                }
                return img;
            })
        );
    };

    const handleRemove = (id: string) => {
        setImages((prev) => {
            const removedImg = prev.find(img => img.id === id);
            const updated = prev
                .filter((img) => img.id !== id)
                .map((img, idx) => ({
                    ...img,
                    order: idx,
                }));

            if (removedImg) {
                URL.revokeObjectURL(removedImg.preview);
                URL.revokeObjectURL(removedImg.originalPreview);
                if (removedImg.croppedPreview) {
                    URL.revokeObjectURL(removedImg.croppedPreview);
                }

                imagePreviews.current.delete(`${id}_preview`);
                imagePreviews.current.delete(`${id}_original`);
                imagePreviews.current.delete(`${id}_cropped`);
            }

            if (removedImg?.isPrimary && updated.length > 0) {
                updated[0].isPrimary = true;
            }

            return updated;
        });
    };

    const handleSetPrimary = (id: string) => {
        setImages((prev) =>
            prev.map((img) => ({
                ...img,
                isPrimary: img.id === id,
            }))
        );
    };

    const reorderImages = (startIndex: number, endIndex: number) => {
        if (startIndex === endIndex) { return; }

        setImages(prev => {
            const result = [...prev];
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);

            const reordered = result.map((img, idx) => ({
                ...img,
                order: idx,
            }));

            const primaryImages = reordered.filter(img => img.isPrimary);
            if (primaryImages.length > 1) {
                reordered.forEach((img, idx) => {
                    img.isPrimary = idx === 0;
                });
            }

            return reordered;
        });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        setDraggingIndex(index);
        setIsDragging(true);

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());

        e.currentTarget.classList.add("border-2", "border-dashed", "border-blue-400", "opacity-50");
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();

        if (dragItem.current === null || dragItem.current === index) { return; }

        dragOverItem.current = index;

        const items = document.querySelectorAll("[data-draggable=\"true\"]");
        items.forEach(el => {
            el.classList.remove(
                "border-t-4", "border-t-blue-500",
                "border-b-4", "border-b-blue-500",
                "pt-1", "pb-1"
            );
        });

        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const isOverTop = e.clientY < midpoint;

        if (isOverTop) {
            e.currentTarget.classList.add("border-t-4", "border-t-blue-500", "pt-1");
        } else {
            e.currentTarget.classList.add("border-b-4", "border-b-blue-500", "pb-1");
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove(
            "border-t-4", "border-t-blue-500",
            "border-b-4", "border-b-blue-500",
            "pt-1", "pb-1"
        );
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        const items = document.querySelectorAll("[data-draggable=\"true\"]");
        items.forEach(el => {
            el.classList.remove(
                "border-2", "border-dashed", "border-blue-400", "opacity-50",
                "border-t-4", "border-t-blue-500",
                "border-b-4", "border-b-blue-500",
                "pt-1", "pb-1"
            );
        });

        if (dragItem.current !== null && dragItem.current !== index) {
            let targetIndex = index;

            if (e.currentTarget.classList.contains("border-t-4")) {
                targetIndex = index;
            } else if (e.currentTarget.classList.contains("border-b-4")) {
                targetIndex = index + 1;
                if (targetIndex > images.length) { targetIndex = images.length; }
            }

            reorderImages(dragItem.current, targetIndex);
        }

        setIsDragging(false);
        setDraggingIndex(null);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDraggingIndex(null);
        dragItem.current = null;
        dragOverItem.current = null;

        const items = document.querySelectorAll("[data-draggable=\"true\"]");
        items.forEach(el => {
            el.classList.remove(
                "border-2", "border-dashed", "border-blue-400", "opacity-50",
                "border-t-4", "border-t-blue-500",
                "border-b-4", "border-b-blue-500",
                "pt-1", "pb-1"
            );
        });
    };

    const handleContainerDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const openPreview = (img: UploadedImage) => {
        const imageToShow = img.croppedPreview || img.preview;

        setPreviewModal({
            open: true,
            imageSrc: imageToShow,
            fileName: img.file?.name || img.url?.split("/").pop() || "Imagen",
        });
    };

    const updateDescription = (id: string, description: string) => {
        setImages(prev =>
            prev.map(img =>
                img.id === id ? { ...img, description } : img
            )
        );
    };

    useEffect(() => {
        return () => {
            imagePreviews.current.forEach((url, key) => {
                URL.revokeObjectURL(url);
            });
            imagePreviews.current.clear();

            images.forEach(img => {
                URL.revokeObjectURL(img.preview);
                URL.revokeObjectURL(img.originalPreview);
                if (img.croppedPreview) {
                    URL.revokeObjectURL(img.croppedPreview);
                }
            });
        };
    }, []);

    const sortedImages = [...images].sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-gradient-to-br from-gray-50/50 to-orange-50/30 hover:from-gray-50 hover:to-orange-50 transition-all duration-300 cursor-pointer hover:border-orange-400 hover:shadow-lg"
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <DocumentPlusIcon className="w-12 h-12 text-orange-500" />
                    </div>
                    <p className="text-gray-700 font-medium">
                        Arrastra y suelta las fotos para el servicio o búscalas
                    </p>
                </div>
            </div>

            {/* Lista de imágenes */}
            {images.length > 0 && (
                <div
                    className="border rounded-lg overflow-hidden shadow-sm"
                    onDragOver={handleContainerDragOver}
                >

                    <div className="divide-y divide-gray-100">
                        {sortedImages.map((img, index) => (
                            <div
                                key={`${img.id}_${img.order}`}
                                data-draggable="true"
                                data-index={index}
                                className={`relative flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-200 group ${draggingIndex === index ? "opacity-50 bg-blue-50" : ""
                                    } ${isDragging ? "cursor-move" : ""}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                            >

                                {/* Ícono de arrastre */}
                                <div
                                    className={`cursor-move transition-all duration-200 ml-6 ${isDragging && dragItem.current === index
                                        ? "text-blue-500 scale-110"
                                        : "text-gray-400 hover:text-gray-600 group-hover:scale-105"
                                        }`}
                                    title="Arrastrar para reordenar"
                                    draggable
                                    onDragStart={(e) => {
                                        e.stopPropagation();
                                        handleDragStart(e as any, index);
                                    }}
                                >
                                    <div className="flex p-0">
                                        <EllipsisVerticalIcon className="w-5 h-5 m-0 p-0 text-black-400" />
                                        <EllipsisVerticalIcon className="w-5 h-5 m-0 p-0 text-black-400" />
                                    </div>
                                </div>

                                {/* Miniatura */}
                                <div className="relative w-16 h-16 flex-shrink-0">
                                    {img.preview && (
                                        <img
                                            src={img.preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-gray-300 transition-colors"
                                            onError={(e) => {
                                                const storedPreview = getPreview(img.id, "preview");
                                                if (storedPreview && storedPreview !== img.preview) {
                                                    e.currentTarget.src = storedPreview;
                                                    return;
                                                }

                                            }}
                                        />
                                    )}
                                    {img.isPrimary && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white p-0.5 rounded-full shadow-sm">
                                            <StarIconSolid className="w-3 h-3" />
                                        </div>
                                    )}
                                    {img.status === "cropped" && (
                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full shadow-sm">
                                            <span className="text-xs">✂️</span>
                                        </div>
                                    )}
                                </div>

                                {/* Información */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <p className="font-medium text-gray-800 truncate">
                                            {img.file?.name || img.url?.split("/").pop() || "Imagen"}
                                        </p>
                                        {img.isPrimary && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 text-xs font-medium rounded-full shrink-0 border border-yellow-200">
                                                <StarIconSolid className="w-3 h-3" />
                                                Principal
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                            {(img.croppedBlob?.size || img.file?.size)
                                                ? `${((img.croppedBlob?.size || img.file?.size) / 1024 / 1024).toFixed(1)} MB`
                                                : "0 MB"}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${img.status === "pending" ? "bg-gray-100 text-gray-800" :
                                            img.status === "cropped" ? "bg-blue-100 text-blue-800" :
                                                img.status === "uploading" ? "bg-yellow-100 text-yellow-800 animate-pulse" :
                                                    img.status === "uploaded" ? "bg-green-100 text-green-800" :
                                                        "bg-red-100 text-red-800"
                                            }`}>
                                            {img.status === "pending" ? "Pendiente" :
                                                img.status === "cropped" ? "Recortada" :
                                                    img.status === "uploading" ? "Subiendo..." :
                                                        img.status === "uploaded" ? "✓ Subida" : "Error"}
                                        </span>
                                    </div>

                                    {/* Campo de descripción */}
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="Agrega una descripción para esta imagen"
                                            value={img.description || ""}
                                            className="w-full max-w-md px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                                            onChange={(e) => updateDescription(img.id, e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {/* Botón para marcar como principal */}
                                    <button
                                        type="button"
                                        onClick={() => handleSetPrimary(img.id)}
                                        className={`p-2 rounded-lg transition-all duration-200 ${img.isPrimary
                                            ? "text-black-500 bg-yellow-50 hover:bg-yellow-100"
                                            : "text-black-500 hover:text-yellow-500 hover:bg-yellow-50"
                                            }`}
                                        title={img.isPrimary ? "Imagen principal" : "Marcar como principal"}
                                    >
                                        {img.isPrimary ? (
                                            <StarIconSolid className="w-5 h-5" />
                                        ) : (
                                            <StarIcon className="w-5 h-5" />
                                        )}
                                    </button>

                                    {/* Botón de vista previa */}
                                    <button
                                        type="button"
                                        onClick={() => openPreview(img)}
                                        className="p-2 text-black-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                        title="Ver imagen"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>

                                    {/* Botón de recortar */}
                                    <button
                                        type="button"
                                        onClick={() => openCrop(img)}
                                        className="p-2 text-black-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                                        title="Recortar imagen"
                                    >
                                        <ScissorsIcon className="w-5 h-5" />
                                    </button>

                                    {/* Botón para revertir recorte */}
                                    {img.status === "cropped" && (
                                        <button
                                            type="button"
                                            onClick={() => handleRevertCrop(img.id)}
                                            className="p-2 text-black-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                            title="Revertir recorte"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Botón de eliminar */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(img.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                        title="Quitar imagen"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Indicador de arrastre */}
                    {isDragging && (
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200">
                            <p className="text-sm text-blue-700 flex items-center gap-2 animate-pulse">
                                <EllipsisVerticalIcon className="w-4 h-4" />
                                <span className="font-medium">Suelta para reordenar las imágenes</span>
                                <span className="text-xs text-blue-600 bg-blue-200 px-2 py-0.5 rounded">
                                    {draggingIndex !== null ? `Moviendo imagen #${draggingIndex + 1}` : "Arrastrando..."}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de vista previa */}
            {previewModal.open && previewModal.imageSrc && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
                        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <EyeIcon className="w-6 h-6 text-blue-500" />
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">
                                        {previewModal.fileName}
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
                                <XMarkIcon className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
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
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    Haz clic fuera de la imagen o presiona ESC para cerrar
                                </p>
                                <div className="flex gap-2">
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
                </div>
            )}

            {/* Modal de recorte */}
            {cropModal.open && cropModal.imageSrc && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 space-y-4 border border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="font-semibold text-lg text-gray-800">Recortar imagen</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCropModal((s) => ({ ...s, open: false }))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
                            </button>
                        </div>

                        <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden border border-gray-300">
                            <Cropper
                                image={cropModal.imageSrc}
                                crop={cropModal.crop}
                                zoom={cropModal.zoom}
                                rotation={cropModal.rotation}
                                aspect={aspect}
                                onCropChange={(crop) => setCropModal((s) => ({ ...s, crop }))}
                                onZoomChange={(zoom) => setCropModal((s) => ({ ...s, zoom }))}
                                onRotationChange={(rotation) =>
                                    setCropModal((s) => ({ ...s, rotation }))
                                }
                                onCropComplete={(_, croppedAreaPixels) =>
                                    setCropModal((s) => ({ ...s, croppedAreaPixels }))
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Arrastra para ajustar el recorte • Usa la rueda del mouse para hacer zoom
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm bg-gray-100 px-3 py-1 rounded">
                                        <span className="font-medium">Zoom:</span> {cropModal.zoom.toFixed(1)}x
                                    </div>
                                    <div className="text-sm bg-gray-100 px-3 py-1 rounded">
                                        <span className="font-medium">Rotación:</span> {cropModal.rotation}°
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setCropModal((s) => ({ ...s, open: false }))}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={applyCrop}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
                                >
                                    Aplicar recorte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}