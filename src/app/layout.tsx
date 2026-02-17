import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIGIM - Sistema de Gestión de Incidencias | Municipalidad de Cañete",
  description:
    "Reporta fallas en alumbrado público, pistas y limpieza en la provincia de Cañete. Sistema de gestión de incidencias ciudadanas de la Municipalidad Provincial de Cañete.",
  keywords: [
    "incidencias",
    "Cañete",
    "municipalidad",
    "reporte",
    "alumbrado",
    "pistas",
    "limpieza",
  ],
  authors: [{ name: "UNDC - RSU" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
