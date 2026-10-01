import { useState, useEffect, type FormEvent, useRef } from "react";
import { Save, Trash2, Loader2, FileText, Package, CheckCircle, Truck } from "lucide-react";
import ProductosGrid from "../components/intencion/ProductosGrid";
import UbigeoSelector from "../components/intencion/UbigeoSelector";
import {
  type CompromisoIdoneidad,
  type CondicionAlmacenamiento,
  type DocumentoAdjunto,
  type FotoAdjunta,
  type Intencion,
  type MotivoDonacion,
  type ProductoIntencion,
  type ProductoSensible,
  type Procedencia,
  type TipoIntencion,
  type TipoProducto,
  type UnidadMedida,
  TipoLugar,
  Distrito,
  Provincia,
  Departamento,
  TipoAcceso,
  DiasAtencion,
  Anticipacion
} from "../types/intencion";
import { intencionStore } from "../services/intencionStore";
import { useCatalogs, catalogStore } from "../services/catalogStore";
import { saveIntencion } from "../services/intencionService";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { FormField } from "../components/ui/FormField";
import Tooltip from "../components/ui/Tooltip";

interface Props {
  onCancelar: () => void;
  onGuardada: () => void;
}

interface ProductoForm {
  id: string;
  producto: string;
  descripcion: string;
  cantidad: string;
  unidad: UnidadMedida;
  pesoEstimadoKg: string;
  vidaUtil: string;
  tipoProducto: TipoProducto;
  procedencia: Procedencia;
}

interface CalidadForm {
  motivoDonacion: MotivoDonacion | "";
  compromisoIdoneidad: CompromisoIdoneidad[];
  condicionAlmacenamiento: CondicionAlmacenamiento | "";
  fechaEstimadaEntrega: string;
  descripcionGeneralDonacion: string;
  incluyeProductosSensibles: ProductoSensible | "";
  recomendacionesConsumo: string;
  condicionProducto: string;
  declaracionProducto: boolean;
  documentos: DocumentoAdjunto[];
  fotos: FotoAdjunta[];
}

interface LogisticaForm {
  tipoLugar: TipoLugar;
  lugar: string;
  contactoPlanta: string;
  direccion: string;
  referencia: string;
  distrito: Distrito;
  provincia: Provincia;
  departamento: Departamento;
  codigoPostal: string;

  tipoAcceso: TipoAcceso;
  horarioInicio: string;
  horarioFinal: string;
  diasAtencion: DiasAtencion[];

  requiereAutorizacion: "Si" | "No";
  anticipacion: Anticipacion;
  contactoAutorizacion: string;
  numeroContacto: string;
  requisitosIngreso: string[];

  fechaDesde: string;
  fechaHasta: string;
  horarioDisponible: string;
  tiempoEstimadoCarga: string;

  latitud: string;
  longitud: string;
  observacionesAcceso: string;
}

const emptyProducto = (): ProductoForm => ({
  id: crypto.randomUUID(),
  producto: "",
  descripcion: "",
  cantidad: "1",
  unidad: "unidad",
  pesoEstimadoKg: "0",
  vidaUtil: "",
  tipoProducto: "No perecible",
  procedencia: "Nacional",
});

const toProductoIntencion = (p: ProductoForm): ProductoIntencion => ({
  id: p.id,
  producto: p.producto,
  descripcion: p.descripcion,
  cantidad: Number(p.cantidad) || 0,
  unidad: p.unidad,
  pesoEstimadoKg: Number(p.pesoEstimadoKg) || 0,
  vidaUtil: p.vidaUtil,
  tipoProducto: p.tipoProducto,
  procedencia: p.procedencia,
});

export default function NuevaIntencion({ onCancelar, onGuardada }: Props) {
  const catalogs = useCatalogs();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: "producto" | "documento" | "foto" } | null>(null);

  const firstErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    catalogStore.loadCatalogs();
  }, []);

  const [donante, setDonante] = useState("");
  const [contacto, setContacto] = useState("");
  const [fechaIntencion, setFechaIntencion] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [canal, setCanal] = useState<string>("WhatsApp");
  const [responsable, setResponsable] = useState("");
  const [tipoIntencion, setTipoIntencion] = useState<string>("Donacion");

  const [productosForm, setProductosForm] = useState<ProductoForm[]>([
    emptyProducto(),
  ]);

  const [calidadForm, setCalidadForm] = useState<CalidadForm>({
    motivoDonacion: "",
    compromisoIdoneidad: [],
    condicionAlmacenamiento: "",
    fechaEstimadaEntrega: "",
    descripcionGeneralDonacion: "",
    incluyeProductosSensibles: "",
    recomendacionesConsumo: "",
    condicionProducto: "",
    declaracionProducto: false,
    documentos: [],
    fotos: [],
  });

  const [logisticaForm, setLogisticaForm] = useState<LogisticaForm>({
    tipoLugar: "Centro de acopio",
    lugar: "",
    contactoPlanta: "",
    direccion: "",
    referencia: "",
    distrito: "Cercado de Lima",
    provincia: "Canta",
    departamento: "Lima",
    codigoPostal: "",

    tipoAcceso: "Peatonal",
    horarioInicio: "",
    horarioFinal: "",
    diasAtencion: [],

    requiereAutorizacion: "No",
    anticipacion: "24 horas",
    contactoAutorizacion: "",
    numeroContacto: "",
    requisitosIngreso: [],

    fechaDesde: "",
    fechaHasta: "",
    horarioDisponible: "",
    tiempoEstimadoCarga: "",

    latitud: "",
    longitud: "",
    observacionesAcceso: "",
  });

  const setProductoField = <K extends keyof ProductoForm>(
    id: string,
    key: K,
    value: ProductoForm[K]
  ) =>
    setProductosForm((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );
  const setCalidadField = <K extends keyof CalidadForm>(
    key: K,
    value: CalidadForm[K]
  ) => {
    setCalidadForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setLogisticaField = <K extends keyof LogisticaForm>(
    key: K,
    value: LogisticaForm[K]
  ) => {
    setLogisticaForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const agregarProducto = () =>
    setProductosForm((prev) => [...prev, emptyProducto()]);

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;

    const { id, type } = confirmDelete;

    if (type === "producto") {
      if (productosForm.length > 1) {
        setProductosForm((prev) =>
          prev.filter((p) => p.id !== id)
        );
      }
    }

    if (type === "documento") {
      setCalidadForm((prev) => ({
        ...prev,
        documentos: prev.documentos.filter((d) => d.id !== id),
      }));
    }

    if (type === "foto") {
      setCalidadForm((prev) => ({
        ...prev,
        fotos: prev.fotos.filter((f) => f.id !== id),
      }));
    }

    setConfirmDelete(null);
  };

  const handleAddDocumentos = (files: FileList) => {
    const nuevos: DocumentoAdjunto[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      nombre: f.name,
      tipo: f.type,
      tamanoKb: Math.round(f.size / 1024),
      url: URL.createObjectURL(f),
    }));

    setCalidadForm((prev) => ({
      ...prev,
      documentos: [...prev.documentos, ...nuevos],
    }));
  };

  const handleAddFotos = (files: FileList) => {
    const nuevas: FotoAdjunta[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      nombre: f.name,
      url: URL.createObjectURL(f),
    }));

    setCalidadForm((prev) => ({
      ...prev,
      fotos: [...prev.fotos, ...nuevas],
    }));
  };
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!donante.trim()) errors.donante = "El donante es obligatorio";
    if (!contacto.trim()) errors.contacto = "El contacto es obligatorio";
    if (!responsable.trim()) errors.responsable = "El responsable es obligatorio";

    productosForm.forEach((p, idx) => {
      if (!p.producto.trim()) errors[`prod_${idx}_nombre`] = "El nombre del producto es obligatorio";
      if (Number(p.cantidad) <= 0) errors[`prod_${idx}_cant`] = "La cantidad debe ser mayor a 0";
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      firstErrorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productosValidos: ProductoIntencion[] =
        productosForm
          .filter((p) => p.producto.trim() !== "")
          .map((p) => ({
            ...toProductoIntencion(p),
            producto: p.producto.trim(),
            descripcion: p.descripcion.trim(),
          }));

      const year = new Date().getFullYear();

      const seq = String(
        intencionStore.getAll().length + 1
      ).padStart(4, "0");

      const codigo = `INT-${year}-${seq}`;

      const nueva: Intencion = {
        id: crypto.randomUUID(),
        codigo,

        donante: donante.trim(),
        contacto: contacto.trim(),
        fechaIntencion,
        canal,
        responsable: responsable.trim(),
        tipoIntencion,

        estado: "Pendiente",

        // MUCHOS PRODUCTOS
        productos: productosValidos,

        // CALIDAD - UNA SOLA
        motivoDonacion:
          calidadForm.motivoDonacion || undefined,

        compromisoIdoneidad:
          calidadForm.compromisoIdoneidad.length > 0
            ? calidadForm.compromisoIdoneidad
            : undefined,

        condicionAlmacenamiento:
          calidadForm.condicionAlmacenamiento || undefined,

        fechaEstimadaEntrega:
          calidadForm.fechaEstimadaEntrega || undefined,

        descripcionGeneralDonacion:
          calidadForm.descripcionGeneralDonacion.trim() ||
          undefined,

        incluyeProductosSensibles:
          calidadForm.incluyeProductosSensibles || undefined,

        recomendacionesConsumo:
          calidadForm.recomendacionesConsumo.trim() ||
          undefined,

        condicionProducto:
          calidadForm.condicionProducto.trim() ||
          undefined,

        declaracionProducto:
          calidadForm.declaracionProducto,

        documentos: calidadForm.documentos,

        fotos: calidadForm.fotos,

        // LOGÍSTICA - UNA SOLA
        logistica: {
          ...logisticaForm,

          lugar: logisticaForm.lugar.trim(),
          contactoPlanta:
            logisticaForm.contactoPlanta.trim(),
          direccion:
            logisticaForm.direccion.trim(),
          referencia:
            logisticaForm.referencia.trim(),
          codigoPostal:
            logisticaForm.codigoPostal.trim(),
          contactoAutorizacion:
            logisticaForm.contactoAutorizacion.trim(),
          numeroContacto:
            logisticaForm.numeroContacto.trim(),
          latitud:
            logisticaForm.latitud.trim(),
          longitud:
            logisticaForm.longitud.trim(),
          observacionesAcceso:
            logisticaForm.observacionesAcceso.trim(),
        },

        createdAt: new Date().toISOString(),
      };

      intencionStore.add(nueva);

      showToast(
        "¡Intención guardada exitosamente en el sistema local!",
        "success"
      );

      onGuardada();
    } catch (error: any) {
      showToast(
        error.message ||
        "Ocurrió un error al guardar la intención",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "general", label: "Datos Generales", icon: FileText },
    { id: "productos", label: "Productos", icon: Package },
    { id: "calidad", label: "Calidad", icon: CheckCircle },
    { id: "logistica", label: "Logística", icon: Truck },
  ];

  const activeTabIndex = tabs.findIndex((t) => t.id === activeTab) + 1;

  return (
    <div className="px-6 py-6 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
            Módulo de intención
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Nueva intención</h1>
        </div>
        <Button variant="secondary" onClick={onCancelar}>
          Volver
        </Button>
      </div>

      {catalogs.isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-[#5cb89a]" />
            <p className="text-sm font-medium text-gray-600">Cargando catálogos...</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase">
            Progreso: Paso {activeTabIndex} de {tabs.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-t-lg
                  ${activeTab === tab.id
                    ? "bg-[#5cb89a] text-white shadow-sm"
                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {activeTab === "general" && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#5cb89a]" />
              Datos de la intención
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div ref={firstErrorRef}>
                <Input
                  label="Donante"
                  required
                  value={donante}
                  onChange={(e) => setDonante(e.target.value)}
                  placeholder="Razon social o nombre"
                  error={validationErrors.donante}
                />
              </div>
              <Input
                label="Contacto"
                required
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Correo o telefono"
                error={validationErrors.contacto}
              />
              <Input
                label="Fecha de intención"
                type="date"
                value={fechaIntencion}
                onChange={(e) => setFechaIntencion(e.target.value)}
              />
              <Select
                label="Canal"
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
              >
                {catalogs.canales.map((item: any) => (
                  <option key={item.id || item} value={item.id || item}>
                    {item.name || item}
                  </option>
                ))}
              </Select>
              <Input
                label="Responsable"
                required
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nombre del responsable"
                error={validationErrors.responsable}
              />
              <Select
                label="Tipo de intención"
                value={tipoIntencion}
                onChange={(e) => setTipoIntencion(e.target.value)}
              >
                {catalogs.tiposIntencion.map((item: any) => (
                  <option key={item.id || item} value={item.id || item}>
                    {item.name || item}
                  </option>
                ))}
              </Select>
            </div>
          </section>
        )}

        {activeTab === "productos" && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#5cb89a]" />
                Productos
              </h2>
              <Button
                variant="primary"
                onClick={agregarProducto}
                leftIcon={<span className="text-lg">+</span>}
              >
                Agregar producto
              </Button>
            </div>

            <div className="space-y-6">
              {productosForm.map((p, idx) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                    <p className="text-sm font-bold text-gray-700">
                      Producto #{idx + 1}
                    </p>
                    {productosForm.length > 1 && (
                      <Button
                        variant="danger"
                        className="px-2 py-1 h-8"
                        onClick={() => setConfirmDelete({ id: p.id, type: "producto" })}
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      >
                        Quitar fila
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                      <Input
                        label="Producto"
                        required
                        value={p.producto}
                        onChange={(e) => setProductoField(p.id, "producto", e.target.value)}
                        placeholder="Nombre del producto"
                        error={validationErrors[`prod_${idx}_nombre`]}
                      />
                    </div>
                    <Input
                      label="Cantidad"
                      type="number"
                      min="0"
                      value={p.cantidad}
                      onChange={(e) => setProductoField(p.id, "cantidad", e.target.value)}
                      error={validationErrors[`prod_${idx}_cant`]}
                    />
                    <Select
                      label="Unidad"
                      value={p.unidad}
                      onChange={(e) => setProductoField(p.id, "unidad", e.target.value as UnidadMedida)}
                    >
                      {catalogs.unidades.map((u: any) => (
                        <option key={u.id || u} value={u.id || u}>
                          {u.name || u}
                        </option>
                      ))}
                    </Select>
                    <div className="lg:col-span-2">
                      <Input
                        label="Descripcion"
                        value={p.descripcion}
                        onChange={(e) => setProductoField(p.id, "descripcion", e.target.value)}
                        placeholder="Detalle / presentacion"
                      />
                    </div>
                    <Input
                      label="Peso estimado (kg)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={p.pesoEstimadoKg}
                      onChange={(e) => setProductoField(p.id, "pesoEstimadoKg", e.target.value)}
                    />
                    <Input
                      label="Vida util"
                      type="date"
                      value={p.vidaUtil}
                      onChange={(e) => setProductoField(p.id, "vidaUtil", e.target.value)}
                    />
                    <Select
                      label="Tipo de producto"
                      value={p.tipoProducto}
                      onChange={(e) => setProductoField(p.id, "tipoProducto", e.target.value as TipoProducto)}
                    >
                      {catalogs.tiposProducto.map((item: any) => (
                        <option key={item.id || item} value={item.id || item}>
                          {item.name || item}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="Procedencia"
                      value={p.procedencia}
                      onChange={(e) => setProductoField(p.id, "procedencia", e.target.value as Procedencia)}
                    >
                      {catalogs.procedencias.map((item: any) => (
                        <option key={item.id || item} value={item.id || item}>
                          {item.name || item}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-sm font-bold text-gray-700">
                Vista previa del panel de productos
              </h3>
              <ProductosGrid
                catalogs={catalogs}
                productos={productosForm
                  .filter((p) => p.producto.trim() !== "")
                  .map(toProductoIntencion)}
              />
            </div>
          </section>
        )}

        {activeTab === "calidad" && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#5cb89a]" />
              Información de Calidad
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Select
                label="Motivo de donación"
                value={calidadForm.motivoDonacion}
                onChange={(e) => setCalidadField(
                  "motivoDonacion",
                  e.target.value as MotivoDonacion
                )
                }
              >

                {catalogs.motivosDonacion.map((item: any) => (
                  <option key={item.id || item} value={item.id || item}>
                    {item.name || item}
                  </option>
                ))}
              </Select>

              <Select
                label="Condición de almacenamiento"
                value={calidadForm.condicionAlmacenamiento}
                onChange={(e) => setCalidadField(
                  "condicionAlmacenamiento",
                  e.target.value as CondicionAlmacenamiento)}
              >
                {catalogs.condicionAlmacenamiento.map((item: any) => (
                  <option key={item.id || item} value={item.id || item}>
                    {item.name || item}
                  </option>
                ))}
              </Select>
              <Input
                label="Fecha estimada de entrega"
                type="date"
                value={calidadForm.fechaEstimadaEntrega}
                onChange={(e) => setCalidadField(
                  "fechaEstimadaEntrega",
                  e.target.value)}
              />
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span>¿Incluye insumos sensibles?</span>

                  <Tooltip
                    content={
                      <>
                        <p className="font-semibold">Productos sensibles:</p>
                        <ul className="list-disc pl-4">
                          <li>Proteínas y derivados</li>
                          <li>Refrigerados o congelados</li>
                          <li>Suplementos alimenticios</li>
                          <li>Comida preparada</li>
                        </ul>
                      </>
                    }
                  >
                    <span className="cursor-help text-gray-500">ⓘ</span>
                  </Tooltip>
                </div>

                <Select
                  value={calidadForm.incluyeProductosSensibles ? "true" : "false"}
                  onChange={(e) =>
                    setCalidadField("incluyeProductosSensibles", e.target.value as ProductoSensible)
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Compromiso de idoneidad
                </label>

                <div className="grid grid-cols-3 gap-6 w-full">
                  {/* Check 1 */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calidadForm.compromisoIdoneidad.includes(
                        "envase_integro"
                      )}

                      onChange={(e) => {
                        const value = "envase_integro";

                        setCalidadField("compromisoIdoneidad",
                          e.target.checked
                            ? [...calidadForm.compromisoIdoneidad, value]
                            : calidadForm.compromisoIdoneidad.filter(
                              (item) => item !== value
                            )
                        );
                      }}
                      className="mt-1 h-4 w-4 shrink-0"
                    />

                    <span className="text-sm text-gray-700 leading-6">
                      Envase íntegro y sellado (cuando aplique)
                    </span>
                  </label>

                  {/* Check 2 */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0"
                      checked={calidadForm.compromisoIdoneidad.includes("sin_deterioro")}
                      onChange={(e) => {
                        const value = "sin_deterioro";
                        setCalidadField(
                          "compromisoIdoneidad",
                          e.target.checked
                            ? [...calidadForm.compromisoIdoneidad, value]
                            : calidadForm.compromisoIdoneidad.filter(
                              (item) => item !== value
                            )
                        );
                      }}
                    />

                    <span className="text-sm text-gray-700 leading-6">
                      Producto sin signos de deterioro, contaminación o descomposición
                    </span>
                  </label>

                  {/* Check 3 */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0"
                      checked={calidadForm.compromisoIdoneidad.includes(
                        "conservacion"
                      )}
                      onChange={(e) => {
                        const value = "conservacion";

                        setCalidadField(
                          "compromisoIdoneidad",
                          e.target.checked
                            ? [...calidadForm.compromisoIdoneidad, value]
                            : calidadForm.compromisoIdoneidad.filter(
                              (item) => item !== value
                            )
                        );
                      }}
                    />

                    <span className="text-sm text-gray-700 leading-6">
                      Conservado según las condiciones establecidas por el fabricante
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <FormField label="Descripción general de la donación">
                <textarea
                  value={calidadForm.descripcionGeneralDonacion}
                  onChange={(e) => setCalidadField("descripcionGeneralDonacion", e.target.value)}
                  rows={4}
                  placeholder="Describe la donación..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
                />
              </FormField>

              <FormField label="Recomendaciones de consumo">
                <textarea
                  value={calidadForm.recomendacionesConsumo}
                  onChange={(e) => setCalidadField("recomendacionesConsumo", e.target.value)}
                  rows={3}
                  placeholder="Ingresa recomendaciones de consumo..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
                />
              </FormField>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={calidadForm.declaracionProducto}
                    onChange={(e) => setCalidadField("declaracionProducto", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#5cb89a] focus:ring-[#5cb89a]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Declaración del producto</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Declaro que la información proporcionada sobre el producto es correcta.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="mb-4 text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Documentos
                </h3>
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                  <input
                    type="file"
                    multiple
                    onChange={handleAddDocumentos}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#5cb89a]/10 file:text-[#5cb89a] hover:file:bg-[#5cb89a]/20"
                  />
                  {documentos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {documentos.map((documento) => (
                        <div
                          key={documento.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <span className="text-sm text-gray-700">{documento.name}</span>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-7"
                            onClick={() => setConfirmDelete({ id: documento.id, type: "documento" })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Fotografías
                </h3>
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddFotos}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#5cb89a]/10 file:text-[#5cb89a] hover:file:bg-[#5cb89a]/20"
                  />
                  {fotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {fotos.map((foto) => (
                        <div
                          key={foto.id}
                          className="relative rounded-lg border border-gray-200 bg-white p-2"
                        >
                          <img src={foto.url} alt={foto.name} className="h-32 w-full rounded object-cover" />
                          <Button
                            variant="ghost"
                            className="absolute top-1 right-1 p-1 h-7 w-7 rounded-full bg-white/80 text-red-600 hover:bg-white"
                            onClick={() => setConfirmDelete({ id: foto.id, type: "foto" })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "logistica" && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#5cb89a]" />
                Lugar de Recojo
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Select
                  label="Tipo de Lugar"
                  value={logisticaForm.tipoLugar}
                  onChange={(e) => setLogisticaField("tipoLugar", e.target.value as TipoLugar)}
                >
                  {catalogs.tipoLugar.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Nombre del lugar / Planta"
                  value={logisticaForm.lugar}
                  onChange={(e) => setLogisticaField("lugar", e.target.value)}
                  placeholder="Nombre del Lugar / Planta"
                />
                <Input
                  label="Persona contacto en Planta"
                  value={logisticaForm.contactoPlanta}
                  onChange={(e) => setLogisticaField("contactoPlanta", e.target.value)}
                  placeholder="Persona contacto en Planta"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Dirección"
                    value={logisticaForm.direccion}
                    onChange={(e) => setLogisticaField("direccion", e.target.value)}
                    placeholder="Dirección"
                  />
                </div>
                <Input
                  label="Referencia"
                  value={logisticaForm.referencia}
                  onChange={(e) => setLogisticaField("referencia", e.target.value)}
                  placeholder="Referencia"
                />
                <Input
                  label="Código Postal"
                  value={logisticaForm.codigoPostal}
                  onChange={(e) => setLogisticaField("codigoPostal", e.target.value)}
                  placeholder="Código Postal"
                />
                <div className="lg:col-span-4">
                  <UbigeoSelector
                    initialValues={{
                      departamento: logisticaForm.departamento,
                      provincia: logisticaForm.provincia,
                      distrito: logisticaForm.distrito
                    }}
                    onChange={(key, value) =>
                      setLogisticaField(
                        key as keyof LogisticaForm,
                        value as never
                      )
                    }
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Package className="h-5 w-5 text-[#5cb89a]" />
                Ubicación en mapa
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <Input
                  label="Latitud"
                  value={logisticaForm.latitud}
                  onChange={(e) =>
                    setLogisticaField("latitud", e.target.value)
                  }
                  placeholder="Ej. -12.046374"
                  helperText="Puedes obtenerla desde Google Maps"
                />

                <Input
                  label="Longitud"
                  value={logisticaForm.longitud}
                  onChange={(e) =>
                    setLogisticaField("longitud", e.target.value)
                  }
                  placeholder="Ej. -77.042793"
                  helperText="Puedes obtenerla desde Google Maps"
                />

              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Truck className="h-5 w-5 text-[#5cb89a]" />
                Accesos y requisitos de recojo
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                <Select
                  label="Tipo de acceso"
                  value={logisticaForm.tipoAcceso}
                  onChange={(e) =>
                    setLogisticaField(
                      "tipoAcceso",
                      e.target.value as TipoAcceso
                    )
                  }
                >
                  {catalogs.tipoAcceso.map((item: any) => (
                    <option key={item.id || item} value={item.id || item}>
                      {item.name || item}
                    </option>
                  ))}
                </Select>

                <FormField label="Horario de atención">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={logisticaForm.horarioInicio}
                      onChange={(e) =>
                        setLogisticaField(
                          "horarioInicio",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />

                    <span>a</span>

                    <input
                      type="time"
                      value={logisticaForm.horarioFinal}
                      onChange={(e) =>
                        setLogisticaField(
                          "horarioFinal",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </FormField>

                <FormField
                  label="Días de atención"
                  className="md:col-span-2"
                >
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Lunes",
                      "Martes",
                      "Miércoles",
                      "Jueves",
                      "Viernes",
                      "Sábado",
                      "Domingo",
                    ].map((dia) => {
                      const seleccionado =
                        logisticaForm.diasAtencion.includes(
                          dia as DiasAtencion
                        );

                      return (
                        <label
                          key={dia}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${seleccionado
                            ? "border-[#5cb89a] bg-[#5cb89a]/10"
                            : "border-gray-300 bg-white"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={seleccionado}
                            onChange={(e) => {
                              const nuevos = e.target.checked
                                ? [
                                  ...logisticaForm.diasAtencion,
                                  dia as DiasAtencion,
                                ]
                                : logisticaForm.diasAtencion.filter(
                                  (d) => d !== dia
                                );

                              setLogisticaField(
                                "diasAtencion",
                                nuevos
                              );
                            }}
                          />

                          {dia}
                        </label>
                      );
                    })}
                  </div>
                </FormField>

                <FormField label="¿Requiere autorización previa?">
                  <div className="flex gap-6">
                    <label>
                      <input
                        type="radio"
                        checked={logisticaForm.requiereAutorizacion === "Si"}
                        onChange={() =>
                          setLogisticaField(
                            "requiereAutorizacion",
                            "Si"
                          )
                        }
                      />
                      <span className="ml-2">Sí</span>
                    </label>

                    <label>
                      <input
                        type="radio"
                        checked={logisticaForm.requiereAutorizacion === "No"}
                        onChange={() =>
                          setLogisticaField(
                            "requiereAutorizacion",
                            "No"
                          )
                        }
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </FormField>

                <Select
                  label="Tiempo de anticipación requerida"
                  value={logisticaForm.anticipacion}
                  onChange={(e) =>
                    setLogisticaField(
                      "anticipacion",
                      e.target.value as Anticipacion
                    )
                  }
                >
                  {catalogs.anticipacion.map((item: any) => (
                    <option key={item.id || item} value={item.id || item}>
                      {item.name || item}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Contacto de autorización"
                  value={logisticaForm.contactoAutorizacion}
                  onChange={(e) =>
                    setLogisticaField(
                      "contactoAutorizacion",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Número de contacto"
                  value={logisticaForm.numeroContacto}
                  onChange={(e) =>
                    setLogisticaField(
                      "numeroContacto",
                      e.target.value
                    )
                  }
                />

              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Truck className="h-5 w-5 text-[#5cb89a]" />
                Disponibilidad para recojo
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                <Input
                  label="Fecha desde"
                  type="date"
                  value={logisticaForm.fechaDesde}
                  onChange={(e) =>
                    setLogisticaField("fechaDesde", e.target.value)
                  }
                />

                <Input
                  label="Fecha hasta"
                  type="date"
                  value={logisticaForm.fechaHasta}
                  onChange={(e) =>
                    setLogisticaField("fechaHasta", e.target.value)
                  }
                />

                <Input
                  label="Horario disponible"
                  value={logisticaForm.horarioDisponible}
                  onChange={(e) =>
                    setLogisticaField(
                      "horarioDisponible",
                      e.target.value
                    )
                  }
                  placeholder="Ej. 09:00 - 17:00"
                />

                <Input
                  label="Tiempo estimado de carga (min)"
                  type="number"
                  min="0"
                  value={logisticaForm.tiempoEstimadoCarga}
                  onChange={(e) =>
                    setLogisticaField(
                      "tiempoEstimadoCarga",
                      e.target.value
                    )
                  }
                />

              </div>
            </section>
          </div>
        )}

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Guardar intención
          </Button>
        </div>
      </form>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirmar eliminación"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Eliminar definitivamente
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
