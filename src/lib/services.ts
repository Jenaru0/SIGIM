import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { generarTicketId } from "./helpers";
import { subirImagenCloudinary } from "./cloudinary";
import type { Incidencia } from "./types";
import type { CategoriaId, EstadoId } from "./constants";

// Referencia a la colección
const incidenciasRef = collection(db, "incidencias");

// ==============================================
// CREAR INCIDENCIA (Ciudadano)
// ==============================================

interface CrearIncidenciaParams {
  categoria: CategoriaId;
  descripcion: string;
  direccionTexto: string;
  lat: number | null;
  lng: number | null;
  foto: File;
}

export async function crearIncidencia(
  params: CrearIncidenciaParams,
): Promise<string> {
  // 1. Generar ticket ID único
  const ticketId = generarTicketId();

  // 2. Subir foto a Cloudinary
  const fotoEvidenciaURL = await subirImagenCloudinary(
    params.foto,
    "incidencias",
  );

  // 3. Guardar incidencia en Firestore
  await addDoc(incidenciasRef, {
    ticketId,
    categoria: params.categoria,
    descripcion: params.descripcion,
    ubicacion: {
      lat: params.lat,
      lng: params.lng,
      direccionTexto: params.direccionTexto,
    },
    fotoEvidenciaURL,
    estado: "pendiente" as EstadoId,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
    fotoSolucionURL: null,
    comentarioResolucion: null,
    resueltoPor: null,
  });

  return ticketId;
}

// ==============================================
// BUSCAR POR TICKET ID (Ciudadano - seguimiento)
// ==============================================

export async function buscarPorTicket(
  ticketId: string,
): Promise<Incidencia | null> {
  const q = query(
    incidenciasRef,
    where("ticketId", "==", ticketId.toUpperCase()),
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Incidencia;
}

// ==============================================
// OBTENER TODAS LAS INCIDENCIAS (Admin)
// ==============================================

export async function obtenerIncidencias(
  filtroEstado?: EstadoId,
): Promise<Incidencia[]> {
  // Siempre obtenemos todas y filtramos en el cliente.
  // Esto evita necesitar índices compuestos en Firestore.
  const q = query(incidenciasRef, orderBy("creadoEn", "desc"));
  const snapshot = await getDocs(q);
  const todas = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Incidencia[];

  if (filtroEstado) {
    return todas.filter((inc) => inc.estado === filtroEstado);
  }
  return todas;
}

// ==============================================
// ACTUALIZAR ESTADO (Admin)
// ==============================================

export async function actualizarEstado(
  incidenciaId: string,
  nuevoEstado: EstadoId,
): Promise<void> {
  const docRef = doc(db, "incidencias", incidenciaId);
  await updateDoc(docRef, {
    estado: nuevoEstado,
    actualizadoEn: serverTimestamp(),
  });
}

// ==============================================
// RESOLVER INCIDENCIA (Admin - con foto)
// ==============================================

export async function resolverIncidencia(
  incidenciaId: string,
  foto: File,
  comentario: string,
  adminUid: string,
): Promise<void> {
  // 1. Subir foto de solución a Cloudinary
  const fotoSolucionURL = await subirImagenCloudinary(foto, "soluciones");

  // 2. Actualizar incidencia
  const docRef = doc(db, "incidencias", incidenciaId);
  await updateDoc(docRef, {
    estado: "resuelto" as EstadoId,
    fotoSolucionURL,
    comentarioResolucion: comentario,
    resueltoPor: adminUid,
    actualizadoEn: serverTimestamp(),
  });
}

// ==============================================
// OBTENER UNA INCIDENCIA POR ID (Admin)
// ==============================================

export async function obtenerIncidenciaPorId(
  incidenciaId: string,
): Promise<Incidencia | null> {
  const docRef = doc(db, "incidencias", incidenciaId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Incidencia;
}
