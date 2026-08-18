import { Check, Clock, MapPin, Truck, X } from "lucide-react";
import type { Organizacion } from "../../types/seguimiento";

interface Props {
  organizacion: Organizacion;
  onCerrar: () => void;
}

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

export default function DetalleSeguimiento({
  organizacion,
  onCerrar,
}: Props) {
  const { bapOrigen, coordenadas } = organizacion;

  // Curva simple SVG entre origen y destino
  const midX = (bapOrigen.x + coordenadas.x) / 2;
  const midY = Math.min(bapOrigen.y, coordenadas.y) - 8;
  const pathD = `M ${bapOrigen.x} ${bapOrigen.y} Q ${midX} ${midY}, ${coordenadas.x} ${coordenadas.y}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
              Seguimiento
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {organizacion.nombre}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Asignacion:{" "}
              <span className="font-mono font-semibold">
                {organizacion.asignacion}
              </span>{" "}
              - Conformidad:{" "}
              <span className="font-semibold">
                {organizacion.conformidadPorcentaje}%
              </span>{" "}
              - Vence:{" "}
              <span className="font-semibold">
                {formatDate(organizacion.vencimientoProducto)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Mapa SVG */}
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <MapPin className="h-4 w-4 text-[#5cb89a]" />
              Mapa de entrega
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                className="h-72 w-full"
                role="img"
                aria-label="Mapa de entrega"
              >
                <defs>
                  <pattern
                    id="grid"
                    width="10"
                    height="10"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 10 0 L 0 0 0 10"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="0.3"
                    />
                  </pattern>
                  <linearGradient id="bg-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f2f7f3" />
                    <stop offset="100%" stopColor="#eaf2ec" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#bg-grad)" />
                <rect width="100" height="100" fill="url(#grid)" />
                {/* Etiquetas */}
                <text x="12" y="82" textAnchor="middle" fontSize="2.6" fill="#475569">
                  BAP Origen
                </text>
                <text
                  x={coordenadas.x}
                  y={coordenadas.y - 4}
                  textAnchor="middle"
                  fontSize="2.6"
                  fill="#0f172a"
                >
                  {organizacion.nombre}
                </text>
                {/* Curva */}
                <path
                  d={pathD}
                  stroke="#5cb89a"
                  strokeWidth="1.4"
                  fill="none"
                  strokeDasharray="3 2"
                  strokeLinecap="round"
                />
                {/* Punto origen */}
                <circle
                  cx={bapOrigen.x}
                  cy={bapOrigen.y}
                  r="2.6"
                  fill="#5cb89a"
                  stroke="white"
                  strokeWidth="0.8"
                />
                {/* Punto destino */}
                <circle
                  cx={coordenadas.x}
                  cy={coordenadas.y}
                  r="2.8"
                  fill="#0f172a"
                  stroke="white"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#5cb89a]" />
                BAP (origen)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-900" />
                Organizacion (destino)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3 w-3 text-[#5cb89a]" />
                Ruta planificada
              </span>
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Clock className="h-4 w-4 text-[#5cb89a]" />
              Linea de tiempo del proceso
            </h3>
            <ol className="relative space-y-4 border-l-2 border-gray-200 pl-5">
              {organizacion.timeline.map((h) => (
                <li key={h.etapa} className="relative">
                  <span
                    className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      h.completado
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-300 bg-white text-gray-300"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <div
                    className={`rounded-lg border px-4 py-3 ${
                      h.completado
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${
                          h.completado ? "text-emerald-800" : "text-gray-700"
                        }`}
                      >
                        {h.etapa}
                      </p>
                      {h.fecha ? (
                        <span className="text-xs text-gray-500">
                          {formatDate(h.fecha)}
                        </span>
                      ) : (
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                          Pendiente
                        </span>
                      )}
                    </div>
                    {h.responsable && (
                      <p className="mt-1 text-xs text-gray-600">
                        Responsable:{" "}
                        <span className="font-medium">{h.responsable}</span>
                      </p>
                    )}
                    {h.nota && (
                      <p className="mt-1 text-xs text-gray-500">{h.nota}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="flex justify-end border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
