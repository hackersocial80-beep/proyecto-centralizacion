import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, FileText, MessageSquare, PackageCheck, RotateCcw, ShieldCheck, User } from "lucide-react";
import { getIntenciones, updateIntencionWorkflow } from "../../services/intencionService";

interface Props { onVolver: () => void; }
const isPending = (item: any) => String(item?.estado ?? "").trim().toLowerCase() === "pendienteaprobaciongerencia";

export default function AprobacionGerenciaPage({ onVolver }: Props) {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [observations, setObservations] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = requests.find((item) => String(item.id) === selectedId) ?? null;

  const refresh = async () => {
    const items = await getIntenciones();
    const pending = items.filter(isPending);
    setRequests(pending);
    if (selectedId && !pending.some((item) => String(item.id) === selectedId)) {
      setSelectedId("");
      setObservations("");
    }
  };

  useEffect(() => { void refresh().catch((error) => console.error("No se pudieron cargar las solicitudes de Gerencia", error)); }, []);

  const decide = async (approved: boolean) => {
    if (!selected || busy) return;
    if (!approved && !observations.trim()) {
      alert("Escribe el motivo para devolver la solicitud a Logística.");
      return;
    }
    setBusy(true);
    try {
      await updateIntencionWorkflow(selected.id, {
        estado: approved ? "AprobadaLogistica" : "AprobadaCalidad",
        gerenciaApprovalStatus: approved ? "Aprobada" : "Devuelta a Logística",
        gerenciaApprovalObservation: observations.trim(),
        gerenciaApprovalDate: new Date().toISOString(),
      });
      alert(approved ? "Solicitud aprobada por Gerencia. Ya está disponible para Distribución." : "Solicitud devuelta a Logística para revisión.");
      setSelectedId("");
      setObservations("");
      await refresh();
    } catch (error) {
      console.error("No se pudo registrar la decisión de Gerencia", error);
      alert("No se pudo registrar la decisión. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onVolver} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm hover:text-[#32876d]"><ArrowLeft className="h-5 w-5" /></button>
        <div><p className="text-xs font-semibold uppercase tracking-wider text-[#5cb89a]">Seguimiento · Gerencia</p><h1 className="text-2xl font-bold text-gray-900">Aprobaciones logísticas</h1><p className="mt-1 text-sm text-gray-500">Revisa las solicitudes aprobadas por Logística antes de habilitarlas para Distribución.</p></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-gray-900">Pendientes de revisión</h2><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{requests.length}</span></div>
          <div className="space-y-2">
            {requests.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">No hay solicitudes pendientes.</p> : requests.map((item) => (
              <button type="button" key={item.id} onClick={() => { setSelectedId(String(item.id)); setObservations(""); }} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === String(item.id) ? "border-[#5cb89a] bg-[#5cb89a]/10 ring-1 ring-[#5cb89a]" : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"}`}>
                <span className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-gray-900">{item.codigo || `ID: ${item.id}`}</span><Clock3 className="h-4 w-4 text-amber-500" /></span>
                <span className="mt-1 block truncate text-xs text-gray-600">{item.donante || "Donante sin nombre"}</span>
                <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{item.logisticsApprovalStatus === "observaciones" ? "Aprobado con observaciones" : "Aprobado por Logística"}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="lg:col-span-2">
          {!selected ? <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#b9d4c3] bg-gradient-to-br from-white via-[#fbfdfb] to-[#edf6f0] px-6 text-center"><ShieldCheck className="h-10 w-10 text-[#5cb89a]" /><h2 className="mt-4 text-lg font-bold text-[#1d3f2d]">Selecciona una solicitud</h2><p className="mt-2 max-w-sm text-sm text-[#6b7c70]">El detalle de aprobación logística aparecerá aquí para que Gerencia pueda revisarlo.</p></div> : (
            <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#5cb89a]">Solicitud pendiente</p><h2 className="mt-1 text-xl font-bold text-gray-900">{selected.codigo || `Intención ${selected.id}`}</h2><p className="mt-1 text-sm text-gray-600">{selected.donante || "Donante sin nombre"}</p></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Requiere decisión de Gerencia</span></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Info icon={<User className="h-4 w-4" />} label="Responsable de Logística" value={selected.logisticsResponsible || "No especificado"} /><Info icon={<CheckCircle2 className="h-4 w-4" />} label="Resultado logístico" value={selected.logisticsApprovalStatus === "observaciones" ? "Aprobado con observaciones" : "Aprobado"} /><Info icon={<PackageCheck className="h-4 w-4" />} label="Estrategia de recojo" value={selected.logisticsStrategy || "No especificada"} /><Info icon={<FileText className="h-4 w-4" />} label="Fecha de envío" value={selected.gerenciaRequestedAt ? new Date(selected.gerenciaRequestedAt).toLocaleString("es-PE") : "—"} /></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Observaciones de Logística</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{selected.logisticsApprovalObservation || "Sin observaciones."}</p></div>
              <div className="space-y-2"><label htmlFor="manager-observations" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500"><MessageSquare className="h-4 w-4" /> Comentario de Gerencia</label><textarea id="manager-observations" value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Agrega un comentario o el motivo de devolución..." className="min-h-24 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-[#5cb89a] focus:ring-2 focus:ring-[#5cb89a]/20" /></div>
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={() => void decide(false)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Devolver a Logística</button><button type="button" disabled={busy} onClick={() => void decide(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315747] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#244536] disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> Aprobar para Distribución</button></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-3"><span className="mt-0.5 text-[#5cb89a]">{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 text-sm font-semibold text-gray-800">{value}</p></div></div>;
}