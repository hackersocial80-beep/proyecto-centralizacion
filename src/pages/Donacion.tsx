import { useMemo, useState } from "react";
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

interface Props {
  onNuevaIntencion: () => void;
}

export default function DonacionPage({
  onNuevaIntencion,
}: Props) {
  const donaciones = useDonaciones();
  const [filtros, setFiltros] = useState<FiltrosDonacion>(
    FILTROS_DONACION_VACIOS
  );
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase();
    return donaciones.filter((d) => {
      if (filtros.canal && d.canal !== filtros.canal) return false;
      if (filtros.estado && d.estadoDonacion !== filtros.estado) return false;
      if (
        filtros.fechaIntencion &&
        d.fechaIntencion !== filtros.fechaIntencion
      )
        return false;
      if (filtros.origen && d.origen !== filtros.origen) return false;
      if (filtros.tipoProceso && d.tipoProceso !== filtros.tipoProceso)
        return false;
      if (filtros.tipoIntencion && d.tipoIntencion !== filtros.tipoIntencion)
        return false;
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
  }, [donaciones, filtros]);

  const resumen = useMemo(() => resumenDonaciones(filtradas), [filtradas]);

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
    a.download = `donaciones-${new Date().toISOString().slice(0, 10)}.csv`;
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
