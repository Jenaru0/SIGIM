"use client";

import Link from "next/link";
import { MapPin, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function HeaderPublico() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-gray-900">
              SIGIM
            </span>
            <span className="text-[10px] leading-tight text-gray-500">
              Municipalidad de Cañete
            </span>
          </div>
        </Link>

        {/* Nav Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Reportar
            </Button>
          </Link>
          <Link href="/seguimiento">
            <Button variant="ghost" size="sm">
              <Search className="mr-1 h-4 w-4" />
              Seguimiento
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              Acceso Municipal
            </Button>
          </Link>
        </nav>

        {/* Menu Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Dropdown Mobile */}
      {menuAbierto && (
        <div className="border-t bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/" onClick={() => setMenuAbierto(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Reportar Incidencia
              </Button>
            </Link>
            <Link href="/seguimiento" onClick={() => setMenuAbierto(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Seguimiento de Ticket
              </Button>
            </Link>
            <Link href="/admin/login" onClick={() => setMenuAbierto(false)}>
              <Button variant="outline" className="w-full justify-start">
                Acceso Municipal
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
