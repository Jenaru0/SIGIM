"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Loader2,
  Map,
  RefreshCw,
  MapPin,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { obtenerIncidencias } from "@/lib/services";
import { ESTADOS } from "@/lib/constants";
import type { Incidencia } from "@/lib/types";
import type { EstadoId } from "@/lib/constants";

// Importar mapa sin SSR (Leaflet requiere window/document)
const MapaIncidencias = dynamic(
  () => import("@/components/mapa/MapaIncidencias"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[calc(100vh-16rem)] min-h-[400px] w-full rounded-lg" />
    ),
  },
);

// Configuración de los filtros del mapa
const FILTROS_ESTADO = [
  { id: "todos" as const, label: "Todos", icon: Map },
  { id: "pendiente" as const, label: "Pendientes", icon: AlertCircle },
  { id: "en_proceso" as const, label: "En Proceso", icon: Clock },
  { id: "resuelto" as const, label: "Resueltos", icon: CheckCircle2 },
] as const;

export default function MapaPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoId | "todos">("todos");

  const cargarIncidencias = async () => {
    setLoading(true);
    try {
      const data = await obtenerIncidencias();
      setIncidencias(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar incidencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarIncidencias();
  }, []);

  // Contar incidencias con coordenadas por estado
  const conteos = {
    todos: incidencias.filter((i) => i.ubicacion.lat != null).length,
    pendiente: incidencias.filter(
      (i) => i.estado === "pendiente" && i.ubicacion.lat != null,
    ).length,
    en_proceso: incidencias.filter(
      (i) => i.estado === "en_proceso" && i.ubicacion.lat != null,
    ).length,
    resuelto: incidencias.filter(
      (i) => i.estado === "resuelto" && i.ubicacion.lat != null,
    ).length,
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mapa de Incidencias
          </h1>
          <p className="text-sm text-gray-500">
            Distribución geográfica de los reportes en Cañete
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={cargarIncidencias}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Filtros + Leyenda */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTROS_ESTADO.map((filtro) => {
          const activo = filtroEstado === filtro.id;

          return (
            <Button
              key={filtro.id}
              variant={activo ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroEstado(filtro.id)}
              className={activo ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <filtro.icon className="mr-1 h-3.5 w-3.5" />
              {filtro.label}
              <Badge
                variant="secondary"
                className="ml-1.5 rounded-full px-1.5 text-xs"
              >
                {conteos[filtro.id]}
              </Badge>
            </Button>
          );
        })}

        {/* Leyenda de colores */}
        <div className="ml-auto hidden items-center gap-3 text-xs text-gray-500 lg:flex">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
            Pendiente
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
            En Proceso
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
            Resuelto
          </span>
        </div>
      </div>

      {/* Mapa */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : incidencias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MapPin className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-400">
              No hay incidencias registradas aún
            </p>
          </CardContent>
        </Card>
      ) : (
        <MapaIncidencias
          incidencias={incidencias}
          filtroEstado={filtroEstado}
        />
      )}

      {/* Nota sobre reportes sin coordenadas */}
      {!loading && incidencias.length > conteos.todos && (
        <p className="text-xs text-gray-400">
          ⚠️ {incidencias.length - conteos.todos} incidencia(s) sin coordenadas
          no se muestran en el mapa.
        </p>
      )}
    </div>
  );
}
