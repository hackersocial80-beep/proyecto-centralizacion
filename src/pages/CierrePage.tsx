import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Truck,
  Clock,
  MessageSquare,
  X,
  Check,
  ExternalLink,
  ImageIcon,
  Info,
  Building2,
  ChevronRight,
  ClipboardList,
  Send,
  PackageCheck,
  Trophy,
  Activity,
  Calendar,
  Zap
} from "lucide-react";
import { getIntenciones, getIntencionById } from "../services/intencionService";

interface Props {
  onVolver: () => void;
}

export default function CierrePage({ onVolver }: Props) {
  const [intentions, setIntentions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [intention, setIntention] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getIntenciones();
        const filtered = data.filter((i: any) => i.estado === 5 || i.estado === "Cerrada");
        setIntentions(filtered);
      } catch (e) {
        console.error("Error loading closed intentions", e);
      }
    }
    load();
  }, []);

  const selectIntention = async (id: string) => {
    setSelectedId(id);
    setIsLoading(true);
    try {
      const data = await getIntencionById(id);
      setIntention(data);
    } catch (e) {
      console.error("Error fetching intention details", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalClosure = async () => {
    if (!selectedId) return;
    try {
      await updateIntencionStatus(selectedId, 5);
      alert("✅ Asignación cerrada exitosamente. La donación ha sido archivada en el historial final.");
      const data = await getIntenciones();
      const filtered = data.filter((i: any) => i.estado === 5 || i.estado === "Cerrada");
      setIntentions(filtered);
    } catch (e) {
      console.error("Error closing assignment", e);
      alert("Hubo un error al cerrar la asignación.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-6 px-6 py-8 lg:px-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={onVolver}
            className="group flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:text-[#5cb89a] hover:border-[#5cb89a] transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                Finalizado
              </span>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Seguimiento</p>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Cierre de Donación</h1>
          </div>
        </div>

        {intention && (
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">Donación Cerrada: <span className="font-bold">{intention.codigo}</span></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR: LISTADO DE DONACIONES CERRADAS */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-500" />
                Donaciones Cerradas
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">Historial de rescates finalizados</p>
            </div>
            <div className="p-3 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {intentions.length === 0 ? (
                <div className="text-center py-10">
                  <PackageCheck className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No hay donaciones cerradas</p>
                </div>
              ) : (
                intentions.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => selectIntention(i.id.toString())}
                    className={`w-full group flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                      selectedId === i.id.toString()
                        ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-sm"
                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold mb-1 ${selectedId === i.id.toString() ? "text-emerald-600" : "text-gray-900"}`}>
                        {i.codigo || `ID: ${i.id}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate font-medium">{i.donante}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${selectedId === i.id.toString() ? "text-emerald-500 translate-x-1" : "text-gray-300 group-hover:text-gray-400"}`} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-9">
          {!intention ? (
            <div className="h-full min-h-[60vh] rounded-3xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-center p-12">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                  <p className="text-sm font-medium text-gray-500">Cargando expediente de cierre...</p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-gray-50 mb-4">
                    <Trophy className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Ninguna donación seleccionada</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                    Seleccione una donación finalizada para ver el resumen ejecutivo del cierre.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Información de la Donación</h2>
                </div>
                <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoField label="Código" value={intention.codigo} mono />
                  <InfoField label="Donante" value={intention.donante} />
                  <InfoField label="Fecha Intención" value={intention.fechaIntencion} />
                  <InfoField label="Productos" value={`${intention.productos?.length || 0} Prod.`} />
                  <InfoField label="Peso Estimado" value="120 kg" />
                  <InfoField label="Org. Asignada" value="Comedor Popular San Juan" />
                  <InfoField label="Prioridad" value="Alta" color="text-red-600" isBadge />
                  <InfoField label="Estado Actual" value="Cerrado" color="text-emerald-600" isBadge />
                </div>
              </section>

              {/* SECCIÓN 2: RESUMEN LOGÍSTICO */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <Truck className="h-4 w-4 text-emerald-500" /> Resumen Logístico
                  </h2>
                  <button
                    onClick={() => setIsLogisticsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-100"
                  >
                    <ExternalLink className="h-3 w-3" /> Ver Detalle Logístico
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  <InfoField label="Estrategia" value="Ruta Optimizada" />
                  <InfoField label="Transporte" value="BAP Propio" />
                  <InfoField label="Costo Est." value="S/. 45.00" />
                  <InfoField label="Responsable" value="Carlos Mendoza" />
                  <InfoField label="Fecha Programada" value="16 Sept, 2026" />
                  <InfoField label="Hora Programada" value="08:30 AM" />
                </div>
              </section>

              {/* SECCIÓN 3: COORDINACIÓN REALIZADA */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <MessageSquare className="h-4 w-4 text-emerald-500" /> Coordinación Realizada
                  </h2>
                  <button className="text-xs font-bold text-gray-600 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                    <ExternalLink className="h-3 w-3" /> Detalle de Comunicación
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <InfoField label="Fecha de Envío" value="15 Sept, 2026" />
                  <InfoField label="Correos Enviados" value="4" />
                  <InfoField label="Confirmaciones" value="4 / 4" color="text-emerald-600" />
                  <InfoField label="Estado" value="Confirmado" color="text-emerald-600" isBadge />
                </div>
              </section>

              {/* SECCIÓN 4: RESUMEN EJECUTIVO (TIMELINE) */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-8">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Resumen Ejecutivo del Proceso</h2>

                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-gray-200 before:to-gray-200">
                  {[
                    { step: "Calidad", status: "Aprobado", resp: "Ana Torres", date: "2026-09-07 10:00", color: "text-emerald-600" },
                    { step: "Logística", status: "Aprobado", resp: "Carlos Mendoza", date: "2026-09-08 14:30", color: "text-emerald-600" },
                    { step: "Asignación", status: "Comedor Popular San Juan", resp: "Jorge Ramirez", date: "2026-09-09 09:00", color: "text-blue-600" },
                    { step: "Coordinación", status: "Confirmado", resp: "Lucia Fernandez", date: "2026-09-15 11:00", color: "text-emerald-600" },
                    { step: "Cierre", status: "Finalizado", resp: "Admin Cierre", date: "2026-09-16 16:00", color: "text-emerald-600" },
                  ].map((item, i) => (
                    <div key={i} className="relative pl-10 group">
                      <div className={`absolute left-0 top-1 h-10 w-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-colors ${i === 4 ? "bg-emerald-500" : "bg-gray-200 group-hover:bg-emerald-100"}`}>
                        <Check className={`h-5 w-5 ${i === 4 ? "text-white" : "text-gray-400 group-hover:text-emerald-500"}`} />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-all">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{item.step}</p>
                          <p className={`text-sm font-bold ${item.color}`}>{item.status}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-xs font-medium text-gray-600">{item.resp}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{item.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECCIÓN 5: VALIDACIONES DEL PROCESO */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Validaciones del Proceso End-to-End</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Intención Capturada y Validada",
                    "Filtro de Calidad e Inocuidad Aprobado",
                    "Factibilidad Logística Confirmada",
                    "Asignación de Organización Ejecutada",
                    "Coordinación de Rescate Confirmada",
                    "Cierre Administrativo Realizado"
                  ].map((v, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <p className="text-xs font-medium text-emerald-800">{v}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECCIÓN 6: DOCUMENTOS GENERADOS */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <FileText className="h-4 w-4 text-emerald-500" /> Expediente Final de Documentos
                  </h2>
                  <button className="text-xs font-bold text-gray-600 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                    <Download className="h-3 w-3" /> Descargar Todo
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Acta de Entrega Final", desc: "Documento de conformidad de recepción", type: "PDF", size: "150 KB", date: "2026-09-16", status: "Cerrado" },
                    { name: "Guía de Remisión Ejecutada", desc: "Constancia de traslado finalizado", type: "PDF", size: "90 KB", date: "2026-09-16", status: "Cerrado" },
                  ].map((doc, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-emerald-500 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white border border-gray-200 text-red-500 group-hover:text-red-600 transition-colors">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium text-gray-400">{doc.size}</span>
                            <span className="text-[10px] text-gray-300">•</span>
                            <span className="text-[10px] font-bold text-emerald-600">{doc.status}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-all">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    "El proceso de asignación y coordinación se ha completado correctamente. Todas las partes involucradas han sido notificadas y han confirmado la disponibilidad. la donación queda lista para su ejecución en el módulo de seguimiento del rescate."
                  </p>
                </div>
              </section>

              {/* SECCIÓN 7: INDICADORES DEL PROCESO */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Indicadores de Performance (KPIs)</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center text-center">
                    <Clock className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Tiempo Total</p>
                    <p className="text-xl font-extrabold text-blue-900">9 Días</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center">
                    <Zap className="h-6 w-6 text-emerald-500 mb-2" />
                    <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Etapas Completadas</p>
                    <p className="text-xl font-extrabold text-emerald-900">5 / 5</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center text-center">
                    <MessageSquare className="h-6 w-6 text-amber-500 mb-2" />
                    <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">Comunicaciones</p>
                    <p className="text-xl font-extrabold text-amber-900">8 Msgs / 4 Conf.</p>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 8: RESPONSABLE DEL CIERRE */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Responsable del Cierre</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InfoField label="Nombre" value="Admin Sistema BAP" />
                  <InfoField label="Cargo" value="Coordinador General" />
                  <InfoField label="Cierre" value="2026-09-16 16:00" />
                </div>
              </section>

              {/* SECCIÓN 9: CIERRE FINAL */}
              <section className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200 flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm mb-2">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold tracking-tight">¡LISTO PARA SEGUIMIENTO!</h2>
                  <p className="text-emerald-50 max-w-md mx-auto text-sm leading-relaxed opacity-90">
                    La asignación ha finalizado correctamente. La donación queda disponible para iniciar el proceso de seguimiento del rescate.
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <button
                    onClick={handleFinalClosure}
                    className="rounded-2xl px-10 py-4 text-base font-extrabold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 transition-all active:scale-95 flex items-center gap-3 shadow-lg"
                  >
                    <CheckCircle2 className="h-6 w-6" />
                    Cierre de Asignación
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* LOGISTICS MODAL */}
      {isLogisticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="max-w-2xl w-full rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">Detalle Logístico Completo</h3>
              <button onClick={() => setIsLogisticsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <InfoField label="Vehículo" value="Camión 3.5T" />
                <InfoField label="Placa" value="ABC-123" />
                <InfoField label="Chofer" value="Carlos Mendoza" />
                <InfoField label="DNI Chofer" value="12345678" />
                <InfoField label="Celular Chofer" value="+51 999 888 777" />
                <InfoField label="Hora Programada" value="08:30 AM" />
                <InfoField label="Ruta Estimada" value="12.5 km" />
                <InfoField label="Tiempo Est. Recojo" value="45 min" />
              </div>
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Instrucciones de Ruta</p>
                  <p className="text-xs text-blue-600 leading-relaxed font-medium">
                    Ingresar por la puerta trasera del almacén, coordinar con el guardia de seguridad.
                    El vehículo debe contar con EPP completo para el ingreso.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsLogisticsModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, mono = false, color = "text-gray-900", isBadge = false }: { label: string; value: any; mono?: boolean; color?: string; isBadge?: boolean }) {
  return (
    <div className="flex flex-col">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
      {isBadge ? (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 w-fit ${color}`}>
          {value || "-"}
        </span>
      ) : (
        <p className={`text-sm ${color} ${mono ? "font-mono font-bold" : "font-semibold"}`}>{value || "-"}</p>
      )}
    </div>
  );
}
