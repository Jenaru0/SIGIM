<div align="center">

# 🏛️ SIGIM

### Sistema de Gestión de Incidencias Municipales

**Municipalidad Provincial de Cañete, Lima — Perú**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

Plataforma web que permite a los ciudadanos reportar problemas de servicios públicos (alumbrado, pistas, limpieza, agua, parques, señalización) y a la municipalidad gestionar su resolución de forma transparente.

[Reportar Bug](../../issues) · [Solicitar Funcionalidad](../../issues)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Uso](#-uso)
- [Configuración de Servicios](#-configuración-de-servicios)
- [Deploy](#-deploy)
- [Proyecto RSU](#-proyecto-rsu)
- [Licencia](#-licencia)

---

## 🎯 Descripción

**SIGIM** es un sistema web diseñado para digitalizar el proceso de reporte y seguimiento de incidencias ciudadanas en la Municipalidad Provincial de Cañete, Perú. Inspirado en plataformas como [FixMyStreet](https://fixmystreet.com/), ofrece una experiencia simple, accesible y sin registro para que cualquier ciudadano pueda reportar un problema en su localidad.

### Filosofía de Diseño

> **"Mínimo Esfuerzo / Cero Estrés"** — Profesional pero simple. Sin formularios interminables, sin registro obligatorio, sin complejidad innecesaria.

---

## ✨ Características

### Para Ciudadanos

- 📝 **Reporte en 4 pasos** — Wizard intuitivo: Categoría → Ubicación → Foto → Descripción
- 🗺️ **Mapa interactivo** — Click para marcar ubicación exacta con Leaflet + OpenStreetMap
- 📍 **Geocodificación automática** — Convierte coordenadas en nombres de calles (Nominatim)
- 📸 **Subida de fotos** — Drag & drop con compresión automática a ≤500KB
- 🎫 **Ticket anónimo** — Código `CN-XXXX` para seguimiento sin registro ni datos personales
- 🔍 **Seguimiento de reporte** — Consulta el estado en cualquier momento con tu código

### Para Administradores

- 🔐 **Login seguro** — Autenticación con Firebase Auth (email/password)
- 📊 **Dashboard** — Estadísticas en tiempo real (total, pendientes, en proceso, resueltos)
- 📋 **Gestión de incidencias** — Tabla con filtros por estado, detalle completo, cambio de estado
- ✅ **Resolución con evidencia** — Foto de solución + comentario para cerrar tickets
- 🔄 **Flujo de estados** — Pendiente → En Proceso → Resuelto

### Seguridad y Rendimiento

- 🛡️ **Sin datos personales** — Cumple con la Ley N° 29733 de Protección de Datos de Perú
- ⏱️ **Anti-spam** — Cooldown de 3 minutos entre reportes
- 🖼️ **Compresión client-side** — Fotos optimizadas antes de subir (browser-image-compression)
- 📱 **Responsive** — Diseño adaptable a móviles, tablets y escritorio

---

## 🛠️ Stack Tecnológico

| Capa                | Tecnología                   | Propósito                          |
| ------------------- | ---------------------------- | ---------------------------------- |
| **Framework**       | Next.js 16 (App Router)      | Renderizado, routing, optimización |
| **UI**              | React 19 + TypeScript 5      | Componentes tipados                |
| **Estilos**         | Tailwind CSS 4 + shadcn/ui   | Diseño profesional y consistente   |
| **Base de datos**   | Firebase Firestore           | Almacenamiento NoSQL en la nube    |
| **Autenticación**   | Firebase Auth                | Login administrativo               |
| **Imágenes**        | Cloudinary (unsigned upload) | Almacenamiento de fotos            |
| **Mapas**           | Leaflet + react-leaflet      | Mapa interactivo (OpenStreetMap)   |
| **Geocodificación** | Nominatim (OSM)              | Coordenadas → dirección legible    |
| **Notificaciones**  | Sonner                       | Toasts elegantes                   |
| **Deploy**          | Vercel                       | Hosting optimizado para Next.js    |

---

## 🏗️ Arquitectura

```
sigim/
├── src/
│   ├── app/                          # App Router (Next.js)
│   │   ├── (ciudadano)/              # Rutas públicas
│   │   │   ├── page.tsx              # Landing + formulario wizard
│   │   │   └── seguimiento/page.tsx  # Búsqueda por ticket
│   │   ├── admin/
│   │   │   ├── login/page.tsx        # Login Firebase Auth
│   │   │   └── (panel)/             # Rutas protegidas
│   │   │       ├── dashboard/        # Estadísticas
│   │   │       └── incidencias/      # Gestión CRUD
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/                     # AuthProvider, ProtectedRoute
│   │   ├── forms/                    # Wizard, categorías, foto, ubicación
│   │   ├── layout/                   # Headers, Footer
│   │   ├── mapa/                     # Leaflet con SSR fix
│   │   └── ui/                       # shadcn/ui (16 componentes)
│   └── lib/
│       ├── cloudinary.ts             # Upload de imágenes
│       ├── constants.ts              # Categorías, estados, config
│       ├── firebase.ts               # Inicialización Firebase
│       ├── helpers.ts                # Utilidades (ticket, compresión, geocoding)
│       ├── services.ts               # CRUD Firestore
│       └── types.ts                  # Interfaces TypeScript
├── firestore.rules                   # Reglas de seguridad Firestore
├── PROJECT_STATUS.md                 # Estado del proyecto (para continuidad IA)
└── .env.local                        # Variables de entorno (no versionado)
```

---

## 🚀 Instalación

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18+ (recomendado v22)
- npm v10+
- Cuenta de [Firebase](https://firebase.google.com/) (plan gratuito Spark)
- Cuenta de [Cloudinary](https://cloudinary.com/) (plan gratuito)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/sigim.git
cd sigim

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales (ver sección siguiente)

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔑 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Firebase (Firestore + Auth)
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Mapa (centro de Cañete)
NEXT_PUBLIC_DEFAULT_LAT=-13.0769
NEXT_PUBLIC_DEFAULT_LNG=-76.3858

# Cloudinary (subida de imágenes)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sigim_unsigned
```

---

## 💻 Uso

### Scripts disponibles

| Comando         | Descripción                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción                |
| `npm run start` | Servir build de producción         |
| `npm run lint`  | Ejecutar ESLint                    |

### Flujo del ciudadano

1. Acceder a la página principal
2. Seleccionar categoría del problema (7 categorías disponibles)
3. Marcar ubicación en el mapa o usar GPS (se obtiene nombre de calle automáticamente)
4. Subir foto de evidencia (se comprime automáticamente)
5. Describir el problema
6. Recibir código de ticket `CN-XXXX`
7. Consultar estado en `/seguimiento`

### Flujo del administrador

1. Acceder a `/admin/login`
2. Ver estadísticas en el Dashboard
3. Gestionar incidencias: cambiar estado, ver detalles, resolver con foto

---

## ⚙️ Configuración de Servicios

### Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Firestore Database** (modo test o con las reglas del archivo `firestore.rules`)
3. Habilitar **Authentication** → método **Email/Password**
4. Crear un usuario administrador en Authentication → Users → Add user
5. Copiar credenciales del SDK web a `.env.local`

### Cloudinary

1. Crear cuenta en [cloudinary.com](https://cloudinary.com/)
2. Ir a **Settings → Upload → Upload presets → Add upload preset**
   - Signing Mode: **Unsigned**
   - Nombre: `sigim_unsigned`
3. Copiar tu **Cloud Name** a `.env.local`

### Firestore Rules

Copiar el contenido de `firestore.rules` en Firebase Console → Firestore → Rules:

- **CREATE**: Cualquier ciudadano (anónimo)
- **READ/UPDATE**: Solo usuarios autenticados (administradores)
- **DELETE**: Nadie

---

## 🌐 Deploy

### Vercel (recomendado)

1. Conectar repositorio en [vercel.com](https://vercel.com/)
2. Configurar las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push a `main`

### Otros

El proyecto es compatible con cualquier plataforma que soporte Next.js (Netlify, Railway, Docker, etc.).

---

## 🎓 Proyecto RSU

Este sistema fue desarrollado como parte de un proyecto de **Responsabilidad Social Universitaria (RSU)** de la **Universidad Nacional de Cañete (UNDC)**, con el objetivo de contribuir a la mejora de la gestión municipal mediante herramientas tecnológicas accesibles.

### Categorías de incidencias

| Icono | Categoría          | Ejemplos                                      |
| :---: | ------------------ | --------------------------------------------- |
|  💡   | Alumbrado Público  | Postes caídos, focos quemados, cables sueltos |
|  🚧   | Pistas y Veredas   | Baches, grietas, veredas rotas                |
|  🗑️   | Limpieza Pública   | Basura acumulada, desmontes                   |
|  🚰   | Agua y Desagüe     | Tuberías rotas, buzones desbordados           |
|  🌳   | Parques y Jardines | Áreas verdes descuidadas, bancas rotas        |
|  🚦   | Señalización Vial  | Semáforos averiados, señales dañadas          |
|  📋   | Otros              | Cualquier otro problema municipal             |

---

## 📄 Licencia

Este proyecto es de código abierto para fines educativos y de servicio público.

---

<div align="center">

Desarrollado con ❤️ para la comunidad de Cañete

**Universidad Nacional de Cañete — UNDC**

</div>
