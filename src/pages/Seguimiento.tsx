import { useEffect, useMemo, useState } from "react";
import { Download, ShieldCheck, Truck, PackageCheck, CalendarCheck, CheckCircle2 } from "lucide-react";
import GridOrganizaciones from "../components/seguimiento/GridOrganizaciones";
import DetalleSeguimiento from "../components/seguimiento/DetalleSeguimiento";
import CalidadPage from "../components/seguimiento/CalidadPage";
import LogisticaPage from "../components/seguimiento/LogisticaPage";
import DistribucionPage from "../pages/DistribucionPage";
import CoordinacionPage from "../pages/CoordinacionPage";
import CierrePage from "../pages/CierrePage";
import { getLocalDateISO } from "../utils/date";
import FiltrosSeguimiento, {
  FILTROS_SEGUIMIENTO_VACIOS,
  type FiltrosSeguimiento as Filtros,
} from "../components/seguimiento/FiltrosSeguimiento";


import { getIntenciones } from "../services/intencionService";
import { organizacionesDesdeIntenciones } from "../types/seguimiento";
import { MOCK_ORGANIZACIONES } from "../services/mockData";

type SubScreen = "seguimiento" | "calidad" | "logistica" | "distribucion" | "coordinacion" | "cierre";

type IntentStatusView = { stage: string; status: string; tone: string };

function getIntentStatusView(intent: any): IntentStatusView {
  const raw = String(intent?.estado ?? "").trim().toLowerCase();
  if (raw === "pendienteaprobaciongerencia") return { stage: "Gerencia", status: "Pendiente de aprobación", tone: "bg-amber-50 text-amber-700" };
  if (raw === "rechazadalogistica") return { stage: "Logística", status: "Rechazada", tone: "bg-red-50 text-red-700" };
  if (["", "0", "capturada", "pendiente"].includes(raw)) return { stage: "Calidad", status: "Pendiente de revisión", tone: "bg-blue-50 text-blue-700" };
  if (["1", "aprobadacalidad"].includes(raw)) return { stage: "Logística", status: "Aprobada por Calidad", tone: "bg-emerald-50 text-emerald-700" };
  if (["2", "aprobadalogistica"].includes(raw)) return { stage: "Distribución", status: intent?.gerenciaApprovalStatus === "Aprobada" ? "Aprobada por Gerencia" : "Aprobada por Logística", tone: "bg-emerald-50 text-emerald-700" };
  if (["3", "asignada"].includes(raw)) return { stage: "Coordinación", status: "Asignada", tone: "bg-violet-50 text-violet-700" };
  if (["4", "coordinada"].includes(raw)) return { stage: "Cierre", status: "Coordinada", tone: "bg-indigo-50 text-indigo-700" };
  if (["5", "cerrada"].includes(raw)) return { stage: "Finalizada", status: "Cerrada", tone: "bg-gray-100 text-gray-700" };
  return { stage: "En seguimiento", status: String(intent?.estado || "En revisión"), tone: "bg-gray-100 text-gray-700" };
}
interface Props {
  initial?: SubScreen;
}

export default function SeguimientoPage({ initial = "seguimiento" }: Props) {
  
  const [sub, setSub] = useState<SubScreen>(initial);
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_SEGUIMIENTO_VACIOS);
  const [intenciones, setIntenciones] = useState<any[]>([]);
  const [cargandoIntenciones, setCargandoIntenciones] = useState(false);

  useEffect(() => {
    let active = true;
    setCargandoIntenciones(true);
    getIntenciones()
      .then((items) => { if (active) setIntenciones(items); })
      .catch((error) => { console.error("No se pudieron cargar las intenciones de seguimiento", error); })
      .finally(() => { if (active) setCargandoIntenciones(false); });
    return () => { active = false; };
  }, [sub]);
  const organizaciones = useMemo(
    () => organizacionesDesdeIntenciones(intenciones, MOCK_ORGANIZACIONES),
    [intenciones]
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
    a.download = `seguimiento-organizaciones-${getLocalDateISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (sub === "calidad") {
    return <CalidadPage onVolver={() => setSub("seguimiento")} />;
  }

  if (sub === "logistica") {
    return <LogisticaPage onVolver={() => setSub("seguimiento")} />;
  }

  if (sub === "distribucion") {
    return <DistribucionPage onVolver={() => setSub("seguimiento")} />;
  }

  if (sub === "coordinacion") {
    return <CoordinacionPage onVolver={() => setSub("seguimiento")} />;
  }

  if (sub === "cierre") {
    return <CierrePage onVolver={() => setSub("seguimiento")} />;
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

            <button
              type="button"
              onClick={() => setSub("distribucion")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5cb89a]/40 bg-white px-4 py-2 text-sm font-medium text-[#5cb89a] hover:bg-[#5cb89a]/10"
            >
              <PackageCheck className="h-4 w-4" />
              Distribucion
            </button>
            <button
              type="button"
              onClick={() => setSub("coordinacion")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5cb89a]/40 bg-white px-4 py-2 text-sm font-medium text-[#5cb89a] hover:bg-[#5cb89a]/10"
            >
              <CalendarCheck className="h-4 w-4" />
              Coordinacion
            </button>
            <button
              type="button"
              onClick={() => setSub("cierre")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5cb89a]/40 bg-white px-4 py-2 text-sm font-medium text-[#5cb89a] hover:bg-[#5cb89a]/10"
            >
              <CheckCircle2 className="h-4 w-4" />
              Cierre
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <FiltrosSeguimiento
          filtros={filtros}
          onChange={setFiltros}
          onLimpiar={() => setFiltros(FILTROS_SEGUIMIENTO_VACIOS)}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-sm font-bold text-gray-900">Intenciones en seguimiento</h2><p className="mt-1 text-xs text-gray-500">Consulta la etapa y el estado actual de cada intención.</p></div>
          <span className="w-fit rounded-full bg-[#eaf4ee] px-3 py-1 text-xs font-bold text-[#315747]">{intenciones.length} intenciones</span>
        </div>
        {cargandoIntenciones ? <div className="p-8 text-center text-sm text-gray-500">Cargando intenciones...</div> : intenciones.length === 0 ? <div className="p-8 text-center text-sm text-gray-500">No hay intenciones registradas.</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full divide-y divide-gray-100 text-left">
              <thead className="bg-white"><tr>{["Código", "Donante", "Fecha", "Etapa actual", "Estado"].map((label) => <th key={label} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {intenciones.map((intent) => {
                  const flow = getIntentStatusView(intent);
                  return <tr key={intent.id} className="transition hover:bg-gray-50/70">
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{intent.codigo || `ID: ${intent.id}`}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{intent.donante || "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{intent.fechaIntencion || intent.fecha || "—"}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-[#f0f5f2] px-2.5 py-1 text-xs font-semibold text-[#315747]">{flow.stage}</span></td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${flow.tone}`}>{flow.status}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-800">
          Organizaciones en seguimiento ({organizacionesFiltradas.length}
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



