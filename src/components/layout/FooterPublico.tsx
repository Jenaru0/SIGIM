import Link from "next/link";

export default function FooterPublico() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Info */}
          <div>
            <h3 className="font-semibold text-gray-900">SIGIM</h3>
            <p className="mt-2 text-sm text-gray-600">
              Sistema de Gestión de Incidencias Ciudadanas de la Municipalidad
              Provincial de Cañete.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900">Enlaces</h3>
            <nav className="mt-2 flex flex-col gap-1">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Reportar Incidencia
              </Link>
              <Link
                href="/seguimiento"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Seguimiento de Ticket
              </Link>
            </nav>
          </div>

          {/* Créditos */}
          <div>
            <h3 className="font-semibold text-gray-900">Desarrollo</h3>
            <p className="mt-2 text-sm text-gray-600">
              Proyecto de Responsabilidad Social Universitaria (RSU).
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Universidad Nacional de Cañete — UNDC
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
          © {year} SIGIM — Municipalidad Provincial de Cañete. Todos los
          derechos reservados.
        </div>
      </div>
    </footer>
  );
}
