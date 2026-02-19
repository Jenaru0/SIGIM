import imageCompression from "browser-image-compression";
import { IMAGE_COMPRESSION_OPTIONS, REPORT_COOLDOWN_MS } from "./constants";

// ==============================================
// SIGIM - Funciones auxiliares
// ==============================================

/**
 * Genera un ticket ID corto: CN-XXXX (4 dígitos aleatorios)
 */
export function generarTicketId(): string {
  const numero = Math.floor(1000 + Math.random() * 9000);
  return `CN-${numero}`;
}

/**
 * Comprime una imagen antes de subirla a Cloudinary
 * Reduce fotos de 3-5MB a ~200-500KB
 */
export async function comprimirImagen(file: File): Promise<File> {
  try {
    const compressedFile = await imageCompression(
      file,
      IMAGE_COMPRESSION_OPTIONS,
    );
    console.log(
      `Imagen comprimida: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
    );
    return compressedFile;
  } catch (error) {
    console.error("Error al comprimir imagen:", error);
    // Si la compresión falla, devolver la imagen original
    return file;
  }
}

/**
 * Verifica si el usuario puede enviar un reporte (cooldown de 3 min)
 * Retorna true si puede reportar, false si debe esperar
 */
export function puedeReportar(): boolean {
  if (typeof window === "undefined") return true;
  const ultimoReporte = localStorage.getItem("sigim_ultimo_reporte");
  if (!ultimoReporte) return true;
  return Date.now() - Number(ultimoReporte) >= REPORT_COOLDOWN_MS;
}

/**
 * Guarda el timestamp del último reporte
 */
export function registrarReporte(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("sigim_ultimo_reporte", Date.now().toString());
}

/**
 * Retorna los minutos restantes antes de poder reportar
 */
export function minutosRestantes(): number {
  if (typeof window === "undefined") return 0;
  const ultimoReporte = localStorage.getItem("sigim_ultimo_reporte");
  if (!ultimoReporte) return 0;
  const diff = REPORT_COOLDOWN_MS - (Date.now() - Number(ultimoReporte));
  return Math.max(0, Math.ceil(diff / 60000));
}

/**
 * Formatea una fecha en español peruano
 */
export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formatea fecha corta
 */
export function formatearFechaCorta(fecha: Date): string {
  return fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Geocodificación directa usando Nominatim (OpenStreetMap)
 * Convierte una dirección de texto en coordenadas (lat, lng).
 * Gratis, sin API key. Rate limit: 1 req/s.
 */
export async function geocodificar(
  direccion: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!direccion.trim()) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccion)}&format=json&limit=1&accept-language=es`,
      { headers: { "User-Agent": "SIGIM-Canete/1.0" } },
    );
    if (!res.ok) throw new Error("Nominatim error");

    const data = await res.json();
    if (!data || data.length === 0) return null;

    const resultado = data[0];
    return {
      lat: parseFloat(resultado.lat),
      lng: parseFloat(resultado.lon),
    };
  } catch (error) {
    console.error("Error geocodificando dirección:", error);
    return null;
  }
}

/**
 * Geocodificación inversa usando Nominatim (OpenStreetMap)
 * Convierte coordenadas (lat, lng) en una dirección legible.
 * Gratis, sin API key. Rate limit: 1 req/s.
 */
export async function geocodificarInverso(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`,
      { headers: { "User-Agent": "SIGIM-Canete/1.0" } },
    );
    if (!res.ok) throw new Error("Nominatim error");

    const data = await res.json();
    const addr = data.address;
    const partes: string[] = [];

    if (addr.road) {
      let calle = addr.road;
      if (addr.house_number) calle += ` ${addr.house_number}`;
      partes.push(calle);
    }
    if (addr.neighbourhood || addr.suburb)
      partes.push(addr.neighbourhood || addr.suburb);
    if (addr.city || addr.town || addr.village)
      partes.push(addr.city || addr.town || addr.village);

    return (
      (partes.length > 0
        ? partes.join(", ")
        : data.display_name?.split(",").slice(0, 3).join(",").trim()) ||
      `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    );
  } catch {
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  }
}
