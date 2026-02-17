"use client";

import { CATEGORIAS } from "@/lib/constants";
import type { CategoriaId } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SelectorCategoriaProps {
  valor: CategoriaId | "";
  onChange: (categoria: CategoriaId) => void;
}

export default function SelectorCategoria({
  valor,
  onChange,
}: SelectorCategoriaProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        ¿Qué tipo de problema quieres reportar?
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
              valor === cat.id
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            <span className="text-3xl">{cat.icono}</span>
            <span className="text-sm font-medium text-gray-900">
              {cat.label}
            </span>
            <span className="text-xs text-gray-500">{cat.descripcion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
