"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { CANETE_CENTER, CATEGORIAS, ESTADOS } from "@/lib/constants";
import type { Incidencia } from "@/lib/types";
import type { EstadoId } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

// ==============================================
// Íconos de marcador coloreados por estado
// ==============================================

const MARKER_COLORS: Record<EstadoId, string> = {
  pendiente: "red",
  en_proceso: "gold",
  resuelto: "green",
};

function crearIconoMarcador(estado: EstadoId): L.DivIcon {
  const color = MARKER_COLORS[estado];
  return L.divIcon({
    className: "sigim-marker",
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 24 36">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" 
              fill="${color}" stroke="#333" stroke-width="1"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    `,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

const iconosPorEstado: Record<EstadoId, L.DivIcon> = {
  pendiente: crearIconoMarcador("pendiente"),
  en_proceso: crearIconoMarcador("en_proceso"),
  resuelto: crearIconoMarcador("resuelto"),
};

// ==============================================
// Componente principal
// ==============================================

interface MapaIncidenciasProps {
  incidencias: Incidencia[];
  filtroEstado: EstadoId | "todos";
}

export default function MapaIncidencias({
  incidencias,
  filtroEstado,
}: MapaIncidenciasProps) {
  // Filtrar incidencias con coordenadas válidas y por estado
  const marcadores = useMemo(() => {
    return incidencias.filter((inc) => {
      const tieneCoordenadas =
        inc.ubicacion.lat != null && inc.ubicacion.lng != null;
      const cumpleFiltro =
        filtroEstado === "todos" || inc.estado === filtroEstado;
      return tieneCoordenadas && cumpleFiltro;
    });
  }, [incidencias, filtroEstado]);

  return (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      <MapContainer
        center={[CANETE_CENTER.lat, CANETE_CENTER.lng]}
        zoom={14}
        scrollWheelZoom={true}
        className="h-[calc(100vh-16rem)] min-h-[400px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {marcadores.map((inc) => {
          const cat = CATEGORIAS.find((c) => c.id === inc.categoria);
          const estado = ESTADOS[inc.estado];

          return (
            <Marker
              key={inc.id}
              position={[inc.ubicacion.lat!, inc.ubicacion.lng!]}
              icon={iconosPorEstado[inc.estado]}
            >
              <Popup maxWidth={280} minWidth={200}>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {inc.ticketId}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${estado.color}`}
                    >
                      {estado.label}
                    </span>
                  </div>

                  <p className="font-medium">
                    {cat?.icono} {cat?.label}
                  </p>

                  <p className="line-clamp-3 text-gray-600">
                    {inc.descripcion}
                  </p>

                  <p className="text-xs text-gray-500">
                    📍 {inc.ubicacion.direccionTexto}
                  </p>

                  {inc.creadoEn?.toDate && (
                    <p className="text-xs text-gray-400">
                      {inc.creadoEn.toDate().toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
