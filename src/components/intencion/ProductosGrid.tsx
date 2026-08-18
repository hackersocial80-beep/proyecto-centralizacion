import { Trash2 } from "lucide-react";
import type { ProductoIntencion } from "../../types/intencion";
import { TIPOS_PRODUCTO, UNIDADES } from "../../types/intencion";

interface Props {
  productos: ProductoIntencion[];
  editable?: boolean;
  onDelete?: (id: string) => void;
}

export default function ProductosGrid({ productos, editable, onDelete }: Props) {
  if (productos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <p className="text-sm text-gray-500">
          Aun no hay productos registrados en esta intencion.
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
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Descripcion
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Cantidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Unidad
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Peso est. (kg)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Vida util
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Procedencia
              </th>
              {editable && <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                Acciones
              </th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {productos.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {p.producto}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <span className="line-clamp-2 max-w-[260px]">
                    {p.descripcion}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  {p.cantidad}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{p.unidad}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  {p.pesoEstimadoKg.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatDate(p.vidaUtil)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {TIPOS_PRODUCTO.includes(p.tipoProducto) ? p.tipoProducto : p.tipoProducto}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{p.procedencia}</td>
                {editable && (
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onDelete?.(p.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label={`Eliminar ${p.producto}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Catalogo auxiliar exportado por si el padre quiere agregar un producto */}
      <span className="hidden" data-unidades={UNIDADES.join(",")} />
    </div>
  );
}
