import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info as InfoIcon,
  MapPin,
  Package,
  Save,
  Truck,
} from "lucide-react";
import { useDonaciones } from "../../services/donacionStore";
import {
  APROBACION_LOGISTICA_VACIA,
  DETALLE_MODOS_RECOJO,
  ESTADOS_APROBACION_LOGISTICA,
  MODOS_RECOJO,
  resumenParaLogistica,
  type AprobacionLogisticaRecord,
  type EstadoAprobacionLogistica,
  type ModoRecojo,
} from "../../types/logistica";

interface Props {
  onVolver: () => void;
}

// Store ligero en memoria: aprobaciones logisticas por donacionId.
let cache: Record<string, AprobacionLogisticaRecord> = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const logisticaStore = {
  get: (id: string) => cache[id],
  getAll: () => cache,
  upsert: (id: string, value: AprobacionLogisticaRecord) => {
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

const estadoColor: Record<EstadoAprobacionLogistica, string> = {
  Aprobado: "bg-emerald-50 text-emerald-700 border-emerald-300",
  "Aprobado con observacion": "bg-amber-50 text-amber-700 border-amber-300",
  Rechazado: "bg-red-50 text-red-700 border-red-300",
};

const estadoIcon = (e: EstadoAprobacionLogistica) => {
  if (e === "Aprobado") return <CheckCircle2 className="h-4 w-4" />;
  return <AlertCircle className="h-4 w-4" />;
};

export default function LogisticaPage({ onVolver }: Props) {
  const donaciones = useDonaciones();

  const lista = useMemo(() => donaciones, [donaciones]);

  const [donacionId, setDonacionId] = useState<string>(lista[0]?.id ?? "");

  useEffect(() => {
    if (!lista.find((d) => d.id === donacionId)) {
      setDonacionId(lista[0]?.id ?? "");
    }
  }, [lista, donacionId]);

  const donacion = lista.find((d) => d.id === donacionId);
  const resumen = donacion ? resumenParaLogistica(donacion) : null;

  const [modoRecojo, setModoRecojo] = useState<ModoRecojo | "">(
    APROBACION_LOGISTICA_VACIA.modoRecojo
  );
  const [ubicacionRecojo, setUbicacionRecojo] = useState(
    APROBACION_LOGISTICA_VACIA.ubicacionRecojo
  );
  const [resumenLogistico, setResumenLogistico] = useState(
    APROBACION_LOGISTICA_VACIA.resumen
  );
  const [aprobacion, setAprobacion] = useState(
    APROBACION_LOGISTICA_VACIA.aprobacion
  );
  const [observacionesLogistica, setObservacionesLogistica] = useState("");
  const [condiciones, setCondiciones] = useState(
    APROBACION_LOGISTICA_VACIA.condiciones
  );
  const [restriccionesDonante, setRestriccionesDonante] = useState("");

  useEffect(() => {
    if (!donacionId) return;
    const existente = logisticaStore.get(donacionId);
    if (existente) {
      setModoRecojo(existente.modoRecojo);
      setUbicacionRecojo(existente.ubicacionRecojo);
      setResumenLogistico(existente.resumen);
      setAprobacion(existente.aprobacion);
      setObservacionesLogistica(existente.observacionesLogistica);
      setCondiciones(existente.condiciones);
      setRestriccionesDonante(existente.restriccionesDonante);
    } else {
      setModoRecojo(APROBACION_LOGISTICA_VACIA.modoRecojo);
      setUbicacionRecojo(APROBACION_LOGISTICA_VACIA.ubicacionRecojo);
      setResumenLogistico(APROBACION_LOGISTICA_VACIA.resumen);
      setAprobacion({
        ...APROBACION_LOGISTICA_VACIA.aprobacion,
        fechaAprobacion: new Date().toISOString().slice(0, 10),
      });
      setObservacionesLogistica("");
      setCondiciones(APROBACION_LOGISTICA_VACIA.condiciones);
      setRestriccionesDonante("");
    }
  }, [donacionId]);

  const toggleEstadoAprobacion = (estado: EstadoAprobacionLogistica) => {
    setAprobacion((prev) => {
      const yaEsta = prev.estadosSeleccionados.includes(estado);
      return {
        ...prev,
        estadosSeleccionados: yaEsta
          ? prev.estadosSeleccionados.filter((e) => e !== estado)
          : [...prev.estadosSeleccionados, estado],
      };
    });
  };

  const guardar = () => {
    if (!donacionId || !donacion) {
      alert("Selecciona una donacion para guardar la aprobacion logistica.");
      return;
    }
    const record: AprobacionLogisticaRecord = {
      donacionId,
      modoRecojo,
      ubicacionRecojo,
      resumen: resumenLogistico,
      aprobacion,
      observacionesLogistica,
      condiciones,
      restriccionesDonante,
    };
    logisticaStore.upsert(donacionId, record);
    alert("Aprobacion logistica guardada.");
  };

  const inputBase =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20";

  const modoDetalle = useMemo(
    () => DETALLE_MODOS_RECOJO.find((m) => m.key === modoRecojo),
    [modoRecojo]
  );

  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      {/* Cabecera + selector */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
            Seguimiento · Logistica
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Formulario de aprobacion logistica
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
            Guardar aprobacion
          </button>
        </div>
      </div>

      {/* Selector de donacion */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="mb-1.5 block text-xs font-medium text-gray-600">
          Donacion a aprobar
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
          Selecciona una donacion para iniciar la aprobacion logistica.
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

          {/* Modo de recojo */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Truck className="h-4 w-4 text-[#5cb89a]" />
              Modo de recojo
            </h2>
            <p className="mb-3 text-xs text-gray-500">
              Selecciona el modo de recojo de la donacion. Cada alternativa
              muestra sus ventajas y consideraciones.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {MODOS_RECOJO.map((modo) => {
                const activo = modoRecojo === modo;
                return (
                  <button
                    key={modo}
                    type="button"
                    onClick={() => setModoRecojo(modo)}
                    className={`flex h-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                      activo
                        ? "border-[#5cb89a] bg-[#5cb89a]/5 ring-2 ring-[#5cb89a]/30"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {modo}
                      </span>
                      {activo && (
                        <CheckCircle2 className="h-4 w-4 text-[#5cb89a]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {modoDetalle && (
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Ventajas
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    {modoDetalle.ventajas.map((v) => (
                      <li key={v} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                    Consideraciones
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    {modoDetalle.consideraciones.map((c) => (
                      <li key={c} className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Ubicacion de recojo */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <MapPin className="h-4 w-4 text-[#5cb89a]" />
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

          {/* Resumen logistico */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <ClipboardList className="h-4 w-4 text-[#5cb89a]" />
              Resumen logistico
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Volumen total
                </label>
                <input
                  type="text"
                  value={resumenLogistico.volumenTotal}
                  onChange={(e) =>
                    setResumenLogistico((r) => ({
                      ...r,
                      volumenTotal: e.target.value,
                    }))
                  }
                  placeholder="Ej. 12 m3"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Peso estimado
                </label>
                <input
                  type="text"
                  value={resumenLogistico.pesoEstimado}
                  onChange={(e) =>
                    setResumenLogistico((r) => ({
                      ...r,
                      pesoEstimado: e.target.value,
                    }))
                  }
                  placeholder="Ej. 350 kg"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Cajas estimadas
                </label>
                <input
                  type="text"
                  value={resumenLogistico.cajasEstimadas}
                  onChange={(e) =>
                    setResumenLogistico((r) => ({
                      ...r,
                      cajasEstimadas: e.target.value,
                    }))
                  }
                  placeholder="Ej. 25"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Temperatura requerida
                </label>
                <input
                  type="text"
                  value={resumenLogistico.temperaturaRequerida}
                  onChange={(e) =>
                    setResumenLogistico((r) => ({
                      ...r,
                      temperaturaRequerida: e.target.value,
                    }))
                  }
                  placeholder="Ej. Refrigerado 2-8 °C"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Urgencia
                </label>
                <select
                  value={resumenLogistico.urgencia}
                  onChange={(e) =>
                    setResumenLogistico((r) => ({
                      ...r,
                      urgencia: e.target.value,
                    }))
                  }
                  className={inputBase}
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Critica">Critica</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Tiempo disponible
                </label>
                <input
                  type="text"
                  value={resumenLogistico.tiempoDisponible}
                  onChange={(e) =>
                    setResumenLogistico((r) => ({
                      ...r,
                      tiempoDisponible: e.target.value,
                    }))
                  }
                  placeholder="Ej. 24 horas"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Fecha limite sugerida
                </label>
                <input
                  type="date"
                  value={resumenLogistico.fechaLimiteSugerida}
                  onChange={(e) =>
                    setResumenLogistico((r) => ({
                      ...r,
                      fechaLimiteSugerida: e.target.value,
                    }))
                  }
                  className={inputBase}
                />
              </div>
            </div>
          </section>

          {/* Aprobacion logistica */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <CheckCircle2 className="h-4 w-4 text-[#5cb89a]" />
              Aprobacion logistica
            </h2>
            <p className="mb-3 text-xs text-gray-500">
              Marca los estados que apliquen para esta aprobacion logistica.
              Puedes seleccionar mas de uno si la donacion tiene condiciones
              mixtas.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Area responsable
                </label>
                <input
                  type="text"
                  value={aprobacion.areaResponsable}
                  onChange={(e) =>
                    setAprobacion((a) => ({
                      ...a,
                      areaResponsable: e.target.value,
                    }))
                  }
                  placeholder="Logistica"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Responsable
                </label>
                <input
                  type="text"
                  value={aprobacion.responsableNombre}
                  onChange={(e) =>
                    setAprobacion((a) => ({
                      ...a,
                      responsableNombre: e.target.value,
                    }))
                  }
                  placeholder="Nombre del responsable"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Fecha de aprobacion
                </label>
                <input
                  type="date"
                  value={aprobacion.fechaAprobacion}
                  onChange={(e) =>
                    setAprobacion((a) => ({
                      ...a,
                      fechaAprobacion: e.target.value,
                    }))
                  }
                  className={inputBase}
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">
                Estados de aprobacion
              </p>
              <div className="flex flex-wrap gap-2">
                {ESTADOS_APROBACION_LOGISTICA.map((estado) => {
                  const activo = aprobacion.estadosSeleccionados.includes(
                    estado
                  );
                  return (
                    <label
                      key={estado}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        activo
                          ? estadoColor[estado]
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={() => toggleEstadoAprobacion(estado)}
                        className="h-4 w-4 rounded border-gray-300 text-[#5cb89a] focus:ring-[#5cb89a]"
                      />
                      {activo && estadoIcon(estado)}
                      <span>{estado}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Observaciones del area de logistica */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <FileText className="h-4 w-4 text-[#5cb89a]" />
              Observaciones del area de logistica
            </h2>
            <textarea
              rows={4}
              value={observacionesLogistica}
              onChange={(e) => setObservacionesLogistica(e.target.value)}
              placeholder="Notas, comentarios o condiciones especiales identificadas por logistica..."
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
