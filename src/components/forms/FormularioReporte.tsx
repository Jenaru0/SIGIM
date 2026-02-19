"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import SelectorCategoria from "@/components/forms/SelectorCategoria";
import SelectorUbicacion from "@/components/forms/SelectorUbicacion";
import SubidaFoto from "@/components/forms/SubidaFoto";
import MapaReporte from "@/components/mapa";
import { crearIncidencia } from "@/lib/services";
import {
  puedeReportar,
  registrarReporte,
  minutosRestantes,
  geocodificarInverso,
} from "@/lib/helpers";
import type { ReporteFormData } from "@/lib/types";
import type { CategoriaId } from "@/lib/constants";

// Pasos del formulario (wizard)
const PASOS = [
  {
    titulo: "Tipo de problema",
    descripcion: "¿Qué tipo de incidencia deseas reportar?",
  },
  { titulo: "Ubicación", descripcion: "¿Dónde se encuentra el problema?" },
  { titulo: "Evidencia", descripcion: "Sube una foto del problema" },
  { titulo: "Descripción", descripcion: "Cuéntanos más sobre el problema" },
];

export default function FormularioReporte() {
  const [paso, setPaso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [ticketCreado, setTicketCreado] = useState<string | null>(null);

  const [formData, setFormData] = useState<ReporteFormData>({
    categoria: "",
    descripcion: "",
    direccionTexto: "",
    lat: null,
    lng: null,
    foto: null,
  });

  // Validación por paso
  const validarPaso = (pasoActual: number): boolean => {
    switch (pasoActual) {
      case 0:
        return formData.categoria !== "";
      case 1:
        return (
          formData.direccionTexto.trim().length >= 5 &&
          formData.lat !== null &&
          formData.lng !== null
        );
      case 2:
        return formData.foto !== null;
      case 3:
        return formData.descripcion.trim().length >= 10;
      default:
        return false;
    }
  };

  const avanzar = () => {
    if (!validarPaso(paso)) {
      const mensajes = [
        "Selecciona un tipo de problema",
        "Marca la ubicación en el mapa o busca una dirección válida",
        "Sube una foto de evidencia",
        "Describe el problema (mínimo 10 caracteres)",
      ];
      toast.error(mensajes[paso]);
      return;
    }
    setPaso((prev) => Math.min(prev + 1, PASOS.length - 1));
  };

  const retroceder = () => setPaso((prev) => Math.max(prev - 1, 0));

  const enviar = async () => {
    // Validar todos los pasos
    for (let i = 0; i < PASOS.length; i++) {
      if (!validarPaso(i)) {
        toast.error("Hay campos incompletos. Revisa el formulario.");
        setPaso(i);
        return;
      }
    }

    // Verificar cooldown anti-spam
    if (!puedeReportar()) {
      toast.error(
        `Espera ${minutosRestantes()} minuto(s) antes de enviar otro reporte.`,
      );
      return;
    }

    setEnviando(true);
    try {
      const ticketId = await crearIncidencia({
        categoria: formData.categoria as CategoriaId,
        descripcion: formData.descripcion.trim(),
        direccionTexto: formData.direccionTexto.trim(),
        lat: formData.lat,
        lng: formData.lng,
        foto: formData.foto!,
      });

      registrarReporte();
      setTicketCreado(ticketId);
      toast.success("¡Reporte enviado exitosamente!");
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      toast.error("Error al enviar el reporte. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  // Pantalla de éxito
  if (ticketCreado) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            ¡Reporte Enviado!
          </h2>
          <p className="text-gray-600">
            Tu incidencia ha sido registrada exitosamente. El personal municipal
            la revisará pronto.
          </p>
          <div className="w-full rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Tu código de seguimiento:</p>
            <p className="mt-1 text-3xl font-bold tracking-wider text-blue-900">
              {ticketCreado}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Guarda este código para consultar el estado de tu reporte en la
            sección de &quot;Seguimiento&quot;.
          </p>
          <div className="mt-2 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(ticketCreado);
                toast.success("Código copiado al portapapeles");
              }}
            >
              Copiar código
            </Button>
            <Button
              onClick={() => {
                setTicketCreado(null);
                setPaso(0);
                setFormData({
                  categoria: "",
                  descripcion: "",
                  direccionTexto: "",
                  lat: null,
                  lng: null,
                  foto: null,
                });
              }}
            >
              Nuevo reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-6">
        {/* Indicador de progreso */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Paso {paso + 1} de {PASOS.length}
            </span>
            <span className="text-xs text-gray-500">{PASOS[paso].titulo}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {PASOS[paso].descripcion}
          </p>
        </div>

        {/* Contenido del paso */}
        <div className="min-h-[300px]">
          {paso === 0 && (
            <SelectorCategoria
              valor={formData.categoria}
              onChange={(cat) =>
                setFormData((prev) => ({ ...prev, categoria: cat }))
              }
            />
          )}

          {paso === 1 && (
            <div className="space-y-4">
              <SelectorUbicacion
                direccion={formData.direccionTexto}
                onDireccionChange={(dir) =>
                  setFormData((prev) => ({ ...prev, direccionTexto: dir }))
                }
                onCoordenadas={(lat, lng) =>
                  setFormData((prev) => ({ ...prev, lat, lng }))
                }
              />
              <MapaReporte
                onUbicacionSeleccionada={async (lat, lng) => {
                  setFormData((prev) => ({
                    ...prev,
                    lat,
                    lng,
                    direccionTexto: "Obteniendo dirección...",
                  }));
                  const direccion = await geocodificarInverso(lat, lng);
                  setFormData((prev) => ({
                    ...prev,
                    direccionTexto: direccion,
                  }));
                }}
                latInicial={formData.lat}
                lngInicial={formData.lng}
              />
            </div>
          )}

          {paso === 2 && (
            <SubidaFoto
              onFotoSeleccionada={(foto) =>
                setFormData((prev) => ({ ...prev, foto }))
              }
              label="Foto de evidencia *"
            />
          )}

          {paso === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Describe el problema *
                </label>
                <Textarea
                  placeholder="Ej: El poste de alumbrado tiene más de 2 semanas sin funcionar, afectando la visibilidad en la zona..."
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  maxLength={500}
                  rows={5}
                  className="mt-2"
                />
                <div className="mt-1 flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Sé específico: ¿qué viste? ¿desde cuándo? ¿cómo afecta?
                  </p>
                  <span className="text-xs text-gray-400">
                    {formData.descripcion.length}/500
                  </span>
                </div>
              </div>

              {/* Resumen antes de enviar */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Resumen del reporte:
                </h4>
                <ul className="mt-2 space-y-1 text-xs text-gray-600">
                  <li>
                    📋 <strong>Tipo:</strong> {formData.categoria}
                  </li>
                  <li>
                    📍 <strong>Ubicación:</strong> {formData.direccionTexto}
                  </li>
                  <li>
                    📷 <strong>Foto:</strong>{" "}
                    {formData.foto ? "✅ Adjunta" : "❌ Sin foto"}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navegación */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={retroceder}
            disabled={paso === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>

          {paso < PASOS.length - 1 ? (
            <Button type="button" onClick={avanzar}>
              Siguiente
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={enviar}
              disabled={enviando}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {enviando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Reporte"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
