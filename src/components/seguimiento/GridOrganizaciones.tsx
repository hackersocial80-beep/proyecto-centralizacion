import { CheckCircle2, Clock } from "lucide-react";
import type { Organizacion } from "../../types/seguimiento";

interface Props {
  organizaciones: Organizacion[];
  onAbrir: (id: string) => void;
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

const conformidadColor = (p: number) => {
  if (p >= 85) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (p >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
};

export default function GridOrganizaciones({ organizaciones, onAbrir }: Props) {
  if (organizaciones.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <p className="text-sm text-gray-500">
          Aun no hay organizaciones con seguimiento asignado.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Organizacion
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Asignacion
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Conformidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Vencimiento del producto
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {organizaciones.map((o) => (
              <tr
                key={o.id}
                className="cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => onAbrir(o.id)}
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {o.nombre}
                  </p>
                  <p className="text-xs text-gray-500">{o.direccion}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-gray-700">
                    {o.asignacion}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full ${
                          o.conformidadPorcentaje >= 85
                            ? "bg-emerald-500"
                            : o.conformidadPorcentaje >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${o.conformidadPorcentaje}%` }}
                      />
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${conformidadColor(
                        o.conformidadPorcentaje
                      )}`}
                    >
                      {o.conformidadPorcentaje}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {formatDate(o.vencimientoProducto)}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAbrir(o.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#5cb89a]/40 bg-white px-3 py-1.5 text-xs font-medium text-[#5cb89a] hover:bg-[#5cb89a]/10"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
