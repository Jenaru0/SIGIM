"use client";

import { useState } from "react";
import { Search, Loader2, MapPin, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buscarPorTicket } from "@/lib/services";
import { ESTADOS, CATEGORIAS } from "@/lib/constants";
import { formatearFecha } from "@/lib/helpers";
import type { Incidencia } from "@/lib/types";
import Image from "next/image";

export default function SeguimientoPage() {
  const [codigo, setCodigo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [incidencia, setIncidencia] = useState<Incidencia | null>(null);
  const [buscado, setBuscado] = useState(false);

  const buscar = async () => {
    const codigoLimpio = codigo.trim().toUpperCase();

    if (!codigoLimpio) {
      toast.error("Ingresa tu código de ticket");
      return;
    }

    // Validar formato CN-XXXX
    if (!/^CN-\d{4}$/.test(codigoLimpio)) {
      toast.error("El formato del código es CN-XXXX (ej: CN-4502)");
      return;
    }

    setBuscando(true);
    setBuscado(true);

    try {
      const resultado = await buscarPorTicket(codigoLimpio);
      setIncidencia(resultado);
      if (!resultado) {
        toast.error("No se encontró ningún reporte con ese código");
      }
    } catch (error) {
      console.error("Error al buscar:", error);
      toast.error("Error al buscar. Intenta nuevamente.");
    } finally {
      setBuscando(false);
    }
  };

  const categoria = incidencia
    ? CATEGORIAS.find((c) => c.id === incidencia.categoria)
    : null;
  const estado = incidencia ? ESTADOS[incidencia.estado] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Seguimiento de Reporte
          </h1>
          <p className="mt-2 text-gray-600">
            Ingresa tu código de ticket para ver el estado de tu incidencia
          </p>
        </div>

        {/* Buscador */}
        <Card className="mx-auto max-w-md">
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                placeholder="Ej: CN-4502"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                maxLength={7}
                className="text-center text-lg font-mono tracking-wider"
              />
              <Button onClick={buscar} disabled={buscando}>
                {buscando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {incidencia && estado && categoria && (
          <Card className="mx-auto mt-6 max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Ticket: {incidencia.ticketId}
                </CardTitle>
                <Badge className={estado.color}>{estado.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info básica */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Tag className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Categoría</p>
                    <p className="text-sm font-medium">
                      {categoria.icono} {categoria.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Ubicación</p>
                    <p className="text-sm">
                      {incidencia.ubicacion.direccionTexto}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha de reporte</p>
                    <p className="text-sm">
                      {incidencia.creadoEn?.toDate
                        ? formatearFecha(incidencia.creadoEn.toDate())
                        : "Sin fecha"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Descripción */}
              <div>
                <p className="text-xs text-gray-500">Descripción</p>
                <p className="mt-1 text-sm text-gray-700">
                  {incidencia.descripcion}
                </p>
              </div>

              {/* Foto evidencia */}
              {incidencia.fotoEvidenciaURL && (
                <div>
                  <p className="mb-2 text-xs text-gray-500">
                    Foto del problema
                  </p>
                  <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image
                      src={incidencia.fotoEvidenciaURL}
                      alt="Evidencia"
                      fill
                      sizes="(max-width: 640px) 100vw, 512px"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Foto solución (si está resuelto) */}
              {incidencia.estado === "resuelto" &&
                incidencia.fotoSolucionURL && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-xs text-green-600 font-medium">
                        ✅ Foto de la solución
                      </p>
                      <div className="relative h-48 w-full overflow-hidden rounded-lg">
                        <Image
                          src={incidencia.fotoSolucionURL}
                          alt="Solución"
                          fill
                          sizes="(max-width: 640px) 100vw, 512px"
                          className="object-cover"
                        />
                      </div>
                      {incidencia.comentarioResolucion && (
                        <p className="mt-2 text-sm text-gray-600">
                          {incidencia.comentarioResolucion}
                        </p>
                      )}
                    </div>
                  </>
                )}

              {/* Timeline de estados */}
              <Separator />
              <div>
                <p className="mb-3 text-xs text-gray-500">Progreso</p>
                <div className="flex items-center justify-between">
                  {(["pendiente", "en_proceso", "resuelto"] as const).map(
                    (est, i) => {
                      const estadoConfig = ESTADOS[est];
                      const estados = ["pendiente", "en_proceso", "resuelto"];
                      const actual = estados.indexOf(incidencia.estado);
                      const estaActivo = i <= actual;

                      return (
                        <div
                          key={est}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${
                              estaActivo ? estadoConfig.dotColor : "bg-gray-200"
                            }`}
                          />
                          <span
                            className={`text-xs ${
                              estaActivo
                                ? "font-medium text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {estadoConfig.label}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between px-1.5">
                  <div className="h-0.5 w-full bg-gray-200">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width:
                          incidencia.estado === "pendiente"
                            ? "0%"
                            : incidencia.estado === "en_proceso"
                              ? "50%"
                              : "100%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No encontrado */}
        {buscado && !buscando && !incidencia && (
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              No se encontró ningún reporte con ese código.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Verifica que el código sea correcto (formato: CN-XXXX)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
