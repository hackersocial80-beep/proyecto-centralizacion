import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info as InfoIcon,
  Package,
  Save,
} from "lucide-react";
import { useDonaciones } from "../../services/donacionStore";
import {
  ESTADOS_CRITERIO,
  ESTADOS_EVALUACION,
  EVALUACION_VACIA,
  resumenParaCalidad,
  type CalidadRecord,
  type CriterioCalidad,
  type EstadoCriterio,
  type EstadoEvaluacion,
} from "../../types/calidad";

interface Props {
  onVolver: () => void;
}

// Store ligero en memoria: evaluaciones por donacionId.
let cache: Record<string, CalidadRecord> = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const calidadStore = {
  get: (id: string) => cache[id],
  getAll: () => cache,
  upsert: (id: string, value: CalidadRecord) => {
    cache = { ...cache, [id]: value };
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const formatDate = (iso: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
};

const estadoColor: Record<EstadoCriterio, string> = {
  Aprobado: "bg-emerald-50 text-emerald-700 border-emerald-300",
  "Aprobado con observacion": "bg-amber-50 text-amber-700 border-amber-300",
  Rechazado: "bg-red-50 text-red-700 border-red-300",
};

const estadoIcon = (e: EstadoCriterio) => {
  if (e === "Aprobado") return <CheckCircle2 className="h-4 w-4" />;
  if (e === "Aprobado con observacion")
    return <AlertCircle className="h-4 w-4" />;
  return <AlertCircle className="h-4 w-4" />;
};

export default function CalidadPage({ onVolver }: Props) {
  const donaciones = useDonaciones();

  // Lista de donaciones evaluables
  const lista = useMemo(() => donaciones, [donaciones]);

  const [donacionId, setDonacionId] = useState<string>(
    lista[0]?.id ?? ""
  );

  // Si cambia la lista y la seleccionada desaparece, caemos al primero
  useEffect(() => {
    if (!lista.find((d) => d.id === donacionId)) {
      setDonacionId(lista[0]?.id ?? "");
    }
  }, [lista, donacionId]);

  const donacion = lista.find((d) => d.id === donacionId);
  const resumen = donacion ? resumenParaCalidad(donacion) : null;

  const [puntos, setPuntos] = useState(EVALUACION_VACIA.puntos);
  const [ubicacionRecojo, setUbicacionRecojo] = useState(
    EVALUACION_VACIA.ubicacionRecojo
  );
  const [estadoGeneral, setEstadoGeneral] = useState<EstadoEvaluacion>(
    EVALUACION_VACIA.estadoGeneral
  );
  const [observacionesGenerales, setObservacionesGenerales] = useState("");
  const [condiciones, setCondiciones] = useState(EVALUACION_VACIA.condiciones);
  const [restriccionesDonante, setRestriccionesDonante] = useState("");

  // Cargar evaluacion existente al cambiar de donacion
  useEffect(() => {
    if (!donacionId) return;
    const existente = calidadStore.get(donacionId);
    if (existente) {
      setPuntos(existente.puntos);
      setUbicacionRecojo(existente.ubicacionRecojo);
      setEstadoGeneral(existente.estadoGeneral);
      setObservacionesGenerales(existente.observacionesGenerales);
      setCondiciones(existente.condiciones);
      setRestriccionesDonante(existente.restriccionesDonante);
    } else {
      setPuntos(EVALUACION_VACIA.puntos);
      setUbicacionRecojo(EVALUACION_VACIA.ubicacionRecojo);
      setEstadoGeneral(EVALUACION_VACIA.estadoGeneral);
      setObservacionesGenerales("");
      setCondiciones(EVALUACION_VACIA.condiciones);
      setRestriccionesDonante("");
    }
  }, [donacionId]);

  const setPunto = (
    criterio: CriterioCalidad,
    patch: Partial<{ estado: EstadoCriterio; observacion: string }>
  ) => {
    setPuntos((prev) =>
      prev.map((p) =>
        p.criterio === criterio ? { ...p, ...patch } : p
      )
    );
  };

  const guardar = () => {
    if (!donacionId || !donacion) {
      alert("Selecciona una donacion para guardar la evaluacion.");
      return;
    }
    const record: CalidadRecord = {
      donacionId,
      puntos,
      ubicacionRecojo,
      estadoGeneral,
      observacionesGenerales,
      condiciones,
      restriccionesDonante,
    };
    calidadStore.upsert(donacionId, record);
    alert("Evaluacion de calidad guardada.");
  };

  const inputBase =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20";

  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      {/* Cabecera + selector */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
            Seguimiento · Calidad
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Evaluacion de calidad
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onVolver}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Volver a seguimiento
          </button>
          <button
            type="button"
            onClick={guardar}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-md active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(90deg, #5cb89a 0%, #7dc8ad 50%, #a0d8c0 100%)",
            }}
          >
            <Save className="h-4 w-4" />
            Guardar evaluacion
          </button>
        </div>
      </div>

      {/* Selector de donacion */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="mb-1.5 block text-xs font-medium text-gray-600">
          Donacion a evaluar
        </label>
        <select
          value={donacionId}
          onChange={(e) => setDonacionId(e.target.value)}
          className={inputBase}
        >
          <option value="">Seleccionar...</option>
          {lista.map((d) => (
            <option key={d.id} value={d.id}>
              {d.codigo} - {d.donante}
            </option>
          ))}
        </select>
      </div>

      {!donacion || !resumen ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          Selecciona una donacion para iniciar la evaluacion de calidad.
        </div>
      ) : (
        <>
          {/* Informacion de la donacion */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <InfoIcon className="h-4 w-4 text-[#5cb89a]" />
              Informacion de la donacion
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Codigo de intencion" value={resumen.codigo} mono />
              <Info label="Donante" value={resumen.donante} />
              <Info
                label="Fecha de intencion"
                value={formatDate(resumen.fechaIntencion)}
              />
              <Info label="Canal" value={resumen.canal} />
            </div>
          </section>

          {/* Evaluacion de calidad */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <ClipboardList className="h-4 w-4 text-[#5cb89a]" />
              Evaluacion de calidad
            </h2>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Punto a evaluar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Documentacion del producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Observacion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {puntos.map((p) => (
                    <tr key={p.criterio}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {p.criterio}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {ESTADOS_CRITERIO.map((estado) => {
                            const activo = p.estado === estado;
                            return (
                              <button
                                key={estado}
                                type="button"
                                onClick={() =>
                                  setPunto(p.criterio, { estado })
                                }
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                  activo
                                    ? estadoColor[estado]
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                {activo && estadoIcon(estado)}
                                {estado}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={p.observacion ?? ""}
                          onChange={(e) =>
                            setPunto(p.criterio, {
                              observacion: e.target.value,
                            })
                          }
                          placeholder="Nota opcional..."
                          className={inputBase}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ubicacion de recojo */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Building2 className="h-4 w-4 text-[#5cb89a]" />
              Ubicacion de recojo
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Direccion
                </label>
                <input
                  type="text"
                  value={ubicacionRecojo.direccion}
                  onChange={(e) =>
                    setUbicacionRecojo((u) => ({
                      ...u,
                      direccion: e.target.value,
                    }))
                  }
                  placeholder="Calle / avenida / numero"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Distrito
                </label>
                <input
                  type="text"
                  value={ubicacionRecojo.distrito}
                  onChange={(e) =>
                    setUbicacionRecojo((u) => ({
                      ...u,
                      distrito: e.target.value,
                    }))
                  }
                  placeholder="Distrito"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Provincia
                </label>
                <input
                  type="text"
                  value={ubicacionRecojo.provincia}
                  onChange={(e) =>
                    setUbicacionRecojo((u) => ({
                      ...u,
                      provincia: e.target.value,
                    }))
                  }
                  placeholder="Provincia"
                  className={inputBase}
                />
              </div>
            </div>
          </section>

          {/* Estado de la informacion */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <CheckCircle2 className="h-4 w-4 text-[#5cb89a]" />
              Estado de la informacion
            </h2>
            <p className="mb-3 text-xs text-gray-500">
              Selecciona el estado global de la evaluacion. Esta accion
              resumen el resultado de los puntos evaluados.
            </p>
            <div className="flex flex-wrap gap-2">
              {ESTADOS_EVALUACION.map((estado) => {
                const activo = estadoGeneral === estado;
                return (
                  <button
                    key={estado}
                    type="button"
                    onClick={() => setEstadoGeneral(estado)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      activo
                        ? estadoColor[estado]
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {activo && estadoIcon(estado)}
                    {estado}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Observaciones generales */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <FileText className="h-4 w-4 text-[#5cb89a]" />
              Observaciones generales
            </h2>
            <textarea
              rows={4}
              value={observacionesGenerales}
              onChange={(e) => setObservacionesGenerales(e.target.value)}
              placeholder="Notas, comentarios o condiciones adicionales sobre la donacion..."
              className={inputBase}
            />
          </section>

          {/* Condiciones del producto */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Package className="h-4 w-4 text-[#5cb89a]" />
              Condiciones del producto
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Condicion del producto
                </label>
                <input
                  type="text"
                  value={condiciones.condicion}
                  onChange={(e) =>
                    setCondiciones((c) => ({
                      ...c,
                      condicion: e.target.value,
                    }))
                  }
                  placeholder="Bueno / Regular / Deficiente..."
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Vida util promedio
                </label>
                <input
                  type="text"
                  value={condiciones.vidaUtilPromedio}
                  onChange={(e) =>
                    setCondiciones((c) => ({
                      ...c,
                      vidaUtilPromedio: e.target.value,
                    }))
                  }
                  placeholder="Ej. 60 dias / 2026-12-31"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Almacenamiento del producto
                </label>
                <input
                  type="text"
                  value={condiciones.almacenamiento}
                  onChange={(e) =>
                    setCondiciones((c) => ({
                      ...c,
                      almacenamiento: e.target.value,
                    }))
                  }
                  placeholder="Refrigerado / Congelado / Almacen general..."
                  className={inputBase}
                />
              </div>
            </div>
          </section>

          {/* Restricciones del donante */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <AlertCircle className="h-4 w-4 text-[#5cb89a]" />
              Restricciones del donante
            </h2>
            <textarea
              rows={3}
              value={restriccionesDonante}
              onChange={(e) => setRestriccionesDonante(e.target.value)}
              placeholder="Restricciones, condiciones especiales o acuerdos pactados con el donante..."
              className={inputBase}
            />
          </section>
        </>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={`text-sm text-gray-900 ${
          mono ? "font-mono font-semibold" : "font-medium"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}
