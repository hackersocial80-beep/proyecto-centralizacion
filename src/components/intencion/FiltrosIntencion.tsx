import { Filter, RotateCcw } from "lucide-react";
import {
  CANALES,
  FILTROS_VACIOS,
  RESPONSABLES,
  TIPOS_INTENCION,
  type FiltrosIntencion,
} from "../../types/intencion";

interface Props {
  filtros: FiltrosIntencion;
  onChange: (f: FiltrosIntencion) => void;
  onNuevaIntencion: () => void;
}

export default function FiltrosIntencionBar({
  filtros,
  onChange,
  onNuevaIntencion,
}: Props) {
  const setField = <K extends keyof FiltrosIntencion>(
    key: K,
    value: FiltrosIntencion[K]
  ) => onChange({ ...filtros, [key]: value });

  const limpiar = () => onChange(FILTROS_VACIOS);

  const inputBase =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#5cb89a]" />
          <h3 className="text-sm font-semibold text-gray-800">Filtros</h3>
        </div>

        <button
          type="button"
          onClick={onNuevaIntencion}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-md active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(90deg, #5cb89a 0%, #7dc8ad 50%, #a0d8c0 100%)",
          }}
        >
          + Nueva intencion
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Filtrar donante
          </label>
          <input
            type="text"
            value={filtros.donante}
            onChange={(e) => setField("donante", e.target.value)}
            placeholder="Ej. Alicorp"
            className={inputBase}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Contacto
          </label>
          <input
            type="text"
            value={filtros.contacto}
            onChange={(e) => setField("contacto", e.target.value)}
            placeholder="Correo o telefono"
            className={inputBase}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Fecha de intencion
          </label>
          <input
            type="date"
            value={filtros.fechaIntencion}
            onChange={(e) => setField("fechaIntencion", e.target.value)}
            className={inputBase}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Canal
          </label>
          <select
            value={filtros.canal}
            onChange={(e) =>
              setField("canal", e.target.value as FiltrosIntencion["canal"])
            }
            className={inputBase}
          >
            <option value="">Todos</option>
            {CANALES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Responsable
          </label>
          <select
            value={filtros.responsable}
            onChange={(e) => setField("responsable", e.target.value)}
            className={inputBase}
          >
            <option value="">Todos</option>
            {RESPONSABLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de intencion
          </label>
          <div className="flex gap-2">
            <select
              value={filtros.tipoIntencion}
              onChange={(e) =>
                setField(
                  "tipoIntencion",
                  e.target.value as FiltrosIntencion["tipoIntencion"]
                )
              }
              className={inputBase}
            >
              <option value="">Todos</option>
              {TIPOS_INTENCION.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              title="Limpiar filtros"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
