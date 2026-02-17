"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { MapPin, LayoutDashboard, List, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/incidencias", icon: List, label: "Incidencias" },
];

export default function HeaderAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada");
      router.push("/admin/login");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-gray-900">
            SIGIM{" "}
            <span className="hidden text-xs font-normal text-gray-500 sm:inline">
              | Panel Admin
            </span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5",
                  pathname === item.href && "bg-blue-50 text-blue-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 text-xs text-gray-500 md:flex">
            <User className="h-3 w-3" />
            {user?.email}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
