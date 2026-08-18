import { Building2, RotateCcw } from "lucide-react";

export interface FiltrosSeguimiento {
  organizacion: string;
  conformidadMin: number; // 0..100
  conformidadMax: number; // 0..100
}

export const FILTROS_SEGUIMIENTO_VACIOS: FiltrosSeguimiento = {
  organizacion: "",
  conformidadMin: 0,
  conformidadMax: 100,
};

interface Props {
  filtros: FiltrosSeguimiento;
  onChange: (f: FiltrosSeguimiento) => void;
  onLimpiar: () => void;
}

export default function FiltrosSeguimiento({
  filtros,
  onChange,
  onLimpiar,
}: Props) {
  const setField = <K extends keyof FiltrosSeguimiento>(
    key: K,
    value: FiltrosSeguimiento[K]
  ) => onChange({ ...filtros, [key]: value });

  const inputBase =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-2">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Buscar organizacion
        </label>
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filtros.organizacion}
            onChange={(e) => setField("organizacion", e.target.value)}
            placeholder="Buscar por nombre o direccion..."
            className={`${inputBase} pl-9`}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Conformidad minima (%)
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={filtros.conformidadMin}
          onChange={(e) => setField("conformidadMin", Number(e.target.value))}
          className={inputBase}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Conformidad maxima (%)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={filtros.conformidadMax}
            onChange={(e) => setField("conformidadMax", Number(e.target.value))}
            className={inputBase}
          />
          <button
            type="button"
            onClick={onLimpiar}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            title="Limpiar filtros"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
