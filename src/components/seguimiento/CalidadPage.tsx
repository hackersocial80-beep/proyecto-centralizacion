import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info as InfoIcon,
  Package,
  Save,
  ArrowLeft,
  CheckCircle,
  FileUp,
  Image as ImageIcon,
  ExternalLink,
  MapPin,
  X,
  ChevronRight,
  ChevronLeft,
  Eye
} from "lucide-react";
import { getIntenciones, getIntencionById, updateIntencionStatus } from "../../services/intencionService";

interface Props {
  onVolver: () => void;
}

type EvaluationStatus = "pendiente" | "aprobado" | "observaciones" | "rechazado";

const EVALUATION_ITEMS = [
  { id: "fisico", label: "Estado Físico y Apariencia", desc: "Revisión del estado físico y apariencia del producto" },
  { id: "inocuidad", label: "Inocuidad y Seguridad Alimentaria", desc: "Cumplimiento de criterios de inocuidad" },
  { id: "etiquetado", label: "Etiquetado / Información", desc: "Información visible y legible del producto" },
  { id: "empaque", label: "Empaque / Envase", desc: "Condiciones del empaque o envase" },
  { id: "transporte", label: "Almacenamiento y Transporte", desc: "Adecuación de la cadena de frío y manipulación" },
  { id: "doc_prod", label: "Documentación del Producto", desc: "Declaración de aptitud, fichas técnicas, etc." },
];

const STEPS = [
  { id: 'general', label: 'Información General', icon: InfoIcon },
  { id: 'productos', label: 'Productos y Condiciones', icon: Package },
  { id: 'evaluacion', label: 'Evaluación Técnica', icon: CheckCircle2 },
  { id: 'evidencias', label: 'Evidencias y Documentos', icon: FileText },
  { id: 'veredicto', label: 'Veredicto Final', icon: CheckCircle },
];

export default function CalidadPage({ onVolver }: Props) {
  const [intentions, setIntentions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [intention, setIntention] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Evaluation States
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationStatus>>({});
  const [finalResult, setFinalResult] = useState<EvaluationStatus>("pendiente");
  const [generalObs, setGeneralObs] = useState("");
  const [docValidation, setDocValidation] = useState<Record<string, boolean>>({});

  // Modals
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string, name: string, type: 'image' | 'doc' } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getIntenciones();
        const filtered = data.filter((i: any) => i.estado === 0 || i.estado === "Capturada");
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
      setEvaluations({});
      setFinalResult("pendiente");
      setGeneralObs("");
      setDocValidation({});
      setCurrentStep(0);
    } catch (e) {
      console.error("Error fetching intention details", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvalChange = (id: string, status: EvaluationStatus) => {
    setEvaluations(prev => ({ ...prev, [id]: status }));
  };

  const toggleDocValid = (docName: string) => {
    setDocValidation(prev => ({ ...prev, [docName]: !prev[docName] }));
  };

  const handleApprove = async () => {
    if (!selectedId || !intention) return;
    const hasDocs = intention.documentos && intention.documentos.length > 0;
    const hasPhotos = intention.fotos && intention.fotos.length > 0;
    if (!hasDocs || !hasPhotos) {
      alert("No se puede aprobar la calidad: La intención debe contar con documentos y fotos adjuntas.");
      return;
    }
    if (finalResult === "pendiente") {
      alert("Por favor, asigne un resultado a la evaluación final de calidad.");
      return;
    }
    try {
      await updateIntencionStatus(selectedId, 1);
      alert("Intención aprobada por Calidad exitosamente.");
      const data = await getIntenciones();
      setIntentions(data.filter((i: any) => i.estado === 0 || i.estado === "Capturada"));
      setIntention(null);
      setSelectedId("");
    } catch (e) {
      alert("Error al aprobar la intención");
    }
  };

  const StatusButton = ({ status, current, onClick, label, colorClass }: any) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${
        current === status ? colorClass : "bg-gray-100 text-gray-400 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onVolver} className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">Seguimiento · Calidad</p>
            <h1 className="text-2xl font-bold text-gray-900">Revisión de Calidad</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Intenciones Pendientes</h3>
            <div className="space-y-2">
              {intentions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No hay intenciones pendientes</p>
              ) : (
                intentions.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => selectIntention(i.id.toString())}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedId === i.id.toString() ? "border-[#5cb89a] bg-[#5cb89a]/10 ring-1 ring-[#5cb89a]" : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-900">{i.codigo || `ID: ${i.id}`}</p>
                    <p className="text-xs text-gray-600 truncate">{i.donante}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {!intention ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-20 text-center text-gray-500">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5cb89a] border-t-transparent" />
                  <p className="text-sm">Cargando detalles...</p>
                </div>
              ) : (
                <p className="text-sm">Selecciona una intención de la lista para iniciar la revisión de calidad.</p>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Step Navigation */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                {STEPS.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentStep(idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                        currentStep === idx ? "bg-[#5cb89a] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                      <span className="text-xs font-semibold">{step.label}</span>
                    </button>
                    {idx < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-gray-300" />}
                  </div>
                ))}
              </div>

              <div className="min-h-[500px]">
                {currentStep === 0 && (
                  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <InfoIcon className="h-4 w-4 text-[#5cb89a]" /> Información General
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Info label="Código" value={intention.codigo} mono />
                      <Info label="Donante" value={intention.donante} />
                      <Info label="Fecha" value={intention.fecha} />
                      <Info label="Canal" value={intention.canal} />
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-[#5cb89a]" />
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Ubicación de Recojo</p>
                          <p className="text-sm font-semibold text-gray-900">{intention.logistica?.direccion || "No especificada"}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsMapOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <ExternalLink className="h-3 w-3" /> Ver en Mapa
                      </button>
                    </div>
                  </section>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                        <Package className="h-4 w-4 text-[#5cb89a]" /> Detalle de Productos
                      </h2>
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-semibold uppercase text-gray-600">
                              <th className="px-4 py-3">Producto</th>
                              <th className="px-4 py-3">Cantidad</th>
                              <th className="px-4 py-3">Tipo</th>
                              <th className="px-4 py-3">Vida Útil</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {(intention.productos || []).map((p: any, idx: number) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-sm text-gray-900">{p.nombre || p.producto || "N/A"}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{p.cantidad} {p.unidad}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{p.tipoProducto}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{p.vidaUtil}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                        <InfoIcon className="h-4 w-4 text-[#5cb89a]" /> Condiciones del Producto
                      </h2>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DetailField label="Condición" value={intention.condicionProducto} />
                        <DetailField label="Almacenamiento" value={intention.condicionAlmacenamiento} />
                        <DetailField label="Vida Útil Promedio" value={intention.vidaUtilPromedio} />
                        <DetailField label="Restricciones del Donante" value={intention.restriccionesDonante} />
                      </div>
                    </section>
                  </div>
                )}

                {currentStep === 2 && (
                  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <CheckCircle2 className="h-4 w-4 text-[#5cb89a]" /> Evaluación de Calidad e Inocuidad
                    </h2>
                    <div className="space-y-4">
                      {EVALUATION_ITEMS.map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusButton status="aprobado" current={evaluations[item.id]} onClick={() => handleEvalChange(item.id, "aprobado")} label="Aprobado" colorClass="bg-green-500 text-white shadow-sm" />
                            <StatusButton status="observaciones" current={evaluations[item.id]} onClick={() => handleEvalChange(item.id, "observaciones")} label="Obs." colorClass="bg-yellow-500 text-white shadow-sm" />
                            <StatusButton status="rechazado" current={evaluations[item.id]} onClick={() => handleEvalChange(item.id, "rechazado")} label="Rechazado" colorClass="bg-red-500 text-white shadow-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {currentStep === 3 && (
                  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <FileText className="h-4 w-4 text-[#5cb89a]" /> Validación de Documentos y Evidencias
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <FileUp className="h-4 w-4 text-[#5cb89a]" /> Documentos
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {intention.documentos && intention.documentos.length > 0 ? (
                            intention.documentos.map((doc: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 bg-gray-50 group">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#5cb89a] focus:ring-[#5cb89a]" checked={!!docValidation[doc.nombre || `doc${i}`]} onChange={() => toggleDocValid(doc.nombre || `doc${i}`)} />
                                <button onClick={() => setPreviewFile({ url: doc.url, name: doc.nombre, type: 'doc' })} className="flex-1 text-left flex items-center gap-2 text-xs text-blue-600 hover:underline truncate">
                                  <FileText className="h-3 w-3" /> {doc.nombre || `Documento ${i+1}`}
                                </button>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${docValidation[doc.nombre || `doc${i}`] ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                                  {docValidation[doc.nombre || `doc${i}`] ? "Válido" : "Pendiente"}
                                </span>
                              </div>
                            ))
                          ) : <div className="p-4 rounded-lg border border-dashed border-red-300 bg-red-50 text-center text-xs text-red-500 font-medium">Sin documentos adjuntos</div>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <ImageIcon className="h-4 w-4 text-[#5cb89a]" /> Fotos / Evidencias
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {intention.fotos && intention.fotos.length > 0 ? (
                            intention.fotos.map((foto: any, i: number) => (
                              <div key={i} className="aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 relative group cursor-pointer" onClick={() => setPreviewFile({ url: foto.url, name: foto.nombre, type: 'image' })}>
                                <img src={foto.url || "https://via.placeholder.com/100"} alt={`Foto ${i+1}`} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="h-5 w-5 text-white" />
                                </div>
                                {docValidation[foto.nombre || `foto${i}`] && (
                                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                                    <CheckCircle className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            ))
                          ) : <div className="col-span-3 p-4 rounded-lg border border-dashed border-red-300 bg-red-50 text-center text-xs text-red-500 font-medium">Sin fotos adjuntas</div>}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {currentStep === 4 && (
                  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <CheckCircle2 className="h-4 w-4 text-[#5cb89a]" /> Veredicto Final de Calidad
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <button onClick={() => setFinalResult("aprobado")} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${finalResult === "aprobado" ? "bg-green-600 text-white ring-4 ring-green-100" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Aprobado (Cumple Criterios)</button>
                      <button onClick={() => setFinalResult("observaciones")} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${finalResult === "observaciones" ? "bg-yellow-600 text-white ring-4 ring-yellow-100" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Aprobado con Observaciones</button>
                      <button onClick={() => setFinalResult("rechazado")} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${finalResult === "rechazado" ? "bg-red-600 text-white ring-4 ring-red-100" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>Rechazado</button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase">Observaciones Generales de Calidad</label>
                      <textarea className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#5cb89a] focus:outline-none transition-all min-h-[100px]" placeholder="Ingrese las observaciones detalladas..." value={generalObs} onChange={(e) => setGeneralObs(e.target.value)} />
                    </div>
                  </section>
                )}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)} disabled={currentStep === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setIntention(null)} className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Cancelar</button>
                  {currentStep < STEPS.length - 1 ? (
                    <button onClick={() => setCurrentStep(currentStep + 1)} className="rounded-lg bg-[#5cb89a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#4a9a82] transition-all">Siguiente</button>
                  ) : (
                    <button onClick={handleApprove} className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 ${(!intention?.documentos?.length || !intention?.fotos?.length) ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#5cb89a] to-[#7dc8ad] hover:brightness-105"}`}>
                      <CheckCircle className="h-4 w-4" /> Aprobar Calidad
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Popup */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-w-4xl w-full rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Ubicación de Recojo</h3>
              <button onClick={() => setIsMapOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="h-[500px] w-full bg-gray-100">
              <iframe src={`https://www.google.com/maps/embed/v1/search?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(intention?.logistica?.direccion || "")}`} className="h-full w-full border-0" allowFullScreen />
              {!intention?.logistica?.direccion && <div className="h-full w-full flex items-center justify-center text-gray-500">Dirección no especificada</div>}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button onClick={() => setIsMapOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Popup */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-w-5xl w-full h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {previewFile.type === 'image' ? <ImageIcon className="h-5 w-5 text-[#5cb89a]" /> : <FileText className="h-5 w-5 text-[#5cb89a]" />}
                <h3 className="text-lg font-bold text-gray-900 truncate max-w-md">{previewFile.name}</h3>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-4">
              {previewFile.type === 'image' ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
              ) : (
                <iframe src={previewFile.url} className="w-full h-full rounded-lg shadow-lg bg-white" />
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button onClick={() => setPreviewFile(null)} className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`text-sm text-gray-900 ${mono ? "font-mono font-semibold" : "font-medium"}`}>{value || "-"}</p>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <p className="mb-1 text-xs font-medium text-gray-600">{label}</p>
      <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-100 min-h-[40px] leading-relaxed">{value || "No especificado"}</p>
    </div>
  );
}
