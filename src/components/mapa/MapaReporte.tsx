"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { CANETE_CENTER } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

// Fix para el ícono del marker de Leaflet (bug conocido con bundlers)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapaReporteProps {
  onUbicacionSeleccionada: (lat: number, lng: number) => void;
  latInicial?: number | null;
  lngInicial?: number | null;
}

// Componente interno para manejar clicks en el mapa
function MapClickHandler({
  onUbicacionSeleccionada,
}: {
  onUbicacionSeleccionada: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onUbicacionSeleccionada(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapaReporte({
  onUbicacionSeleccionada,
  latInicial,
  lngInicial,
}: MapaReporteProps) {
  const [posicion, setPosicion] = useState<[number, number] | null>(
    latInicial && lngInicial ? [latInicial, lngInicial] : null,
  );

  const handleClick = (lat: number, lng: number) => {
    setPosicion([lat, lng]);
    onUbicacionSeleccionada(lat, lng);
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border">
        <MapContainer
          center={[CANETE_CENTER.lat, CANETE_CENTER.lng]}
          zoom={14}
          scrollWheelZoom={true}
          className="h-64 w-full md:h-80"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onUbicacionSeleccionada={handleClick} />
          {posicion && <Marker position={posicion} icon={markerIcon} />}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        📍 Toca el mapa para marcar la ubicación exacta del problema
      </p>
    </div>
  );
}
