import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import FiltrosIntencionBar from "../components/intencion/FiltrosIntencion";
import ProductosGrid from "../components/intencion/ProductosGrid";
import DetalleIntencion from "../components/intencion/DetalleIntencion";
import {
  FILTROS_VACIOS,
  type FiltrosIntencion,
  type Intencion,
} from "../types/intencion";
import { useIntenciones, intencionStore } from "../services/intencionStore";

type Tab = "productos" | "detalle";

const estadoColor: Record<Intencion["estado"], string> = {
  Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  "En evaluacion": "bg-sky-50 text-sky-700 border-sky-200",
  Aprobada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rechazada: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  onNuevaIntencion: () => void;
}

export default function IntencionPage({
  onNuevaIntencion,
}: Props) {
  const intenciones = useIntenciones();
  const [filtros, setFiltros] = useState<FiltrosIntencion>(FILTROS_VACIOS);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(
    intenciones[0]?.id ?? null
  );
  const [tab, setTab] = useState<Tab>("productos");
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return intenciones.filter((i) => {
      if (filtros.donante && !i.donante.toLowerCase().includes(filtros.donante.toLowerCase()))
        return false;
      if (filtros.contacto && !i.contacto.toLowerCase().includes(filtros.contacto.toLowerCase()))
        return false;
      if (filtros.fechaIntencion && i.fechaIntencion !== filtros.fechaIntencion)
        return false;
      if (filtros.canal && i.canal !== filtros.canal) return false;
      if (filtros.responsable && i.responsable !== filtros.responsable)
        return false;
      if (filtros.tipoIntencion && i.tipoIntencion !== filtros.tipoIntencion)
        return false;
      if (
        q &&
        !`${i.codigo} ${i.donante} ${i.contacto}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [intenciones, filtros, busqueda]);

  const seleccionada = useMemo(
    () => intenciones.find((i) => i.id === seleccionadaId) ?? filtradas[0] ?? null,
    [intenciones, seleccionadaId, filtradas]
  );

  const eliminarProducto = (productoId: string) => {
    if (!seleccionada) return;
    const ok = window.confirm("¿Eliminar este producto de la intencion?");
    if (!ok) return;
    intencionStore.update(seleccionada.id, {
      productos: seleccionada.productos.filter((p) => p.id !== productoId),
    });
  };

  return (
    <div className="px-6 py-6 lg:px-10">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
          Modulo de intencion
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Intenciones</h1>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <FiltrosIntencionBar
          filtros={filtros}
          onChange={setFiltros}
          onNuevaIntencion={onNuevaIntencion}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Lista lateral */}
        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por codigo o donante..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {filtradas.length} resultado
                {filtradas.length === 1 ? "" : "s"}
              </p>
            </div>

            <ul className="max-h-[calc(100vh-380px)] min-h-[260px] overflow-y-auto divide-y divide-gray-100">
              {filtradas.map((i) => {
                const activo = seleccionada?.id === i.id;
                return (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSeleccionadaId(i.id);
                        setTab("productos");
                      }}
                      className={`flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition-colors ${
                        activo
                          ? "bg-[#5cb89a]/10 border-l-4 border-[#5cb89a]"
                          : "hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {i.donante}
                        </p>
                        <p className="text-xs text-gray-500">
                          {i.codigo} - {i.fechaIntencion}
                        </p>
                        <span
                          className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            estadoColor[i.estado]
                          }`}
                        >
                          {i.estado}
                        </span>
                      </div>
                      <ChevronRight
                        className={`mt-1 h-4 w-4 shrink-0 ${
                          activo ? "text-[#5cb89a]" : "text-gray-400"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
              {filtradas.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-gray-500">
                  No hay intenciones que coincidan con los filtros.
                </li>
              )}
            </ul>
          </div>
        </aside>

        {/* Detalle */}
        <section className="lg:col-span-8">
          {seleccionada ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {seleccionada.codigo}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900">
                    {seleccionada.donante}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {seleccionada.contacto} - Canal:{" "}
                    <span className="font-medium">{seleccionada.canal}</span>{" "}
                    - Responsable:{" "}
                    <span className="font-medium">
                      {seleccionada.responsable}
                    </span>
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${estadoColor[seleccionada.estado]}`}
                >
                  {seleccionada.estado} - {seleccionada.tipoIntencion}
                </span>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 px-5">
                <div className="-mb-px flex gap-6">
                  <button
                    type="button"
                    onClick={() => setTab("productos")}
                    className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                      tab === "productos"
                        ? "border-[#5cb89a] text-[#5cb89a]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Productos ({seleccionada.productos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("detalle")}
                    className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                      tab === "detalle"
                        ? "border-[#5cb89a] text-[#5cb89a]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Detalle
                  </button>
                </div>
              </div>

              <div className="p-5">
                {tab === "productos" ? (
                  <ProductosGrid
                    productos={seleccionada.productos}
                    editable
                    onDelete={eliminarProducto}
                  />
                ) : (
                  <DetalleIntencion
                    motivoDonacion={seleccionada.motivoDonacion ?? ""}
                    compromisoIdoneidad={seleccionada.compromisoIdoneidad ?? ""}
                    condicionAlmacenamiento={seleccionada.condicionAlmacenamiento ?? ""}
                    fechaEstimadaEntrega={seleccionada.fechaEstimadaEntrega ?? ""}
                    descripcionGeneralDonacion={seleccionada.descripcionGeneralDonacion ?? ""}
                    incluyeProductosSensibles={seleccionada.incluyeProductosSensibles ?? ""}
                    recomendacionesConsumo={seleccionada.recomendacionesConsumo ?? ""}
                    condicionProducto={seleccionada.condicionProducto ?? ""}
                    declaracionProducto={seleccionada.declaracionProducto ?? ""}
                    documentos={seleccionada.documentos}
                    fotos={seleccionada.fotos}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-sm text-gray-500">
                Selecciona una intencion de la lista para ver su detalle.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
