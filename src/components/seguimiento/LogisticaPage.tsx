import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Info as InfoIcon,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Package,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  User
} from "lucide-react";
import { getIntenciones, getIntencionById, updateIntencionStatus } from "../../services/intencionService";

interface Props {
  onVolver: () => void;
}

type ApprovalStatus = "pendiente" | "aprobado" | "observaciones" | "rechazado";
type StrategyId = "bap" | "externo" | "org";

const STRATEGIES = {
  bap: {
    title: "Recojo con unidades del BAP",
    recommended: true,
    description: "El Banco de Alimentos Perú realizará el recojo con sus unidades y personal.",
    advantages: ["Control directo del transporte y manipulación", "Sin costos adicionales de transporte", "Asegura cumplimiento de protocolos BAP"],
    considerations: ["Disponibilidad de unidades", "Rutas y tiempos de recojo"]
  },
  externo: {
    title: "Contratar transporte externo (tercero)",
    recommended: false,
    description: "Se contratará un proveedor de transporte externo para el recojo.",
    advantages: ["Mayor flexibilidad de horarios", "Acceso a unidades especializadas", "Cobertura en zonas lejanas"],
    considerations: ["Genera costo adicional", "Requiere aprobación de gerencia general"],
    specialNote: "Esta opción requiere aprobación de gerencia general para la aprobación del gasto."
  },
  org: {
    title: "Organización beneficiaria recogerá la donación",
    recommended: false,
    description: "La organización asignada realizará el recojo directamente en el punto de origen.",
    advantages: ["Empodera a las organizaciones", "Reduce costos logísticos"],
    considerations: ["Dependencia de disponibilidad de la organización", "Requiere confirmación y coordinación previa"]
  }
};

const STEPS = [
  { id: 'resumen', label: 'Resumen', icon: InfoIcon },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'estrategia', label: 'Estrategia', icon: Truck },
  { id: 'resumen_log', label: 'Resumen Log.', icon: ClipboardList },
  { id: 'aprobacion', label: 'Aprobación', icon: CheckCircle },
];

export default function LogisticaPage({ onVolver }: Props) {
  const [intentions, setIntentions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [intention, setIntention] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // State for Editable Data
  const [editedProducts, setEditedProducts] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId>("bap");
  const [logisticsObs, setLogisticsObs] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>("pendiente");
  const [approvalObs, setApprovalObs] = useState("");
  const [responsable, setResponsable] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getIntenciones();
        const filtered = data.filter((i: any) => i.estado === 1 || i.estado === "AprobadaCalidad");
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
      setEditedProducts(data.productos || []);
      setSelectedStrategy("bap");
      setLogisticsObs("");
      setApprovalStatus("pendiente");
      setApprovalObs("");
      setResponsable("");
      setCurrentStep(0);
    } catch (e) {
      console.error("Error fetching intention details", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductChange = (idx: number, field: string, value: string) => {
    const updated = [...editedProducts];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditedProducts(updated);
  };

  const handleFinalize = async () => {
    if (!selectedId) return;
    if (approvalStatus === "pendiente") {
      alert("Por favor, asigne un estado de aprobación logística.");
      return;
    }
    try {
      await updateIntencionStatus(selectedId, 2);
      alert("Intención finalizada y enviada a Distribución.");
      const data = await getIntenciones();
      setIntentions(data.filter((i: any) => i.estado === 1 || i.estado === "AprobadaCalidad"));
      setIntention(null);
      setSelectedId("");
    } catch (e) {
      alert("Error al finalizar la intención");
    }
  };

  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onVolver} className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">Seguimiento · Logística</p>
            <h1 className="text-2xl font-bold text-gray-900">Validación Logística</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Pendientes de Logística</h3>
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
                <p className="text-sm">Selecciona una intención para validar los datos logísticos.</p>
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
                      <InfoIcon className="h-4 w-4 text-[#5cb89a]" /> Resumen de la Intención
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Info label="Código" value={intention.codigo} mono />
                      <Info label="Donante" value={intention.donante} />
                      <Info label="Fecha" value={intention.fecha} />
                      <Info label="Responsable" value={intention.responsable} />
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#5cb89a]" /> Ubicación de Recojo
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DetailField label="Dirección" value={intention.logistica?.direccion} />
                        <DetailField label="Referencia" value={intention.logistica?.referencia} />
                        <DetailField label="Distrito" value={intention.logistica?.distrito} />
                        <DetailField label="Provincia" value={intention.logistica?.provincia} />
                        <DetailField label="Departamento" value={intention.logistica?.departamento} />
                        <DetailField label="Planta/Local" value={intention.logistica?.planta} />
                      </div>
                    </div>
                  </section>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                        <Package className="h-4 w-4 text-[#5cb89a]" /> Detalle de Productos (Editable)
                      </h2>
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr className="text-left text-xs font-semibold uppercase text-gray-600">
                              <th className="px-4 py-3">Producto</th>
                              <th className="px-4 py-3">Cantidad</th>
                              <th className="px-4 py-3">Tipo Producto</th>
                              <th className="px-4 py-3">Vida Útil</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {editedProducts.map((p: any, idx: number) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-sm text-gray-900">{p.nombre || p.producto}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{p.cantidad} {p.unidad}</td>
                                <td className="px-4 py-3">
                                  <input
                                    className="w-full p-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#5cb89a] outline-none"
                                    value={p.tipoProducto || ""}
                                    onChange={(e) => handleProductChange(idx, 'tipoProducto', e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{p.vidaUtil}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                        <InfoIcon className="h-4 w-4 text-[#5cb89a]" /> Condiciones del Producto (Según Donante)
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
                      <Truck className="h-4 w-4 text-[#5cb89a]" /> Definir Estrategia Logística
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(STRATEGIES).map(([id, strategy]) => (
                        <div
                          key={id}
                          onClick={() => setSelectedStrategy(id as StrategyId)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedStrategy === id ? "border-[#5cb89a] bg-[#5cb89a]/5 ring-1 ring-[#5cb89a]" : "border-gray-100 hover:border-gray-300"}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${selectedStrategy === id ? "bg-[#5cb89a] text-white" : "bg-gray-100 text-gray-500"}`}>
                                <Truck className="h-5 w-5" />
                              </div>
                              <h3 className="font-bold text-gray-900">{strategy.title}</h3>
                              {strategy.recommended && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">RECOMENDADO</span>}
                            </div>
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedStrategy === id ? "border-[#5cb89a] bg-[#5cb89a]" : "border-gray-300"}`}>
                              {selectedStrategy === id && <div className="h-2 w-2 bg-white rounded-full" />}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase">Ventajas</p>
                              {strategy.advantages.map((adv, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                                  <CheckCircle className="h-3 w-3 text-green-500" /> {adv}
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase">Consideraciones</p>
                              {strategy.considerations.map((con, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                                  <div className="h-1 w-1 bg-gray-400 rounded-full" /> {con}
                                </div>
                              ))}
                            </div>
                          </div>
                          {strategy.specialNote && (
                            <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-xs text-amber-700 font-medium">
                              <AlertCircle className="h-3 w-3" /> {strategy.specialNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase">Observaciones Logísticas (Opcional)</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#5cb89a] outline-none min-h-[80px]"
                        value={logisticsObs}
                        onChange={(e) => setLogisticsObs(e.target.value)}
                        placeholder="Ingrese observaciones adicionales sobre la estrategia..."
                      />
                    </div>
                  </section>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                        <ClipboardList className="h-4 w-4 text-[#5cb89a]" /> Resumen Logístico
                      </h2>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Info label="Volumen Total" value="12 m³" />
                        <Info label="Peso Estimado" value="450 kg" />
                        <Info label="Cajas Estimadas" value="20 cajas" />
                        <Info label="Temperatura" value="Ambiente (15-25°C)" />
                        <Info label="Urgencia" value="Media" />
                        <Info label="Tiempo Disponible" value="48 horas" />
                        <Info label="Fecha Límite Sugerida" value="2026-09-12" />
                      </div>
                    </section>
                    <section className="rounded-xl border border-gray-200 bg-[#5cb89a]/10 p-6 shadow-sm border-[#5cb89a]/30">
                      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-[#4a9a82]">
                        <CheckCircle2 className="h-4 w-4" /> Recomendaciones del Sistema
                      </h2>
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        "Se recomienda recojo con unidades del BAP debido a la cercanía, disponibilidad y control de la cadena de frío."
                      </p>
                    </section>
                  </div>
                )}

                {currentStep === 4 && (
                  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <CheckCircle className="h-4 w-4 text-[#5cb89a]" /> Aprobación de Logística
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase">Responsable de Aprobación</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:ring-2 focus:ring-[#5cb89a] outline-none"
                            placeholder="Nombre del responsable"
                            value={responsable}
                            onChange={(e) => setResponsable(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase">Estado de Aprobación</label>
                        <div className="flex gap-2">
                          {[
                            { id: 'aprobado', label: 'Aprobado', color: 'bg-green-500' },
                            { id: 'observaciones', label: 'Con Obs.', color: 'bg-yellow-500' },
                            { id: 'rechazado', label: 'Rechazado', color: 'bg-red-500' },
                          ].map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => setApprovalStatus(opt.id as ApprovalStatus)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${approvalStatus === opt.id ? `${opt.color} text-white ring-2 ring-offset-1 ring-gray-400` : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase">Observaciones de Aprobación</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-800 focus:ring-2 focus:ring-[#5cb89a] outline-none min-h-[100px]"
                        value={approvalObs}
                        onChange={(e) => setApprovalObs(e.target.value)}
                        placeholder="Ingrese observaciones sobre la aprobación..."
                      />
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-xs text-blue-700 font-medium text-center">
                        Flujo: Logística $\rightarrow$ Gerencia General (Si es transporte externo) $\rightarrow$ Distribución
                      </p>
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
                    <button onClick={handleFinalize} className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 ${approvalStatus === 'pendiente' ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#5cb89a] to-[#7dc8ad] hover:brightness-105"}`}>
                      <CheckCircle className="h-4 w-4" /> Finalizar Intención
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
      <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-100 min-h-[40px]">{value || "No especificado"}</p>
    </div>
  );
}
