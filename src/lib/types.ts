import { Timestamp } from "firebase/firestore";
import type { CategoriaId, EstadoId } from "./constants";

// ==============================================
// SIGIM - Tipos del Sistema
// ==============================================

// Documento de incidencia en Firestore
export interface Incidencia {
  id: string;
  ticketId: string; // CN-XXXX
  categoria: CategoriaId;
  descripcion: string;
  ubicacion: {
    lat: number | null;
    lng: number | null;
    direccionTexto: string;
  };
  fotoEvidenciaURL: string;
  estado: EstadoId;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
  // Solo cuando se resuelve
  fotoSolucionURL: string | null;
  comentarioResolucion: string | null;
  resueltoPor: string | null;
}

// Datos del formulario de reporte (antes de enviar a Firebase)
export interface ReporteFormData {
  categoria: CategoriaId | "";
  descripcion: string;
  direccionTexto: string;
  lat: number | null;
  lng: number | null;
  foto: File | null;
}

// Estadísticas del dashboard
export interface EstadisticasDashboard {
  total: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  porCategoria: Record<CategoriaId, number>;
}
