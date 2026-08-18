import { useMemo, useState } from "react";
import { Download, ShieldCheck, Truck } from "lucide-react";
import GridOrganizaciones from "../components/seguimiento/GridOrganizaciones";
import DetalleSeguimiento from "../components/seguimiento/DetalleSeguimiento";
import CalidadPage from "../components/seguimiento/CalidadPage";
import LogisticaPage from "../components/seguimiento/LogisticaPage";
import FiltrosSeguimiento, {
  FILTROS_SEGUIMIENTO_VACIOS,
  type FiltrosSeguimiento as Filtros,
} from "../components/seguimiento/FiltrosSeguimiento";
import { useDonaciones } from "../services/donacionStore";
import { organizacionesDesdeDonaciones } from "../types/seguimiento";

type SubScreen = "seguimiento" | "calidad" | "logistica";

interface Props {
  initial?: SubScreen;
}

export default function SeguimientoPage({ initial = "seguimiento" }: Props) {
  const donaciones = useDonaciones();
  const [sub, setSub] = useState<SubScreen>(initial);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_SEGUIMIENTO_VACIOS);

  const organizaciones = useMemo(
    () => organizacionesDesdeDonaciones(donaciones),
    [donaciones]
  );

  const organizacionesFiltradas = useMemo(() => {
    const q = filtros.organizacion.trim().toLowerCase();
    return organizaciones.filter((o) => {
      if (q) {
        const haystack = `${o.nombre} ${o.direccion}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (o.conformidadPorcentaje < filtros.conformidadMin) return false;
      if (o.conformidadPorcentaje > filtros.conformidadMax) return false;
      return true;
    });
  }, [organizaciones, filtros]);

  const exportar = () => {
    const headers = [
      "Organizacion",
      "Direccion",
      "Asignacion",
      "Conformidad %",
      "Vencimiento",
    ];
    const rows = organizacionesFiltradas.map((o) => [
      o.nombre,
      o.direccion,
      o.asignacion,
      o.conformidadPorcentaje,
      o.vencimientoProducto,
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seguimiento-organizaciones-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (sub === "calidad") {
    return <CalidadPage onVolver={() => setSub("seguimiento")} />;
  }

  if (sub === "logistica") {
    return <LogisticaPage onVolver={() => setSub("seguimiento")} />;
  }

  const detalle = detalleId
    ? organizaciones.find((o) => o.id === detalleId) ?? null
    : null;

  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
          Modulo de seguimiento
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Seguimiento</h1>
      </div>

      {/* Acciones superiores */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Organizaciones en seguimiento
            </h2>
            <p className="text-xs text-gray-500">
              Haz clic en una fila o en "Ver detalle" para abrir el mapa de
              entrega y la linea de tiempo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportar}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button
              type="button"
              onClick={() => setSub("calidad")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5cb89a]/40 bg-white px-4 py-2 text-sm font-medium text-[#5cb89a] hover:bg-[#5cb89a]/10"
            >
              <ShieldCheck className="h-4 w-4" />
              Calidad
            </button>
            <button
              type="button"
              onClick={() => setSub("logistica")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5cb89a]/40 bg-white px-4 py-2 text-sm font-medium text-[#5cb89a] hover:bg-[#5cb89a]/10"
            >
              <Truck className="h-4 w-4" />
              Logistica
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <FiltrosSeguimiento
          filtros={filtros}
          onChange={setFiltros}
          onLimpiar={() => setFiltros(FILTROS_SEGUIMIENTO_VACIOS)}
        />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-800">
          Listado ({organizacionesFiltradas.length}
          {organizacionesFiltradas.length !== organizaciones.length &&
            ` de ${organizaciones.length}`}
          )
        </h2>
        <GridOrganizaciones
          organizaciones={organizacionesFiltradas}
          onAbrir={(id) => setDetalleId(id)}
        />
      </section>

      {detalle && (
        <DetalleSeguimiento
          organizacion={detalle}
          onCerrar={() => setDetalleId(null)}
        />
      )}
    </div>
  );
}
