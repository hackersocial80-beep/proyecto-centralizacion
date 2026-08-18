import { Check, FileText, MapPin, Package, Phone, User, X } from "lucide-react";
import type { Donacion } from "../../types/donacion";
import { ETAPAS_KEY, ETAPAS_PROCESO, TIPOS_DOCUMENTO } from "../../types/donacion";
import { donacionStore } from "../../services/donacionStore";

interface Props {
  donacion: Donacion;
  onCerrar: () => void;
}

const urgenciaColor: Record<string, string> = {
  Baja: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Media: "bg-sky-50 text-sky-700 border-sky-200",
  Alta: "bg-amber-50 text-amber-700 border-amber-200",
  Critica: "bg-red-50 text-red-700 border-red-200",
};

const compatibilidadColor: Record<string, string> = {
  Alta: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Media: "bg-amber-50 text-amber-700 border-amber-200",
  Baja: "bg-orange-50 text-orange-700 border-orange-200",
  "No compatible": "bg-red-50 text-red-700 border-red-200",
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

export default function DetalleDonacion({ donacion, onCerrar }: Props) {
  const totalEstimado = donacion.productos.reduce(
    (acc, p) => acc + p.pesoEstimadoKg,
    0
  );

  const documentosLabel = Object.fromEntries(
    TIPOS_DOCUMENTO.map((d) => [d.key, d.label])
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
              Detalle de donacion
            </p>
            <h2 className="mt-1 flex items-center gap-3 text-2xl font-bold text-gray-900">
              <span className="font-mono text-base font-semibold">
                {donacion.codigo}
              </span>
              <span className="rounded-full bg-[#5cb89a]/10 px-2.5 py-0.5 text-xs font-semibold text-[#5cb89a]">
                {donacion.estadoDonacion}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${urgenciaColor[donacion.urgencia]}`}
              >
                Urgencia: {donacion.urgencia}
              </span>
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Fecha de intencion:{" "}
              <span className="font-medium">{formatDate(donacion.fechaIntencion)}</span>{" "}
              - Canal:{" "}
              <span className="font-medium">{donacion.canal}</span>{" "}
              - Origen:{" "}
              <span className="font-medium">{donacion.origen}</span>
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
          {/* Informacion general */}
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <User className="h-4 w-4 text-[#5cb89a]" />
              Informacion general
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info label="Donante" value={donacion.donante} />
              <Info label="Contacto" value={donacion.contacto} />
              <Info
                label="Telefono"
                value={donacion.telefono}
                icon={<Phone className="h-3.5 w-3.5" />}
              />
              <Info
                label="Direccion"
                value={donacion.direccion}
                icon={<MapPin className="h-3.5 w-3.5" />}
              />
              <Info label="Condicion del producto" value={donacion.condicionProducto} />
              <Info
                label="Condicion del almacenamiento"
                value={donacion.condicionAlmacenamiento}
              />
              <Info
                label="Vida util del producto"
                value={
                  donacion.productos.length > 0
                    ? `Hasta ${formatDate(
                        donacion.productos
                          .map((p) => p.vidaUtil)
                          .sort()
                          .reverse()[0] ?? ""
                      )}`
                    : "-"
                }
              />
              <Info
                label="Urgencia"
                value={donacion.urgencia}
                chipColor={urgenciaColor[donacion.urgencia]}
              />
            </div>
            {donacion.observaciones && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Observaciones
                </p>
                {donacion.observaciones}
              </div>
            )}
          </section>

          {/* Datos del producto */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Package className="h-4 w-4 text-[#5cb89a]" />
              Datos del producto
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                      Descripcion
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-600">
                      Cantidad
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                      Unidad
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-600">
                      Peso (kg)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donacion.productos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-6 text-center text-sm text-gray-500"
                      >
                        Sin productos registrados.
                      </td>
                    </tr>
                  ) : (
                    donacion.productos.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {p.producto}
                          <p className="text-xs text-gray-500">{p.descripcion}</p>
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900">
                          {p.cantidad}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700">
                          {p.unidad}
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-gray-700">
                          {p.pesoEstimadoKg.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Total estimado
                    </td>
                    <td className="px-3 py-2 text-right text-base font-bold text-[#5cb89a]">
                      {totalEstimado.toFixed(2)} kg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Organizacion asignada */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <MapPin className="h-4 w-4 text-[#5cb89a]" />
              Organizacion asignada
            </h3>
            {donacion.organizacion ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Info label="Nombre" value={donacion.organizacion.nombre} />
                <Info
                  label="Direccion"
                  value={donacion.organizacion.direccion}
                />
                <Info
                  label="Compatibilidad"
                  value={donacion.organizacion.compatibilidad}
                  chipColor={
                    compatibilidadColor[donacion.organizacion.compatibilidad]
                  }
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Aun no se asigno una organizacion.
              </p>
            )}
          </section>

          {/* Documentos */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <FileText className="h-4 w-4 text-[#5cb89a]" />
              Documentos
            </h3>
            <ul className="space-y-2">
              {donacion.documentosDonacion.map((doc) => (
                <li
                  key={doc.tipo}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        donacionStore.toggleDocumento(donacion.id, doc.tipo)
                      }
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        doc.cargado
                          ? "border-[#5cb89a] bg-[#5cb89a] text-white"
                          : "border-gray-300 bg-white text-transparent hover:border-[#5cb89a]"
                      }`}
                      aria-label={
                        doc.cargado
                          ? `Quitar ${documentosLabel[doc.tipo]}`
                          : `Marcar ${documentosLabel[doc.tipo]} como cargado`
                      }
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {documentosLabel[doc.tipo]}
                      </p>
                      {doc.cargado ? (
                        <p className="text-xs text-gray-500">
                          {doc.nombre}
                          {doc.fechaCarga
                            ? ` - Cargado el ${formatDate(doc.fechaCarga)}`
                            : ""}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">Pendiente de carga</p>
                      )}
                    </div>
                  </div>
                  {doc.cargado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <Check className="h-3 w-3" />
                      Cargado
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Checklist de etapas */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Check className="h-4 w-4 text-[#5cb89a]" />
              Estados del proceso
            </h3>
            <ol className="space-y-2">
              {ETAPAS_PROCESO.map((etapa, idx) => {
                const item = donacion.checklist.find((c) => c.etapa === etapa);
                const done = item?.completado ?? false;
                const key = ETAPAS_KEY[etapa];
                return (
                  <li
                    key={etapa}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors ${
                      done
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => donacionStore.toggleEtapa(donacion.id, key)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-300 bg-white text-transparent hover:border-emerald-500"
                      }`}
                      aria-label={`Marcar ${etapa}`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          done ? "text-emerald-800" : "text-gray-800"
                        }`}
                      >
                        {etapa}
                      </p>
                      {item?.fecha && (
                        <p className="text-xs text-gray-500">
                          Completado el {formatDate(item.fecha)}
                        </p>
                      )}
                    </div>
                    {done && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <Check className="h-3 w-3" />
                        Completado
                      </span>
                    )}
                  </li>
                );
              })}
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

function Info({
  label,
  value,
  icon,
  chipColor,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  chipColor?: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      {chipColor ? (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium ${chipColor}`}
        >
          {icon}
          {value}
        </span>
      ) : (
        <div className="flex items-center gap-1.5 text-sm text-gray-900">
          {icon}
          <span>{value}</span>
        </div>
      )}
    </div>
  );
}
