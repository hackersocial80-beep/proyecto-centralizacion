import { Download, RotateCcw, Search } from "lucide-react";
import {
  CANALES,
  ESTADOS_DONACION,
  ORIGENES,
  RESPONSABLES,
  TIPOS_INTENCION,
  TIPOS_PROCESO,
  type FiltrosDonacion,
} from "../../types/donacion";

interface Props {
  filtros: FiltrosDonacion;
  onChange: (f: FiltrosDonacion) => void;
  onExportar: () => void;
  onNuevaIntencion: () => void;
}

export default function FiltrosDonacionBar({
  filtros,
  onChange,
  onExportar,
  onNuevaIntencion,
}: Props) {
  const setField = <K extends keyof FiltrosDonacion>(
    key: K,
    value: FiltrosDonacion[K]
  ) => onChange({ ...filtros, [key]: value });

  const limpiar = () => onChange({
    busqueda: "",
    canal: "",
    estado: "",
    fechaIntencion: "",
    origen: "",
    tipoProceso: "",
    tipoIntencion: "",
    responsable: "",
  });

  const inputBase =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={filtros.busqueda}
            onChange={(e) => setField("busqueda", e.target.value)}
            placeholder="Buscar por codigo, donante o producto..."
            className={`${inputBase} pl-9`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportar}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button
            type="button"
            onClick={onNuevaIntencion}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-md active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(90deg, #5cb89a 0%, #7dc8ad 50%, #a0d8c0 100%)",
            }}
          >
            + Nueva intencion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Canal
          </label>
          <select
            value={filtros.canal}
            onChange={(e) => setField("canal", e.target.value as FiltrosDonacion["canal"])}
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
            Estado
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => setField("estado", e.target.value as FiltrosDonacion["estado"])}
            className={inputBase}
          >
            <option value="">Todos</option>
            {ESTADOS_DONACION.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
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
            Origen
          </label>
          <select
            value={filtros.origen}
            onChange={(e) => setField("origen", e.target.value as FiltrosDonacion["origen"])}
            className={inputBase}
          >
            <option value="">Todos</option>
            {ORIGENES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de proceso
          </label>
          <select
            value={filtros.tipoProceso}
            onChange={(e) => setField("tipoProceso", e.target.value as FiltrosDonacion["tipoProceso"])}
            className={inputBase}
          >
            <option value="">Todos</option>
            {TIPOS_PROCESO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de intencion
          </label>
          <select
            value={filtros.tipoIntencion}
            onChange={(e) => setField("tipoIntencion", e.target.value as FiltrosDonacion["tipoIntencion"])}
            className={inputBase}
          >
            <option value="">Todos</option>
            {TIPOS_INTENCION.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Responsable
          </label>
          <div className="flex gap-2">
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
