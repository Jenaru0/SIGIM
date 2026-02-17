"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Importar el mapa SIN SSR (Leaflet necesita window/document)
const MapaReporte = dynamic(() => import("./MapaReporte"), {
  ssr: false,
  loading: () => (
    <div className="space-y-2">
      <Skeleton className="h-64 w-full rounded-lg md:h-80" />
      <p className="text-xs text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
});

export default MapaReporte;
