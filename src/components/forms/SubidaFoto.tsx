"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { ImagePlus, X, Loader2, Camera, FolderOpen } from "lucide-react";
import { comprimirImagen } from "@/lib/helpers";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
  const [isMobile, setIsMobile] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || navigator.maxTouchPoints > 2,
      );
    };
    checkMobile();
  }, []);

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
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
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
        // Zona de selección con dos opciones
        <div className="space-y-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
          <div className={`flex gap-3 ${isMobile ? "" : "justify-center"}`}>
            {/* Botón Cámara (solo en móviles) */}
            {isMobile && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => cameraInputRef.current?.click()}
                disabled={comprimiendo}
              >
                {comprimiendo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Cámara
                  </>
                )}
              </Button>
            )}

            {/* Botón Galería/Archivos */}
            <Button
              type="button"
              variant="outline"
              className={isMobile ? "flex-1" : ""}
              onClick={() => galleryInputRef.current?.click()}
              disabled={comprimiendo}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Galería
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500">
            JPEG, PNG o WebP (máx. 10MB)
          </p>
        </div>
      )}

      {/* Input para cámara (capture="environment") */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        aria-label="Capturar foto con cámara"
      />

      {/* Input para galería (sin capture) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
        aria-label="Seleccionar imagen de galería"
      />

      <p className="text-xs text-muted-foreground">
        ✅ Las fotos con evidencia clara se atienden más rápido
      </p>
    </div>
  );
}
