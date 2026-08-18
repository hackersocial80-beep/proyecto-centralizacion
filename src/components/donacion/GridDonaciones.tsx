import { Eye } from "lucide-react";
import type { Donacion, EstadoDonacion } from "../../types/donacion";

interface Props {
  donaciones: Donacion[];
  onDetalle: (id: string) => void;
}

const estadoStyles: Record<EstadoDonacion, string> = {
  Pendiente: "bg-gray-100 text-gray-700 border-gray-200",
  "En evaluacion": "bg-sky-50 text-sky-700 border-sky-200",
  "En coordinacion": "bg-violet-50 text-violet-700 border-violet-200",
  "En operacion": "bg-amber-50 text-amber-700 border-amber-200",
  Completado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rechazado: "bg-red-50 text-red-700 border-red-200",
};

export default function GridDonaciones({ donaciones, onDetalle }: Props) {
  if (donaciones.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <p className="text-sm text-gray-500">
          No hay donaciones que coincidan con los filtros aplicados.
        </p>
      </div>
    );
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Codigo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Donante
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Productos
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Fecha intencion
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Canal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Tipo producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Estado actual
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Responsable
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {donaciones.map((d) => {
              const tipos = Array.from(
                new Set(d.productos.map((p) => p.tipoProducto))
              ).join(", ");
              const productosTxt =
                d.productos.length > 0
                  ? d.productos
                      .map((p) => `${p.producto} (${p.cantidad} ${p.unidad})`)
                      .join(" - ")
                  : "Sin productos";
              return (
                <tr key={d.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                    {d.codigo}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {d.donante}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="line-clamp-2 max-w-[280px]">
                      {productosTxt}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(d.fechaIntencion)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{d.canal}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{tipos || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        estadoStyles[d.estadoDonacion]
                      }`}
                    >
                      {d.estadoDonacion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {d.responsable}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onDetalle(d.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#5cb89a]/40 bg-white px-3 py-1.5 text-xs font-medium text-[#5cb89a] transition-colors hover:bg-[#5cb89a]/10"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
