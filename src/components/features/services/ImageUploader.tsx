import { useRef } from "react";
import { ReactSortable } from "react-sortablejs";
import { SortableImage } from "@/models/service";
import {
  EyeIcon,
  TrashIcon,
  DocumentPlusIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

interface UploadableImage extends SortableImage {
  url?: string;
}

interface ImageUploaderProps {
  label: string;
  images: UploadableImage[];
  onUpload: (files: UploadableImage[]) => void;
  onRemove: (id: string) => void;
  onReorder: (newOrder: UploadableImage[]) => void;
  inputId: string;
}

export default function ImageUploader({
  label,
  images,
  onUpload,
  onRemove,
  onReorder,
  inputId,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {return;}
    const newImages: UploadableImage[] = Array.from(e.target.files).map(
      (file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        description: "",
        url: URL.createObjectURL(file), // solo preview local
      }),
    );
    onUpload(newImages);
  };

  const handleDescriptionChange = (id: string, value: string) => {
    const updated = images.map((img) =>
      img.id === id ? { ...img, description: value } : img,
    );
    onReorder(updated);
  };

  return (
    <div className="bg-white p-4 rounded border border-gray space-y-4">
      <h6 className="py-2 font-bold">{label}</h6>

      <div
        className="border-2 border-dashed border-orange-300 rounded-lg p-16 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors w-1/2 mx-auto cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <DocumentPlusIcon className="h-12 w-12 text-orange-500" />
          <span className="hover:text-orange-600">
            Arrastra y suelta las fotos
            <br />o haz clic para buscarlas
          </span>
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFiles}
        />
      </div>

      {images.length > 0 && (
        <ReactSortable
          list={images}
          setList={onReorder}
          className="flex flex-col gap-4"
        >
          {images.map(({ id, file, description, url }, index) => (
            <div
              key={id}
              className="border rounded-lg p-4 bg-gray-50 space-y-2"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex p-0">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </div>

                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />

                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(url, "_blank")}
                    className="rounded-full p-1"
                  >
                    <EyeIcon className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(id)}
                    className="rounded-full p-1"
                  >
                    <TrashIcon className="h-6 w-6 text-red-500" />
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Agrega una descripción para esta imagen"
                value={description}
                onChange={(e) => handleDescriptionChange(id, e.target.value)}
                className="w-full mt-2 px-3 py-2 text-sm border rounded bg-white"
              />
            </div>
          ))}
        </ReactSortable>
      )}
    </div>
  );
}
