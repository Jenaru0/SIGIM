// ==============================================
// SIGIM - Subida de imágenes a Cloudinary
// ==============================================
// Usa "unsigned upload" directo a la API REST de Cloudinary.
// Requiere crear un Upload Preset "unsigned" en el dashboard de Cloudinary.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

/**
 * Sube una imagen a Cloudinary usando unsigned upload.
 * @param file - Archivo de imagen (ya comprimido por browser-image-compression)
 * @param carpeta - Carpeta en Cloudinary (ej: "incidencias" o "soluciones")
 * @returns URL segura (https) de la imagen subida
 */
export async function subirImagenCloudinary(
  file: File,
  carpeta: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `sigim/${carpeta}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Error al subir imagen: ${error?.error?.message || res.statusText}`,
    );
  }

  const data = await res.json();
  return data.secure_url as string;
}
