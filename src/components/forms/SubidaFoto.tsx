"use client";

import { useCallback, useState, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { comprimirImagen } from "@/lib/helpers";
import Image from "next/image";

interface SubidaFotoProps {
  onFotoSeleccionada: (file: File | null) => void;
  label?: string;
}

export default function SubidaFoto({
  onFotoSeleccionada,
  label = "Foto de evidencia",
}: SubidaFotoProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [comprimiendo, setComprimiendo] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleArchivo = useCallback(
    async (file: File) => {
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten imágenes (JPEG, PNG, WebP)");
        return;
      }

      // Validar tamaño máximo antes de comprimir (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("La imagen es demasiado grande. Máximo 10MB.");
        return;
      }

      setComprimiendo(true);
      setNombreArchivo(file.name);

      try {
        // Comprimir imagen
        const comprimida = await comprimirImagen(file);

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(comprimida);

        onFotoSeleccionada(comprimida);
      } catch {
        alert("Error al procesar la imagen. Intenta con otra.");
      } finally {
        setComprimiendo(false);
      }
    },
    [onFotoSeleccionada],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleArchivo(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleArchivo(file);
  };

  const limpiar = () => {
    setPreview(null);
    setNombreArchivo("");
    onFotoSeleccionada(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {preview ? (
        // Vista previa de la foto
        <div className="relative overflow-hidden rounded-lg border">
          <div className="relative h-48 w-full">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
          <div className="flex items-center justify-between bg-gray-50 px-3 py-2">
            <span className="truncate text-xs text-gray-600">
              {nombreArchivo}
            </span>
            <button
              type="button"
              onClick={limpiar}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
              Quitar
            </button>
          </div>
        </div>
      ) : (
        // Zona de drop / selección
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          {comprimiendo ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">
                Comprimiendo imagen...
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-gray-400" />
              <div className="text-center">
                <span className="text-sm font-medium text-blue-600">
                  Toca para tomar o seleccionar foto
                </span>
                <p className="mt-1 text-xs text-gray-500">
                  JPEG, PNG o WebP (máx. 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        ✅ Las fotos con evidencia clara se atienden más rápido
      </p>
    </div>
  );
}
