"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { geocodificarInverso } from "@/lib/helpers";

interface SelectorUbicacionProps {
  direccion: string;
  onDireccionChange: (direccion: string) => void;
  onCoordenadas: (lat: number, lng: number) => void;
}

export default function SelectorUbicacion({
  direccion,
  onDireccionChange,
  onCoordenadas,
}: SelectorUbicacionProps) {
  const [obteniendo, setObteniendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }

    setObteniendo(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        onCoordenadas(latitude, longitude);
        // Geocodificación inversa para obtener nombre de calle
        onDireccionChange("Obteniendo dirección...");
        const direccion = await geocodificarInverso(latitude, longitude);
        onDireccionChange(direccion);
        setObteniendo(false);
      },
      (err) => {
        setObteniendo(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              "Permiso de ubicación denegado. Escribe la dirección manualmente.",
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              "Ubicación no disponible. Escribe la dirección manualmente.",
            );
            break;
          default:
            setError(
              "No se pudo obtener la ubicación. Escribe la dirección manualmente.",
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Ubicación del problema</label>

      {/* Botón de geolocalización */}
      <Button
        type="button"
        variant="outline"
        onClick={obtenerUbicacion}
        disabled={obteniendo}
        className="w-full"
      >
        {obteniendo ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Obteniendo ubicación...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            📍 Usar mi ubicación actual
          </>
        )}
      </Button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Input de dirección manual */}
      <div className="relative">
        <Input
          placeholder="Ej: Av. Grau 123, San Vicente de Cañete"
          value={direccion}
          onChange={(e) => onDireccionChange(e.target.value)}
          maxLength={200}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Puedes usar tu GPS o escribir la dirección. También puedes marcar en el
        mapa.
      </p>
    </div>
  );
}
