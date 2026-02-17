"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HeaderAdmin from "@/components/layout/HeaderAdmin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col bg-gray-50">
          <HeaderAdmin />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
