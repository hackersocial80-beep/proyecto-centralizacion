import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import FiltrosIntencionBar from "../components/intencion/FiltrosIntencion";
import DetalleIntencion from "../components/intencion/DetalleIntencion";
import {
  FILTROS_VACIOS,
  type FiltrosIntencion,
  type Intencion,
  COMPROMISO_IDONEIDAD_INICIAL,
} from "../types/intencion";
import { useIntenciones } from "../services/intencionStore";
import { intencionStore } from "../services/intencionStore";
import { getIntenciones } from "../services/intencionService";
import { catalogStore, useCatalogs } from "../services/catalogStore";

const estadoColor: Record<Intencion["estado"], string> = {
  "": "bg-gray-50 text-gray-500 border-gray-200",
  Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  "En evaluacion": "bg-sky-50 text-sky-700 border-sky-200",
  Aprobada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rechazada: "bg-red-50 text-red-700 border-red-200",
};

const normalizeFilterValue = (value: string | undefined) =>
  (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

interface Props {
  onNuevaIntencion: () => void;
}

export default function IntencionPage({
  onNuevaIntencion,
}: Props) {
  const intenciones = useIntenciones();
  const catalogs = useCatalogs();
  const catalogoCanales = catalogs.canales;
  const latestIntentId = useRef(intenciones[0]?.id ?? null);
  const [filtros, setFiltros] = useState<FiltrosIntencion>(FILTROS_VACIOS);
  const [donanteSeleccionado, setDonanteSeleccionado] = useState<{ id: string; name: string } | null>(null);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(
    intenciones[0]?.id ?? null
  );
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      setCargando(true);
      setErrorCarga("");
      try {
        await catalogStore.loadCatalogs();
        const data = await getIntenciones();
        if (activo) intencionStore.setAll(data);
      } catch (error) {
        console.error("Error cargando intenciones desde GetIntents:", error);
        if (activo) {
          setErrorCarga("No se pudo cargar el listado desde el servidor. Verifica tu sesión e intenta actualizar.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    };
    void cargar();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    const newestId = intenciones[0]?.id;
    if (newestId && newestId !== latestIntentId.current) {
      latestIntentId.current = newestId;
      setSeleccionadaId(newestId);
    }
  }, [intenciones]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return intenciones.filter((i) => {
      if (filtros.donante) {
        const selectedSupplier = catalogs.proveedores.find((supplier) => supplier.id === filtros.donante)
          ?? (donanteSeleccionado?.id === filtros.donante ? donanteSeleccionado : null);
        const donorValue = i.donante.trim().toLowerCase();
        if (
          donorValue !== filtros.donante.trim().toLowerCase() &&
          donorValue !== selectedSupplier?.name.trim().toLowerCase()
        ) return false;
      }
      if (filtros.contacto && !i.contacto.toLowerCase().includes(filtros.contacto.toLowerCase()))
        return false;
      if (filtros.fechaIntencion && i.fechaIntencion !== filtros.fechaIntencion)
        return false;
      if (filtros.canal) {
        const selectedOrigin = catalogoCanales.find((origin) => origin.id === filtros.canal);
        const selectedValues = [filtros.canal, selectedOrigin?.name].map(normalizeFilterValue);
        if (!selectedValues.includes(normalizeFilterValue(i.canal))) return false;
      }
      if (filtros.responsable && i.responsable !== filtros.responsable)
        return false;
      if (filtros.tipoIntencion) {
        const selectedType = catalogs.tiposIntencion.find((item) => item.id === filtros.tipoIntencion);
        if (i.tipoIntencion !== filtros.tipoIntencion && i.tipoIntencion !== selectedType?.name) return false;
      }
      if (
        q &&
        !`${i.codigo} ${i.donante} ${i.contacto}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [intenciones, filtros, busqueda, catalogoCanales, catalogs.proveedores, catalogs.tiposIntencion, donanteSeleccionado]);

  useEffect(() => {
    if (seleccionadaId && !filtradas.some((intencion) => intencion.id === seleccionadaId)) {
      setSeleccionadaId(filtradas[0]?.id ?? null);
    }
  }, [filtradas, seleccionadaId]);

  const seleccionada = useMemo(
    () => filtradas.find((i) => i.id === seleccionadaId) ?? filtradas[0] ?? null,
    [seleccionadaId, filtradas]
  );
  const calidadSeleccionada = seleccionada?.calidad;
  const canalVisible = seleccionada
    ? catalogoCanales.find((origin) =>
        normalizeFilterValue(origin.id) === normalizeFilterValue(seleccionada.canal) ||
        normalizeFilterValue(origin.name) === normalizeFilterValue(seleccionada.canal)
      )?.name ?? seleccionada.canal
    : "";

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
          origins={catalogoCanales}
          suppliers={catalogs.proveedores}
          selectedSupplier={donanteSeleccionado}
          onSupplierSelected={setDonanteSeleccionado}
          intentionTypes={catalogs.tiposIntencion}
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
                      }}
                      className={`flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition-colors ${activo
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
                        {i.estado && (
                          <span
                            className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${estadoColor[i.estado]}`}
                          >
                            {i.estado}
                          </span>
                        )}
                      </div>
                      <ChevronRight
                        className={`mt-1 h-4 w-4 shrink-0 ${activo ? "text-[#5cb89a]" : "text-gray-400"
                          }`}
                      />
                    </button>
                  </li>
                );
              })}
              {filtradas.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-gray-500">
                  {cargando ? "Cargando intenciones..." : errorCarga || "No hay intenciones que coincidan con los filtros."}
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
                    <span className="font-medium">{canalVisible}</span>{" "}
                    - Responsable:{" "}
                    <span className="font-medium">
                      {seleccionada.responsable}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${estadoColor[seleccionada.estado]}`}
                  >
                    {seleccionada.estado
                      ? `${seleccionada.estado} - ${seleccionada.tipoIntencion}`
                      : seleccionada.tipoIntencion}
                  </span>
                  <p className="text-sm font-bold text-gray-900">
                    Fecha de intención: {seleccionada.fechaIntencion || "Sin especificar"}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <DetalleIntencion
                    motivoDonacion={calidadSeleccionada?.motivoDonacion ?? (seleccionada as any).motivoDonacion ?? ""}
                    donanteIntencion={seleccionada.donante}
                    contactoIntencion={seleccionada.contacto}
                    compromisoIdoneidad={calidadSeleccionada?.compromisoIdoneidad ?? (seleccionada as any).compromisoIdoneidad ?? COMPROMISO_IDONEIDAD_INICIAL}
                    condicionAlmacenamiento={calidadSeleccionada?.condicionAlmacenamiento ?? (seleccionada as any).condicionAlmacenamiento ?? ""}
                    fechaEstimadaEntrega={calidadSeleccionada?.fechaEstimadaEntrega ?? (seleccionada as any).fechaEstimadaEntrega ?? ""}
                    descripcionGeneralDonacion={calidadSeleccionada?.descripcionGeneralDonacion ?? (seleccionada as any).descripcionGeneralDonacion ?? ""}
                    incluyeProductosSensibles={calidadSeleccionada?.incluyeProductosSensibles ?? (seleccionada as any).incluyeProductosSensibles ?? ""}
                    recomendacionesConsumo={calidadSeleccionada?.recomendacionesConsumo ?? (seleccionada as any).recomendacionesConsumo ?? ""}
                    condicionProducto={calidadSeleccionada?.condicionProducto ?? (seleccionada as any).condicionProducto ?? ""}
                    declaracionProducto={String(calidadSeleccionada?.declaracionProducto ?? (seleccionada as any).declaracionProducto ?? "")}
                    documentos={seleccionada.documentos ?? []}
                    fotos={seleccionada.fotos ?? []}
                    logistica={seleccionada.logistica}
                    catalogosLogistica={catalogs}
                  />
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
