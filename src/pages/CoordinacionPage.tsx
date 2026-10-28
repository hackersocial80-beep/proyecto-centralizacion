import { useEffect, useState } from "react";
import { getLocalDateISO } from "../utils/date";
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
  CheckCheck,
  ExternalLink,
  ImageIcon,
  Info,
  Building2,
  ChevronRight,
  ClipboardList,
  Send,
  PackageCheck
} from "lucide-react";
import { getIntenciones, getIntencionById, updateIntencionStatus } from "../services/intencionService";
import SelectionPlaceholder from "../components/ui/SelectionPlaceholder";

interface Props {
  onVolver: () => void;
}

type CommunicationStatus = "pending" | "sent" | "received";
type Communication = { id: string; org: string; canal: "WhatsApp" | "Correo"; tipo: string; estado: CommunicationStatus; fecha: string };

export default function CoordinacionPage({ onVolver }: Props) {
  const [intentions, setIntentions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [intention, setIntention] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");
  const [beneficiaryEmail, setBeneficiaryEmail] = useState("");
  const [communicationError, setCommunicationError] = useState("");
  const [communicationNotice, setCommunicationNotice] = useState("");
  const [communications, setCommunications] = useState<Communication[]>([
  ]);

  const beneficiaryName = intention?.organizacionAsignada?.nombre || "Organización no asignada";
  const beneficiaryAddress = intention?.organizacionAsignada?.direccion || "Dirección no registrada";

  const VALIDACION_ITEMS = [
    "Notificación automática programada para todas las partes",
    "Datos de recojo y entrega verificados y correctos",
    "Canales de comunicación activos y validados",
    "Documentos de transporte generados y disponibles",
  ];

  useEffect(() => {
    async function load() {
      try {
        const data = await getIntenciones();
        const filtered = data.filter((i: any) => i.estado === 3 || i.estado === "Asignada");
        setIntentions(filtered);
      } catch (e) {
        console.error("Error loading intentions", e);
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

  const handleSendCoordination = async () => {
    if (!selectedId) return;
    try {
      await updateIntencionStatus(selectedId, 5);
      alert("🚀 ¡Coordinación enviada! La donación ha pasado a la fase final de cierre.");
      const data = await getIntenciones();
      setIntentions(data.filter((i: any) => i.estado === 3 || i.estado === "Asignada"));
      setIntention(null);
      setSelectedId("");
    } catch (e) {
      alert("Hubo un error al enviar la coordinación. Por favor, intente nuevamente.");
    }
  };

  const handleSaveDraft = () => {
    alert("💾 Borrador guardado correctamente.");
  };

  const openCommunicationDraft = (canal: Communication["canal"]) => {
    const org = intention?.organizacionAsignada?.nombre || "Organización no asignada";
    const reference = intention?.codigo ? ` para la intención ${intention.codigo}` : "";
    const body = `Hola, ${org}. Le escribimos para coordinar el rescate de la donación${reference}. Por favor confirme la recepción de este mensaje.`;
    const now = new Date();
    const fecha = `${getLocalDateISO()} ${now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
    if (canal === "WhatsApp") {
      const phone = beneficiaryPhone.replace(/\D/g, "");
      if (phone.length < 8) { setCommunicationError("Ingresa un número de WhatsApp válido, incluido el código de país."); return; }
      setCommunications((items) => [{ id: `communication-${Date.now()}`, org, canal, tipo: `Coordinación de rescate · ${intention?.codigo || "donación"}`, estado: "pending", fecha }, ...items]);
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(beneficiaryEmail)) { setCommunicationError("Ingresa un correo electrónico válido."); return; }
      setCommunications((items) => [{ id: `communication-${Date.now()}`, org, canal, tipo: `Coordinación de rescate · ${intention?.codigo || "donación"}`, estado: "pending", fecha }, ...items]);
      window.location.href = `mailto:${beneficiaryEmail}?subject=${encodeURIComponent("Coordinación de rescate")}&body=${encodeURIComponent(body)}`;
    }
    setCommunicationError("");
    setCommunicationNotice(`Se abrió un borrador de ${canal}. Al enviarlo, marca “Enviado” en la bitácora.`);
    setIsCommunicationModalOpen(false);
  };

  const updateCommunicationStatus = (id: string, estado: Exclude<CommunicationStatus, "pending">) => {
    setCommunications((items) => items.map((item) => item.id === id ? { ...item, estado } : item));
    setCommunicationNotice(estado === "sent" ? "Comunicación marcada como enviada." : "Recepción confirmada manualmente.");
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
              <span className="px-2 py-0.5 rounded-full bg-[#5cb89a]/10 text-[#5cb89a] text-[10px] font-bold uppercase tracking-wider">
                Fase Final
              </span>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Seguimiento</p>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Coordinación de Rescate</h1>
          </div>
        </div>

        {intention && (
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-600">Editando: <span className="text-gray-900 font-bold">{intention.codigo}</span></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR: LISTADO DE INTENCIONES */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#5cb89a]" />
                Donaciones Asignadas
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">Listado de rescates pendientes</p>
            </div>
            <div className="p-3 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {intentions.length === 0 ? (
                <div className="text-center py-10">
                  <PackageCheck className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No hay donaciones pendientes</p>
                </div>
              ) : (
                intentions.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => selectIntention(i.id.toString())}
                    className={`w-full group flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                      selectedId === i.id.toString()
                        ? "border-[#5cb89a] bg-[#5cb89a]/5 ring-1 ring-[#5cb89a] shadow-sm"
                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold mb-1 ${selectedId === i.id.toString() ? "text-[#5cb89a]" : "text-gray-900"}`}>
                        {i.codigo || `ID: ${i.id}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate font-medium">{i.donante}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${selectedId === i.id.toString() ? "text-[#5cb89a] translate-x-1" : "text-gray-300 group-hover:text-gray-400"}`} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-9">
          {!intention ? (
            isLoading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-3xl border border-[#e2ebe5] bg-white text-[#64756b]">

                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5cb89a] border-t-transparent" />
                  <p className="text-sm font-medium text-gray-500">Buscando datos de la donación...</p>
                </div>
              
              </div>
            ) : (
              <SelectionPlaceholder />
            )
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* SECCIÓN 1: RESUMEN EJECUTIVO */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#5cb89a]" />
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Resumen de la Donación</h2>
                </div>
                <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoField label="Código" value={intention.codigo} mono />
                  <InfoField label="Donante" value={intention.donante} />
                  <InfoField label="Fecha Solicitud" value={intention.fechaIntencion} />
                  <InfoField label="Volumen" value={`${intention.productos?.length || 0} Prod. / 120kg`} />
                  <InfoField label="Fecha Rescate" value="16 Sept, 2026" />
                  <InfoField label="Ventana Horaria" value="09:00 - 12:00" />
                  <InfoField label="Prioridad" value="Alta" color="text-red-600" isBadge />
                  <InfoField label="Estado" value="Asignada" color="text-emerald-600" isBadge />
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DONANTE CARD */}
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                      <User className="h-4 w-4 text-[#5cb89a]" /> Datos del Donante
                    </h2>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Origen</span>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-16 w-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-lg truncate">{intention.donante}</p>
                      <p className="text-xs text-gray-500 truncate mb-3">{intention.logistica?.direccion || "Dirección no registrada"}</p>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                          <Phone className="h-3.5 w-3.5 text-gray-400" /> {intention.contacto || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                          <Mail className="h-3.5 w-3.5 text-gray-400" /> contacto@donante.com
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* BENEFICIARIO CARD */}
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                      <Building2 className="h-4 w-4 text-[#5cb89a]" /> Organización Beneficiaria
                    </h2>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Destino</span>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden shadow-inner">
                      <Building2 className="h-8 w-8 text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-lg truncate">{beneficiaryName}</p>
                      <p className="text-xs text-gray-500 truncate mb-3">{beneficiaryAddress}</p>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                          <Phone className="h-3.5 w-3.5 text-gray-400" /> {beneficiaryPhone || "Teléfono no registrado"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                          <Mail className="h-3.5 w-3.5 text-gray-400" /> {beneficiaryEmail || "Correo no registrado"}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* DETALLES LOGÍSTICOS */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <Truck className="h-4 w-4 text-[#5cb89a]" /> Plan Operativo de Transporte
                  </h2>
                  <button
                    onClick={() => setIsLogisticsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-100"
                  >
                    <ExternalLink className="h-3 w-3" /> Ver Detalle Completo
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  <InfoField label="Transporte" value="BAP Propio" />
                  <InfoField label="Vehículo" value="Camión 3.5T - ABC-123" />
                  <InfoField label="Chofer" value="Carlos Mendoza" />
                  <InfoField label="Hora Recojo" value="08:30 AM" />
                  <InfoField label="Ruta Estimada" value="12.5 km" />
                </div>
              </section>

              {/* COMUNICACIONES */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <MessageSquare className="h-4 w-4 text-[#5cb89a]" /> Bitácora de Comunicaciones
                  </h2>
                  <button onClick={() => { setCommunicationError(""); setIsCommunicationModalOpen(true); }} className="px-4 py-1.5 text-xs font-bold text-white bg-[#5cb89a] hover:bg-[#4a9a82] rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2">
                    <Send className="h-3 w-3" /> Reenviar Pendientes
                  </button>
                </div>
                <div className="p-0">
                  {communicationNotice && <p role="status" className="border-b border-emerald-100 bg-emerald-50 px-6 py-3 text-xs font-medium text-emerald-800">{communicationNotice}</p>}
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="px-6 py-3">Destinatario</th>
                        <th className="px-6 py-3">Canal</th>
                        <th className="px-6 py-3">Mensaje</th>
                        <th className="px-6 py-3 text-center">Estado</th>
                        <th className="px-6 py-3 text-right">Enviado el</th>
<th className="px-6 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
  {communications.map((msg) => (
    <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{msg.org}</td>
      <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">{msg.canal}</span></td>
      <td className="px-6 py-4 text-sm text-gray-500">{msg.tipo}</td>
      <td className="px-6 py-4"><div className="flex items-center justify-center gap-1.5">
        {msg.estado === "received" ? <CheckCheck className="h-4 w-4 text-blue-500" /> : msg.estado === "sent" ? <Check className="h-4 w-4 text-emerald-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
        <span className="text-[11px] font-bold text-gray-600">{msg.estado === "received" ? "Recibido" : msg.estado === "sent" ? "Enviado" : "Pendiente"}</span>
      </div></td>
      <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">{msg.fecha}</td>
      <td className="px-6 py-4 text-right">
        {msg.estado === "pending" ? <button onClick={() => updateCommunicationStatus(msg.id, "sent")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Marcar enviado</button> : msg.estado === "sent" ? <button onClick={() => updateCommunicationStatus(msg.id, "received")} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Confirmar recibido</button> : <span className="text-xs text-gray-400">Confirmado</span>}
      </td>
    </tr>
  ))}
</tbody>
                  </table>
                </div>
                <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-center gap-3 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <p className="font-medium">Un check indica Enviado y dos checks Recibido. Confirma los estados después de enviar o verificar la recepción por el canal elegido.</p>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PROGRAMACIÓN */}
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                    <Clock className="h-4 w-4 text-[#5cb89a]" /> Horarios Confirmados
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Fecha Rescate" value="16 Sept, 2026" />
                    <InfoField label="Hora Inicio" value="08:00 AM" />
                    <InfoField label="Llegada Est." value="09:30 AM" />
                    <InfoField label="Entrega Est." value="11:00 AM" />
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex gap-3">
                      <div className="mt-1"><Truck className="h-4 w-4 text-gray-400" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Punto de Recojo</p>
                        <p className="text-sm font-medium text-gray-700">{intention.logistica?.direccion || "Dirección no especificada"}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex gap-3">
                      <div className="mt-1"><Building2 className="h-4 w-4 text-emerald-400" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase">Punto de Entrega</p>
                        <p className="text-sm font-medium text-emerald-900">{beneficiaryName} · {beneficiaryAddress}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* DOCUMENTOS */}
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide">
                      <FileText className="h-4 w-4 text-[#5cb89a]" /> Expediente de Rescate
                    </h2>
                    <button className="text-xs font-bold text-gray-600 hover:text-[#5cb89a] flex items-center gap-1 transition-colors">
                      <Download className="h-3 w-3" /> Todos
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Acta de Entrega", desc: "Detalle de productos y cantidades", type: "PDF", size: "120 KB", date: `${getLocalDateISO()} 10:00`, status: "Generado" },
                      { name: "Guía de Remisión", desc: "Documento legal de traslado", type: "PDF", size: "85 KB", date: `${getLocalDateISO()} 10:05`, status: "Generado" },
                    ].map((doc, i) => (
                      <div key={i} className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-[#5cb89a] hover:shadow-sm transition-all cursor-pointer">
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
                        <button className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 group-hover:text-[#5cb89a] group-hover:border-[#5cb89a] transition-all">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* CHECKLIST FINAL */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Validación Final de Envío</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checkedItems.length === VALIDACION_ITEMS.length ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                    {checkedItems.length} de {VALIDACION_ITEMS.length} completados
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VALIDACION_ITEMS.map((text, i) => {
                    const isChecked = checkedItems.includes(text);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setCheckedItems(prev =>
                            isChecked ? prev.filter(item => item !== text) : [...prev, text]
                          );
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                          isChecked
                            ? "bg-emerald-50 border-emerald-200 shadow-sm"
                            : "bg-gray-50 border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isChecked ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300 group-hover:border-gray-400"
                        }`}>
                          <Check className={`h-3 w-3 ${isChecked ? "text-white" : "text-transparent"}`} />
                        </div>
                        <p className={`text-xs font-medium transition-colors ${isChecked ? "text-emerald-700" : "text-gray-600"}`}>
                          {text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ACCIONES FINALES */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={handleSaveDraft}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  Guardar Borrador
                </button>
                <button
                  onClick={handleSendCoordination}
                  disabled={checkedItems.length !== VALIDACION_ITEMS.length}
                  className={`rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                    checkedItems.length === VALIDACION_ITEMS.length
                      ? "bg-gradient-to-r from-[#5cb89a] to-[#7dc8ad] shadow-[#5cb89a]/30 hover:brightness-110 cursor-pointer"
                      : "bg-gray-300 cursor-not-allowed opacity-70 shadow-none"
                  }`}
                >
                  <Send className="h-4 w-4" /> Enviar Coordinación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCommunicationModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCommunicationModalOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="communication-modal-title" className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div><p className="text-xs font-bold uppercase tracking-wider text-[#5cb89a]">Bitácora de comunicaciones</p><h3 id="communication-modal-title" className="mt-1 text-lg font-bold text-gray-900">Reenviar coordinación</h3></div>
              <button type="button" aria-label="Cerrar" onClick={() => setIsCommunicationModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm text-gray-600">Elige cómo contactar a {beneficiaryName}. Se abrirá un borrador para que revises y envíes el mensaje.</p>
              <label className="block text-xs font-semibold text-gray-700">Número de WhatsApp
                <input value={beneficiaryPhone} onChange={(event) => setBeneficiaryPhone(event.target.value)} placeholder="+51 999 999 999" className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#5cb89a] focus:ring-2 focus:ring-[#5cb89a]/20" />
              </label>
              <label className="block text-xs font-semibold text-gray-700">Correo electrónico
                <input type="email" value={beneficiaryEmail} onChange={(event) => setBeneficiaryEmail(event.target.value)} placeholder="contacto@organizacion.org" className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#5cb89a] focus:ring-2 focus:ring-[#5cb89a]/20" />
              </label>
              {communicationError && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{communicationError}</p>}
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                <button type="button" onClick={() => openCommunicationDraft("WhatsApp")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#20a867] px-4 py-3 text-sm font-bold text-white hover:bg-[#188753]"><MessageSquare className="h-4 w-4" /> Abrir WhatsApp</button>
                <button type="button" onClick={() => openCommunicationDraft("Correo")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315747] px-4 py-3 text-sm font-bold text-white hover:bg-[#244536]"><Mail className="h-4 w-4" /> Redactar correo</button>
              </div>
              <p className="text-xs leading-relaxed text-gray-500">Después de enviarlo, marca “Enviado” en la bitácora. La confirmación de recepción se registra manualmente.</p>
            </div>
          </div>
        </div>
      )}

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

