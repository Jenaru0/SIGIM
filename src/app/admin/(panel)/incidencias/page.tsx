"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  ArrowRightLeft,
  Camera,
  MapPin,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import SubidaFoto from "@/components/forms/SubidaFoto";
import {
  obtenerIncidencias,
  actualizarEstado,
  resolverIncidencia,
} from "@/lib/services";
import { useAuth } from "@/components/auth/AuthProvider";
import { ESTADOS, CATEGORIAS } from "@/lib/constants";
import { formatearFecha } from "@/lib/helpers";
import type { Incidencia } from "@/lib/types";
import type { EstadoId } from "@/lib/constants";
import Image from "next/image";

export default function IncidenciasPage() {
  const { user } = useAuth();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabActual, setTabActual] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");

  // Modal de detalle
  const [seleccionada, setSeleccionada] = useState<Incidencia | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Modal resolver
  const [modalResolver, setModalResolver] = useState(false);
  const [modalConfirmResolver, setModalConfirmResolver] = useState(false);
  const [fotoSolucion, setFotoSolucion] = useState<File | null>(null);
  const [comentario, setComentario] = useState("");
  const [resolviendo, setResolviendo] = useState(false);

  const cargarIncidencias = async () => {
    setLoading(true);
    try {
      const filtro =
        tabActual === "todos" ? undefined : (tabActual as EstadoId);
      const data = await obtenerIncidencias(filtro);
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
  }, [tabActual]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCambiarEstado = async (
    incidencia: Incidencia,
    nuevoEstado: EstadoId,
  ) => {
    // Si el nuevo estado es "resuelto", mostrar confirmación
    if (nuevoEstado === "resuelto") {
      setSeleccionada(incidencia);
      setModalConfirmResolver(true);
      return;
    }

    try {
      await actualizarEstado(incidencia.id, nuevoEstado);
      toast.success(
        `Ticket ${incidencia.ticketId} actualizado a "${ESTADOS[nuevoEstado].label}"`,
      );
      cargarIncidencias();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleResolver = async () => {
    if (!seleccionada || !fotoSolucion || !user) {
      toast.error("Sube una foto de la solución");
      return;
    }

    setResolviendo(true);
    try {
      await resolverIncidencia(
        seleccionada.id,
        fotoSolucion,
        comentario.trim(),
        user.uid,
      );
      toast.success(`Ticket ${seleccionada.ticketId} marcado como RESUELTO`);
      setModalResolver(false);
      setModalConfirmResolver(false);
      setFotoSolucion(null);
      setComentario("");
      setSeleccionada(null);
      cargarIncidencias();
    } catch {
      toast.error("Error al resolver incidencia");
    } finally {
      setResolviendo(false);
    }
  };

  const procederAResolver = () => {
    setModalConfirmResolver(false);
    setModalResolver(true);
  };

  // Filtrar incidencias por texto de búsqueda (ticket, descripción, dirección)
  const incidenciasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return incidencias;

    const termino = busqueda.toLowerCase().trim();
    return incidencias.filter(
      (inc) =>
        inc.ticketId.toLowerCase().includes(termino) ||
        inc.descripcion.toLowerCase().includes(termino) ||
        inc.ubicacion.direccionTexto.toLowerCase().includes(termino),
    );
  }, [incidencias, busqueda]);

  const getSiguienteEstado = (estado: EstadoId): EstadoId | null => {
    if (estado === "pendiente") return "en_proceso";
    if (estado === "en_proceso") return "resuelto";
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
          <p className="text-sm text-gray-500">
            Gestiona los reportes ciudadanos
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={cargarIncidencias}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar por ticket, descripción o dirección..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9 pr-9"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs de filtro */}
      <Tabs value={tabActual} onValueChange={setTabActual} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendiente">🔴 Pendientes</TabsTrigger>
          <TabsTrigger value="en_proceso">🟡 En Proceso</TabsTrigger>
          <TabsTrigger value="resuelto">🟢 Resueltos</TabsTrigger>
        </TabsList>

        <TabsContent value={tabActual} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : incidenciasFiltradas.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              {busqueda
                ? `No se encontraron resultados para "${busqueda}"`
                : "No hay incidencias con este filtro"}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incidenciasFiltradas.map((inc) => {
                const cat = CATEGORIAS.find((c) => c.id === inc.categoria);
                const estado = ESTADOS[inc.estado];
                const siguiente = getSiguienteEstado(inc.estado);

                return (
                  <Card key={inc.id} className="overflow-hidden">
                    {/* Preview de foto */}
                    {inc.fotoEvidenciaURL && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={inc.fotoEvidenciaURL}
                          alt="Evidencia"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <Badge
                          className={`absolute right-2 top-2 ${estado.color}`}
                        >
                          {estado.label}
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-blue-700">
                          {inc.ticketId}
                        </span>
                        <span className="text-lg">{cat?.icono}</span>
                      </div>

                      <p className="line-clamp-2 text-sm text-gray-700">
                        {inc.descripcion}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {inc.ubicacion.direccionTexto}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {inc.creadoEn?.toDate
                          ? formatearFecha(inc.creadoEn.toDate())
                          : "Sin fecha"}
                      </div>

                      <Separator className="my-3" />

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSeleccionada(inc);
                            setModalAbierto(true);
                          }}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Ver
                        </Button>
                        {siguiente && (
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleCambiarEstado(inc, siguiente)}
                          >
                            <ArrowRightLeft className="mr-1 h-3 w-3" />
                            {siguiente === "en_proceso"
                              ? "Iniciar"
                              : "Resolver"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalle */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle — {seleccionada?.ticketId}</DialogTitle>
            <DialogDescription>
              Información completa de la incidencia reportada
            </DialogDescription>
          </DialogHeader>
          {seleccionada && (
            <div className="space-y-4">
              <Badge className={ESTADOS[seleccionada.estado].color}>
                {ESTADOS[seleccionada.estado].label}
              </Badge>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Categoría:</strong>{" "}
                  {
                    CATEGORIAS.find((c) => c.id === seleccionada.categoria)
                      ?.label
                  }
                </p>
                <p>
                  <strong>Descripción:</strong> {seleccionada.descripcion}
                </p>
                <p>
                  <strong>Ubicación:</strong>{" "}
                  {seleccionada.ubicacion.direccionTexto}
                </p>
                {seleccionada.ubicacion.lat && seleccionada.ubicacion.lng && (
                  <p className="text-xs text-gray-400">
                    Coordenadas: {seleccionada.ubicacion.lat.toFixed(6)},{" "}
                    {seleccionada.ubicacion.lng.toFixed(6)}
                  </p>
                )}
                <p>
                  <strong>Fecha:</strong>{" "}
                  {seleccionada.creadoEn?.toDate
                    ? formatearFecha(seleccionada.creadoEn.toDate())
                    : "Sin fecha"}
                </p>
              </div>

              {seleccionada.fotoEvidenciaURL && (
                <div className="relative h-56 w-full overflow-hidden rounded-lg">
                  <Image
                    src={seleccionada.fotoEvidenciaURL}
                    alt="Evidencia"
                    fill
                    sizes="(max-width: 640px) 100vw, 512px"
                    className="object-cover"
                  />
                </div>
              )}

              {seleccionada.estado === "resuelto" &&
                seleccionada.fotoSolucionURL && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-green-700">
                      Foto de solución:
                    </p>
                    <div className="relative h-56 w-full overflow-hidden rounded-lg">
                      <Image
                        src={seleccionada.fotoSolucionURL}
                        alt="Solución"
                        fill
                        sizes="(max-width: 640px) 100vw, 512px"
                        className="object-cover"
                      />
                    </div>
                    {seleccionada.comentarioResolucion && (
                      <p className="mt-2 text-sm text-gray-600">
                        {seleccionada.comentarioResolucion}
                      </p>
                    )}
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para resolver */}
      <Dialog open={modalConfirmResolver} onOpenChange={setModalConfirmResolver}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ⚠️ Confirmar Resolución
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas marcar este ticket como resuelto?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-gray-700">
              <strong>Ticket:</strong> {seleccionada?.ticketId}
            </p>
            <p className="text-gray-700">
              <strong>Categoría:</strong>{" "}
              {
                CATEGORIAS.find((c) => c.id === seleccionada?.categoria)
                  ?.label
              }
            </p>
            <p className="rounded-lg bg-blue-50 p-2 text-gray-700">
              Necesitarás subir una foto de la solución aplicada.
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setModalConfirmResolver(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={procederAResolver}
            >
              Sí, continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de resolución */}
      <Dialog open={modalResolver} onOpenChange={setModalResolver}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Resolver — {seleccionada?.ticketId}
            </DialogTitle>
            <DialogDescription>
              Sube la foto de la solución aplicada para cerrar este ticket
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Para cerrar este ticket, sube la foto de la solución aplicada.
            </p>

            <SubidaFoto
              onFotoSeleccionada={setFotoSolucion}
              label="Foto de la solución *"
            />

            <div>
              <label className="text-sm font-medium">
                Comentario (opcional)
              </label>
              <Textarea
                placeholder="Ej: Se reemplazó la luminaria LED del poste #45"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                maxLength={300}
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalResolver(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleResolver}
                disabled={resolviendo || !fotoSolucion}
              >
                {resolviendo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resolviendo...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Marcar como Resuelto
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
