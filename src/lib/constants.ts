// ==============================================
// SIGIM - Constantes del Sistema
// ==============================================

// Categorías de incidencias
export const CATEGORIAS = [
  {
    id: "alumbrado",
    label: "Alumbrado Público",
    descripcion: "Postes caídos, focos quemados, cables sueltos",
    icono: "💡",
  },
  {
    id: "pistas",
    label: "Pistas y Veredas",
    descripcion: "Baches, grietas, veredas rotas, desniveles",
    icono: "🚧",
  },
  {
    id: "limpieza",
    label: "Limpieza Pública",
    descripcion: "Acumulación de basura, desmontes, desagüe",
    icono: "🗑️",
  },
  {
    id: "agua_desague",
    label: "Agua y Desagüe",
    descripcion: "Tuberías rotas, buzones desbordados, aniegos",
    icono: "🚰",
  },
  {
    id: "parques",
    label: "Parques y Jardines",
    descripcion: "Áreas verdes descuidadas, bancas rotas, juegos dañados",
    icono: "🌳",
  },
  {
    id: "senalizacion",
    label: "Señalización Vial",
    descripcion: "Semáforos averiados, señales dañadas o faltantes",
    icono: "🚦",
  },
  {
    id: "otros",
    label: "Otros",
    descripcion: "Cualquier otro problema de servicios municipales",
    icono: "📋",
  },
] as const;

// Estados de incidencias
export const ESTADOS = {
  pendiente: {
    label: "Pendiente",
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
  en_proceso: {
    label: "En Proceso",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  resuelto: {
    label: "Resuelto",
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
} as const;

// Coordenadas del centro de Cañete
export const CANETE_CENTER = {
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT) || -13.0769,
  lng: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG) || -76.3858,
};

// Configuración de compresión de imágenes
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5, // Máximo 500KB
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

// Cooldown entre reportes (en milisegundos) - 3 minutos
export const REPORT_COOLDOWN_MS = 3 * 60 * 1000;

// Tipos de categoría (para TypeScript)
export type CategoriaId = (typeof CATEGORIAS)[number]["id"];
export type EstadoId = keyof typeof ESTADOS;
