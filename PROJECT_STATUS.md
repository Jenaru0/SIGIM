# SIGIM — Estado del Proyecto

> **Última actualización:** 2026-02-17
> **Para:** Continuidad de contexto entre sesiones de IA

---

## 1. ¿Qué es SIGIM?

**Sistema de Gestión de Incidencias Municipales** para la Municipalidad Provincial de Cañete, Perú.
Permite a ciudadanos reportar problemas de servicios públicos (alumbrado, pistas, limpieza) y a administradores gestionar esos reportes.

- **Filosofía de diseño:** "Mínimo Esfuerzo / Cero Estrés" — profesional pero simple.
- **Referencia UX:** Wizard de 4 pasos inspirado en [FixMyStreet](https://fixmystreet.com/).
- **No se requiere registro** para reportar. Seguimiento por ticket ID (formato `CN-XXXX`).

---

## 2. Stack Tecnológico

| Capa       | Tecnología                                 | Versión                  |
| ---------- | ------------------------------------------ | ------------------------ |
| Framework  | Next.js (App Router, Turbopack)            | 16.1.6                   |
| UI         | React                                      | 19.2.3                   |
| Lenguaje   | TypeScript                                 | 5.x                      |
| Estilos    | Tailwind CSS v4 + shadcn/ui                | 4.x                      |
| DB         | Firebase Firestore                         | SDK 12.9.0               |
| Auth       | Firebase Auth (email/password)             | SDK 12.9.0               |
| Imágenes   | **Cloudinary** (unsigned upload, API REST) | Sin SDK — solo `fetch()` |
| Mapas      | Leaflet + react-leaflet                    | 1.9.4 / 5.0.0            |
| Compresión | browser-image-compression                  | 2.0.2                    |
| Toasts     | sonner                                     | 2.0.7                    |
| Deploy     | Vercel (previsto)                          | —                        |

### Decisiones clave de arquitectura

- **Cloudinary en vez de Firebase Storage:** Firebase Storage requiere tarjeta de crédito para Blaze plan. Se usa unsigned upload directo a la API REST de Cloudinary (`fetch()`) — no se instaló ningún paquete. Helper en `src/lib/cloudinary.ts`.
- **Leaflet SSR fix:** `react-leaflet` no funciona en SSR (usa `window`). Se resuelve con `dynamic(() => import(...), { ssr: false })` en `src/components/mapa/index.tsx`.
- **Sin DNI/datos personales:** Por Ley N° 29733 de Perú (protección de datos). Tracking solo por ticket ID anónimo.
- **Anti-spam:** Cooldown de 3 minutos entre reportes (localStorage).
- **Compresión client-side:** Las fotos se comprimen a ≤500KB antes de subir (browser-image-compression).

---

## 3. Estructura del Proyecto

```
sigim/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                    # Root layout (Toaster de sonner)
│   │   ├── (ciudadano)/
│   │   │   ├── layout.tsx                # Header + Footer público
│   │   │   ├── page.tsx                  # Landing + FormularioReporte (wizard 4 pasos)
│   │   │   └── seguimiento/
│   │   │       └── page.tsx              # Búsqueda por ticket CN-XXXX
│   │   └── admin/
│   │       ├── login/
│   │       │   └── page.tsx              # Login Firebase Auth
│   │       └── (panel)/
│   │           ├── layout.tsx            # AuthProvider + ProtectedRoute + HeaderAdmin
│   │           ├── dashboard/
│   │           │   └── page.tsx          # Estadísticas (total, por estado, por categoría)
│   │           └── incidencias/
│   │               └── page.tsx          # CRUD de incidencias (tabla, filtros, modales)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx          # Context de Firebase Auth
│   │   │   └── ProtectedRoute.tsx        # Redirect si no autenticado
│   │   ├── forms/
│   │   │   ├── FormularioReporte.tsx     # Wizard: Categoría → Ubicación → Foto → Descripción
│   │   │   ├── SelectorCategoria.tsx     # Cards de categorías
│   │   │   ├── SelectorUbicacion.tsx     # Mapa + input texto dirección
│   │   │   └── SubidaFoto.tsx            # Drag-and-drop + compresión + preview
│   │   ├── layout/
│   │   │   ├── HeaderPublico.tsx
│   │   │   ├── HeaderAdmin.tsx
│   │   │   └── FooterPublico.tsx
│   │   ├── mapa/
│   │   │   ├── MapaReporte.tsx           # Leaflet map (click-to-pin)
│   │   │   └── index.tsx                 # dynamic import wrapper (SSR fix)
│   │   └── ui/                           # shadcn/ui (16 componentes)
│   └── lib/
│       ├── cloudinary.ts                 # subirImagenCloudinary() — unsigned upload fetch()
│       ├── constants.ts                  # CATEGORIAS, ESTADOS, CANETE_CENTER, IMAGE_COMPRESSION_OPTIONS
│       ├── firebase.ts                   # initializeApp, auth, db (NO storage)
│       ├── helpers.ts                    # generarTicketId, comprimirImagen, puedeReportar, formatearFecha
│       ├── services.ts                   # CRUD Firestore: crearIncidencia, buscarPorTicket, obtenerIncidencias, actualizarEstado, resolverIncidencia, obtenerIncidenciaPorId
│       ├── types.ts                      # Incidencia, ReporteFormData, EstadisticasDashboard
│       └── utils.ts                      # cn() de shadcn
├── firestore.rules                       # Reglas de seguridad Firestore
├── storage.rules                         # ⚠️ OBSOLETO — ya no se usa Firebase Storage
├── .env.local                            # Config Firebase + Cloudinary
├── next.config.ts                        # remotePatterns: res.cloudinary.com
├── components.json                       # Config shadcn/ui
└── package.json
```

### shadcn/ui componentes instalados (16)

button, card, input, label, textarea, select, badge, dialog, table, tabs, separator, skeleton, avatar, dropdown-menu, sheet, sonner

---

## 4. Variables de Entorno (.env.local)

```env
# Firebase (Firestore + Auth)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=     # Aún necesario para inicializar Firebase SDK
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Mapa
NEXT_PUBLIC_DEFAULT_LAT=-13.0769
NEXT_PUBLIC_DEFAULT_LNG=-76.3858

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dzcpjjm69
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sigim_unsigned
```

**NOTA:** El usuario ya configuró `CLOUD_NAME=dzcpjjm69`. Falta confirmar que creó el Upload Preset `sigim_unsigned` (unsigned) en el dashboard de Cloudinary.

---

## 5. Estado Actual — Funcionalidades Implementadas ✅

| #   | Funcionalidad                                          | Estado                   |
| --- | ------------------------------------------------------ | ------------------------ |
| 1   | Scaffold completo Next.js 16 + Tailwind v4 + shadcn/ui | ✅ Completo              |
| 2   | Landing page con wizard de 4 pasos                     | ✅ Completo              |
| 3   | Categorías: Alumbrado, Pistas, Limpieza                | ✅ Completo              |
| 4   | Mapa interactivo (Leaflet) con click-to-pin            | ✅ Completo              |
| 5   | Subida de foto con compresión client-side (≤500KB)     | ✅ Completo              |
| 6   | Generación de ticket anónimo (CN-XXXX)                 | ✅ Completo              |
| 7   | Guardar incidencia en Firestore                        | ✅ Completo              |
| 8   | Subida de imágenes a Cloudinary (unsigned upload)      | ✅ Completo              |
| 9   | Página de seguimiento por ticket                       | ✅ Completo              |
| 10  | Login admin (Firebase Auth email/password)             | ✅ Completo              |
| 11  | Dashboard admin con estadísticas                       | ✅ Completo              |
| 12  | Gestión de incidencias admin (tabla, filtros, estados) | ✅ Completo              |
| 13  | Resolución de incidencia con foto + comentario         | ✅ Completo              |
| 14  | Anti-spam (cooldown 3 min, localStorage)               | ✅ Completo              |
| 15  | Firestore security rules                               | ✅ Completo              |
| 16  | Build de producción exitoso (0 errores)                | ✅ Verificado 2026-02-17 |

---

## 6. Pendientes / Tareas por hacer 🔲

### Alta prioridad (funcionalidad core)

- [ ] **Probar flujo completo E2E:** Crear incidencia real → verificar en Firestore → verificar imagen en Cloudinary → buscar por ticket → resolver desde admin. Nunca se ha probado con datos reales.
- [ ] **Crear usuario admin en Firebase Auth:** Se necesita al menos 1 usuario email/password para login admin. Hacerlo desde Firebase Console → Authentication → Add user.
- [ ] **Configurar Firebase real en .env.local:** Reemplazar los placeholders con credenciales reales del proyecto Firebase. Las variables actuales son placeholders excepto `CLOUDINARY_CLOUD_NAME`.
- [ ] **Confirmar Upload Preset en Cloudinary:** Verificar que existe el preset `sigim_unsigned` con Signing Mode: Unsigned.
- [ ] **Eliminar `storage.rules`:** Archivo obsoleto desde la migración a Cloudinary.

### Media prioridad (mejoras)

- [ ] **Deploy a Vercel:** Configurar variables de entorno en Vercel dashboard y hacer primer deploy.
- [ ] **Índices compuestos en Firestore:** La query `where("estado") + orderBy("creadoEn")` requiere un índice compuesto. Firestore lo pedirá en la primera ejecución con un link para crearlo automáticamente.
- [ ] **Validación server-side:** Actualmente toda la validación es client-side. Considerar Cloud Functions o API Routes para validar datos antes de escribir en Firestore.
- [ ] **Rate limiting real:** El anti-spam actual es solo localStorage (fácil de evadir). Para producción considerar Cloud Functions con limitación por IP.
- [ ] **PWA / Service Worker:** Para que funcione offline o como app instalable en móviles.
- [ ] **Notificaciones:** Email o push cuando cambia el estado de una incidencia.

### Baja prioridad (nice-to-have)

- [ ] **Exportar reportes a CSV/Excel** desde el panel admin.
- [ ] **Modo oscuro** (next-themes ya está instalado, solo falta implementar toggle).
- [ ] **Pruebas unitarias / E2E** (Vitest + Playwright).
- [ ] **Analytics:** Google Analytics o similar para métricas de uso.
- [ ] **Multi-idioma:** Actualmente solo español.

---

## 7. Firestore — Estructura de Datos

### Colección: `incidencias`

```typescript
{
  ticketId: string; // "CN-XXXX" (generado client-side)
  categoria: "alumbrado" | "pistas" | "limpieza";
  descripcion: string;
  ubicacion: {
    lat: number | null;
    lng: number | null;
    direccionTexto: string;
  }
  fotoEvidenciaURL: string; // URL Cloudinary (https://res.cloudinary.com/...)
  estado: "pendiente" | "en_proceso" | "resuelto";
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
  fotoSolucionURL: string | null; // Solo cuando se resuelve
  comentarioResolucion: string | null; // Solo cuando se resuelve
  resueltoPor: string | null; // UID del admin que resolvió
}
```

### Reglas de seguridad (firestore.rules)

- **CREATE:** Cualquiera (ciudadano anónimo)
- **READ/UPDATE:** Solo usuarios autenticados (admins)
- **DELETE:** Nadie
- ⚠️ Las reglas temporales expiran el **2026-03-19** — renovar antes de esa fecha.

---

## 8. Próximo Paso Recomendado

**Al abrir un nuevo chat, copiar este mensaje:**

> Estoy continuando el proyecto SIGIM. Lee el archivo `PROJECT_STATUS.md` en la raíz del proyecto para contexto completo.
>
> Próxima tarea: [describir lo que quieras hacer]

### Flujo recomendado para la próxima sesión:

1. **Configurar credenciales reales de Firebase** en `.env.local` (si no se ha hecho).
2. **Crear usuario admin** en Firebase Console → Authentication.
3. **Verificar Upload Preset** `sigim_unsigned` en Cloudinary dashboard.
4. **Levantar dev server** (`npm run dev`) y probar flujo completo E2E.
5. **Crear índice compuesto** en Firestore cuando aparezca el error/link.
6. **Primer deploy a Vercel.**

---

## 9. Comandos Útiles

```bash
npm run dev        # Servidor desarrollo (Turbopack)
npm run build      # Build producción
npm run start      # Servir build producción
npm run lint       # ESLint
```

---

_Generado automáticamente para continuidad de contexto entre sesiones de IA._
