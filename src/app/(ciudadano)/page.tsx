import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import FormularioReporte from "@/components/forms/FormularioReporte";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 text-center md:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Reporta problemas en tu ciudad
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Alumbrado, pistas, limpieza, agua, parques y más. Tu reporte ayuda a
          mejorar Cañete.
        </p>

        {/* Indicadores de cómo funciona */}
        <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:max-w-2xl">
          <div className="flex flex-1 items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <span className="text-left text-sm text-gray-700">
              <strong>1.</strong> Reporta el problema
            </span>
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            <Clock className="h-5 w-5 shrink-0 text-yellow-500" />
            <span className="text-left text-sm text-gray-700">
              <strong>2.</strong> La municipalidad lo gestiona
            </span>
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
            <span className="text-left text-sm text-gray-700">
              <strong>3.</strong> Problema resuelto
            </span>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="container mx-auto px-4 pb-12">
        <FormularioReporte />
      </section>
    </div>
  );
}
