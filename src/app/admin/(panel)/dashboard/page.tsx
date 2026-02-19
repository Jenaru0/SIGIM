"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerIncidencias } from "@/lib/services";
import { CATEGORIAS } from "@/lib/constants";
import type { Incidencia } from "@/lib/types";

export default function DashboardPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerIncidencias();
        setIncidencias(data);
      } catch (error) {
        console.error("Error al cargar incidencias:", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const total = incidencias.length;
  const pendientes = incidencias.filter((i) => i.estado === "pendiente").length;
  const enProceso = incidencias.filter((i) => i.estado === "en_proceso").length;
  const resueltos = incidencias.filter((i) => i.estado === "resuelto").length;

  const porCategoria = CATEGORIAS.map((cat) => ({
    ...cat,
    cantidad: incidencias.filter((i) => i.categoria === cat.id).length,
  }));

  // Mostrar pantalla vacía si no hay reportes
  if (total === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Resumen general de incidencias reportadas
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16">
          <FileText className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-600">
            Sin reportes aún
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Los ciudadanos comenzarán a reportar incidencias pronto. Aquí verás
            las estadísticas en tiempo real.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Resumen general de incidencias reportadas
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Reportes
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Pendientes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{pendientes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              En Proceso
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{enProceso}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Resueltos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{resueltos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Por categoría */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Incidencias por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {porCategoria.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <span className="text-2xl">{cat.icono}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.label}</span>
                    <span className="text-sm text-gray-500">
                      {cat.cantidad}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width:
                          total > 0 ? `${(cat.cantidad / total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Últimos reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos 5 Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          {incidencias.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No hay incidencias reportadas aún
            </p>
          ) : (
            <div className="space-y-3">
              {incidencias.slice(0, 5).map((inc) => {
                const cat = CATEGORIAS.find((c) => c.id === inc.categoria);
                return (
                  <div
                    key={inc.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="text-xl">{cat?.icono}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {inc.ticketId} — {inc.descripcion}
                      </p>
                      <p className="text-xs text-gray-500">
                        {inc.ubicacion.direccionTexto}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        inc.estado === "pendiente"
                          ? "bg-red-100 text-red-700"
                          : inc.estado === "en_proceso"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {inc.estado === "pendiente"
                        ? "Pendiente"
                        : inc.estado === "en_proceso"
                          ? "En Proceso"
                          : "Resuelto"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
