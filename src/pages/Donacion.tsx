import { useEffect, useMemo, useState } from "react";
import ResumenDonacion from "../components/donacion/ResumenDonacion";
import FiltrosDonacionBar from "../components/donacion/FiltrosDonacion";
import GridDonaciones from "../components/donacion/GridDonaciones";
import DetalleDonacion from "../components/donacion/DetalleDonacion";
import {
  FILTROS_DONACION_VACIOS,
  type Donacion,
  type FiltrosDonacion,
} from "../types/donacion";
import {
  resumenDonaciones,
  useDonaciones,
} from "../services/donacionStore";
import { intencionStore } from "../services/intencionStore";
import { getIntenciones } from "../services/intencionService";
import { catalogStore, useCatalogs } from "../services/catalogStore";
import { getLocalDateISO } from "../utils/date";

const normalizeCatalogValue = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

const matchesCatalog = (
  selectedId: string,
  items: Array<{ id: string; name: string }>,
  value: string
) => {
  if (!selectedId) return true;
  const selected = items.find((item) => item.id === selectedId);
  return value === selectedId || normalizeCatalogValue(value) === normalizeCatalogValue(selected?.name ?? "");
};

interface Props {
  onNuevaIntencion: () => void;
}

export default function DonacionPage({
  onNuevaIntencion,
}: Props) {
  const donaciones = useDonaciones();
  const catalogs = useCatalogs();
  const [filtros, setFiltros] = useState<FiltrosDonacion>(
    FILTROS_DONACION_VACIOS
  );
  const [detalleId, setDetalleId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await catalogStore.loadCatalogs();
      try {
        const data = await getIntenciones();
        if (active) intencionStore.setAll(data);
      } catch (error) {
        console.error("Error cargando intenciones para Donaciones:", error);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const filtradas = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase();
    return donaciones.filter((d) => {
      if (!matchesCatalog(filtros.canal, catalogs.canales, d.canal)) return false;
      if (filtros.estado && d.estadoDonacion !== filtros.estado) return false;
      if (filtros.fechaIntencion && d.fechaIntencion !== filtros.fechaIntencion) return false;
      if (!matchesCatalog(filtros.origen, catalogs.procedencias, d.origen)) return false;
      if (!matchesCatalog(filtros.tipoProceso, catalogs.tiposProceso, d.tipoProceso)) return false;
      if (!matchesCatalog(filtros.tipoIntencion, catalogs.tiposIntencion, d.tipoIntencion)) return false;
      if (filtros.responsable && d.responsable !== filtros.responsable)
        return false;
      if (q) {
        const productosTxt = d.productos
          .map((p) => p.producto)
          .join(" ")
          .toLowerCase();
        const haystack = `${d.codigo} ${d.donante} ${productosTxt}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [donaciones, filtros, catalogs.canales, catalogs.procedencias, catalogs.tiposProceso, catalogs.tiposIntencion]);

  const resumen = useMemo(() => resumenDonaciones(donaciones), [donaciones]);

  const exportar = () => {
    const headers = [
      "Codigo",
      "Donante",
      "Fecha intencion",
      "Canal",
      "Estado",
      "Origen",
      "Tipo proceso",
      "Responsable",
      "Productos",
    ];
    const rows = filtradas.map((d) => [
      d.codigo,
      d.donante,
      d.fechaIntencion,
      d.canal,
      d.estadoDonacion,
      d.origen,
      d.tipoProceso,
      d.responsable,
      d.productos
        .map((p) => `${p.producto} (${p.cantidad} ${p.unidad})`)
        .join(" | "),
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donaciones-${getLocalDateISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const detalle: Donacion | null = detalleId
    ? donaciones.find((d) => d.id === detalleId) ?? null
    : null;

  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
          Modulo de donacion
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Donaciones</h1>
      </div>

      {/* Resumen */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Resumen</h2>
        <ResumenDonacion resumen={resumen} />
      </section>

      {/* Filtros + acciones */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <FiltrosDonacionBar
          filtros={filtros}
          canales={catalogs.canales}
          origenes={catalogs.procedencias}
          tiposProceso={catalogs.tiposProceso}
          tiposIntencion={catalogs.tiposIntencion}
          onChange={setFiltros}
          onExportar={exportar}
          onNuevaIntencion={onNuevaIntencion}
        />
      </section>

      {/* Grid */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">
            Listado ({filtradas.length})
          </h2>
        </div>
        <GridDonaciones
          donaciones={filtradas}
          onDetalle={(id) => setDetalleId(id)}
        />
      </section>

      {detalle && <DetalleDonacion donacion={detalle} onCerrar={() => setDetalleId(null)} />}
    </div>
  );
}
