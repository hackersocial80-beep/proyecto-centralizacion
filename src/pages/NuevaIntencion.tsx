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
  motivosDonacion: MotivoDonacion[];
  compromisosIdoneidad: CompromisoIdoneidad[];
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
  motivosDonacion: "Exceso de Produccion",
  compromisosIdoneidad: "",
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
  tipoLugar: p.tipoLugar,
  lugar: p.lugar,
  contactoPlanta: p.contactoPlanta,
  direccion: p.direccion,
  referencia: p.referencia,
  distrito: p.distrito,
  provincia: p.provincia,
  departamento: p.departamento,
  codigoPostal: p.codigoPostal,
  tipoAcceso: p.tipoAcceso,
  horarioInicio: p.horarioInicio,
  horarioFinal: p.horarioFinal,
  diasAtencion: p.diasAtencion,
  requiereAutorizacion: p.requiereAutorizacion,
  anticipacion: p.anticipacion,
  contactoAutorizacion: p.contactoAutorizacion,
  numeroContacto: p.numeroContacto,
  requisitosIngreso: p.requisitosIngreso,
  fechaDesde: p.fechaDesde,
  fechaHasta: p.fechaHasta,
  horarioDisponible: p.horarioDisponible,
  tiempoEstimadoCarga: p.tiempoEstimadoCarga,
  latitud: p.latitud,
  longitud: p.longitud,
  observacionesAcceso: p.observacionesAcceso,
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

  const [motivoDonacion, setMotivoDonacion] = useState<string | "">("");
  const [compromisoIdoneidad, setCompromisoIdoneidad] =
    useState<CompromisoIdoneidad | "">("");
  const [condicionAlmacenamiento, setCondicionAlmacenamiento] =
    useState<CondicionAlmacenamiento | "">("");
  const [fechaEstimadaEntrega, setFechaEstimadaEntrega] = useState("");
  const [descripcionGeneralDonacion, setDescripcionGeneralDonacion] =
    useState("");
  const [incluyeProductosSensibles, setIncluyeProductosSensibles] =
    useState<ProductoSensible | "">("");
  const [recomendacionesConsumo, setRecomendacionesConsumo] = useState("");
  const [condicionProducto, setCondicionProducto] = useState("");
  const [declaracionProducto, setDeclaracionProducto] = useState("");
  const [documentos, setDocumentos] = useState<DocumentoAdjunto[]>([]);
  const [fotos, setFotos] = useState<FotoAdjunta[]>([]);

  const setProductoField = <K extends keyof ProductoForm>(
    id: string,
    key: K,
    value: ProductoForm[K]
  ) =>
    setProductosForm((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );

  const agregarProducto = () =>
    setProductosForm((prev) => [...prev, emptyProducto()]);

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    if (type === "producto") {
      if (productosForm.length > 1) {
        setProductosForm((prev) => prev.filter((p) => p.id !== id));
      }
    } else if (type === "documento") {
      setDocumentos((prev) => prev.filter((d) => d.id !== id));
    } else if (type === "foto") {
      setFotos((prev) => prev.filter((f) => f.id !== id));
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
    setDocumentos((prev) => [...prev, ...nuevos]);
  };

  const handleAddFotos = (files: FileList) => {
    const nuevas: FotoAdjunta[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      nombre: f.name,
      url: URL.createObjectURL(f),
    }));
    setFotos((prev) => [...prev, ...nuevas]);
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
      firstErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const productosValidos: ProductoIntencion[] = productosForm
        .filter((p) => p.producto.trim() !== "")
        .map((p) => ({
          ...toProductoIntencion(p),
          producto: p.producto.trim(),
          descripcion: p.descripcion.trim(),
          lugar: p.lugar.trim(),
          contactoPlanta: p.contactoPlanta.trim(),
          direccion: p.direccion.trim(),
          referencia: p.referencia.trim(),
          codigoPostal: p.codigoPostal.trim(),
          contactoAutorizacion: p.contactoAutorizacion.trim(),
          numeroContacto: p.numeroContacto.trim(),
          latitud: p.latitud.trim(),
          longitud: p.longitud.trim(),
          observacionesAcceso: p.observacionesAcceso.trim(),
        }));

      const year = new Date().getFullYear();
      const seq = String(intencionStore.getAll().length + 1).padStart(4, "0");
      const codigo = `INT-${year}-${seq}`;

      const nueva: Intencion = {
        id: crypto.randomUUID(),
        codigo,
        donante: donante.trim(),
        contacto: contacto.trim(),
        fechaIntencion,
        canal,
        responsable,
        tipoIntencion,
        estado: "Pendiente",
        productos: productosValidos,
        motivoDonacion: "Excedente de produccion",
        compromisoIdoneidad: compromisoIdoneidad || undefined,
        condicionAlmacenamiento: condicionAlmacenamiento || undefined,
        fechaEstimadaEntrega: fechaEstimadaEntrega || undefined,
        descripcionGeneralDonacion:
          descripcionGeneralDonacion.trim() || undefined,
        incluyeProductosSensibles: incluyeProductosSensibles || undefined,
        recomendacionesConsumo: recomendacionesConsumo.trim() || undefined,
        condicionProducto: condicionProducto.trim() || undefined,
        declaracionProducto: declaracionProducto.trim() || undefined,
        documentos,
        fotos,
        createdAt: new Date().toISOString(),
      };

      // Guardar en el backend
      await saveIntencion(nueva);

      // También mantener en el store local para visualización inmediata
      intencionStore.add(nueva);

      showToast("¡Intención guardada exitosamente en el servidor!", "success");
      onGuardada();
    } catch (error: any) {
      showToast(error.message || "Ocurrió un error al guardar la intención", "error");
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
                value={motivoDonacion}
                onChange={(e) => setMotivoDonacion(e.target.value as MotivoDonacion)}
              >
                <option value="">Seleccionar motivo</option>
                {catalogs.motivosDonacion.map((item: any) => (
                  <option key={item.id || item} value={item.id || item}>
                    {item.name || item}
                  </option>
                ))}
              </Select>
              <Select
                label="Compromiso de idoneidad"
                value={compromisoIdoneidad}
                onChange={(e) => setCompromisoIdoneidad(e.target.value as CompromisoIdoneidad)}
              >
                <option value="">Seleccionar</option>
                {catalogs.compromisosIdoneidad.map((item: any) => (
                  <option key={item.id || item} value={item.id || item}>
                    {item.name || item}
                  </option>
                ))}
              </Select>
              <Select
                label="Condición de almacenamiento"
                value={condicionAlmacenamiento}
                onChange={(e) => setCondicionAlmacenamiento(e.target.value as CondicionAlmacenamiento)}
              >
                <option value="">Seleccionar condición</option>
                {catalogs.condicionAlmacenamiento.map((item: any) => (
                  <option key={item.id || item} value={item.id || item}>
                    {item.name || item}
                  </option>
                ))}
              </Select>
              <Input
                label="Fecha estimada de entrega"
                type="date"
                value={fechaEstimadaEntrega}
                onChange={(e) => setFechaEstimadaEntrega(e.target.value)}
              />
              <Select
                label="Condición del producto"
                value={condicionProducto}
                onChange={(e) => setCondicionProducto(e.target.value)}
              >
                <option value="">Seleccionar condición</option>
                {catalogs.condicionesProducto?.map((item: any) => (
                  <option key={item.id || item} value={item.id || item}>
                    {item.name || item}
                  </option>
                ))}
              </Select>
              <Select
                label="¿Incluye productos sensibles?"
                value={incluyeProductosSensibles ? "true" : "false"}
                onChange={(e) => setIncluyeProductosSensibles(e.target.value === "true")}
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </Select>
            </div>

            <div className="mt-6 space-y-6">
              <FormField label="Descripción general de la donación">
                <textarea
                  value={descripcionGeneralDonacion}
                  onChange={(e) => setDescripcionGeneralDonacion(e.target.value)}
                  rows={4}
                  placeholder="Describe la donación..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
                />
              </FormField>

              <FormField label="Recomendaciones de consumo">
                <textarea
                  value={recomendacionesConsumo}
                  onChange={(e) => setRecomendacionesConsumo(e.target.value)}
                  rows={3}
                  placeholder="Ingresa recomendaciones de consumo..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
                />
              </FormField>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={declaracionProducto}
                    onChange={(e) => setDeclaracionProducto(e.target.checked)}
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
              <div className="space-y-6">
                {productosForm.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                      <p className="text-sm font-bold text-gray-700">
                        {p.producto || "Producto"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Select
                        label="Tipo de Lugar"
                        value={p.tipoLugar}
                        onChange={(e) => setProductoField(p.id, "tipoLugar", e.target.value as TipoLugar)}
                      >
                        {catalogs.tipoLugar.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label="Nombre del lugar / Planta"
                        value={p.lugar}
                        onChange={(e) => setProductoField(p.id, "lugar", e.target.value)}
                        placeholder="Nombre del Lugar / Planta"
                      />
                      <Input
                        label="Persona contacto en Planta"
                        value={p.contactoPlanta}
                        onChange={(e) => setProductoField(p.id, "contactoPlanta", e.target.value)}
                        placeholder="Persona contacto en Planta"
                      />
                      <div className="md:col-span-2">
                        <Input
                          label="Dirección"
                          value={p.direccion}
                          onChange={(e) => setProductoField(p.id, "direccion", e.target.value)}
                          placeholder="Dirección"
                        />
                      </div>
                      <Input
                        label="Referencia"
                        value={p.referencia}
                        onChange={(e) => setProductoField(p.id, "referencia", e.target.value)}
                        placeholder="Referencia"
                      />
                      <Input
                        label="Código Postal"
                        value={p.codigoPostal}
                        onChange={(e) => setProductoField(p.id, "codigoPostal", e.target.value)}
                        placeholder="Código Postal"
                      />
                      <div className="lg:col-span-4">
                        <UbigeoSelector
                          productoId={p.id}
                          initialValues={{
                            departamento: p.departamento,
                            provincia: p.provincia,
                            distrito: p.distrito
                          }}
                          onChange={setProductoField}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#5cb89a]" />
                Ubicación en mapa
              </h2>
              <div className="space-y-6">
                {productosForm.map((p) => {
                  const lat = parseFloat(p.latitud);
                  const lng = parseFloat(p.longitud);
                  const tieneCoord =
                    !isNaN(lat) &&
                    !isNaN(lng) &&
                    p.latitud.trim() !== "" &&
                    p.longitud.trim() !== "" &&
                    lat >= -90 &&
                    lat <= 90 &&
                    lng >= -180 &&
                    lng <= 180;
                  const delta = 0.01;
                  const mapUrl = tieneCoord
                    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`
                    : "";
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <p className="mb-4 text-sm font-bold text-gray-700">
                        {p.producto ? `Mapa - ${p.producto}` : `Mapa - Producto`}
                      </p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Input
                          label="Latitud"
                          value={p.latitud}
                          onChange={(e) => setProductoField(p.id, "latitud", e.target.value)}
                          placeholder="Ej. -12.046374"
                          helperText="Puedes obtenerla desde Google Maps"
                        />
                        <Input
                          label="Longitud"
                          value={p.longitud}
                          onChange={(e) => setProductoField(p.id, "longitud", e.target.value)}
                          placeholder="Ej. -77.042793"
                          helperText="Puedes obtenerla desde Google Maps"
                        />
                      </div>
                      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        {tieneCoord ? (
                          <>
                            <iframe
                              title={`Mapa de ubicación ${lat},${lng}`}
                              src={mapUrl}
                              className="h-[300px] w-full border-0"
                            />
                            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-500">
                              <span>© OpenStreetMap contributors</span>
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#5cb89a] hover:underline"
                              >
                                Ver mapa más grande
                              </a>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-[300px] items-center justify-center px-4 text-center text-sm text-gray-500">
                            Ingresa latitud y longitud válidas para visualizar el mapa.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#5cb89a]" />
                Accesos y requisitos de recojo
              </h2>
              <div className="space-y-6">
                {productosForm.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                      <p className="text-sm font-bold text-gray-700">
                        {p.producto || "Producto"} - Accesos
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Select
                        label="Tipo de acceso"
                        value={p.tipoAcceso}
                        onChange={(e) => setProductoField(p.id, "tipoAcceso", e.target.value as TipoAcceso)}
                      >
                        {catalogs.tipoAcceso.map((u: any) => (
                          <option key={u.id || u} value={u.id || u}>
                            {u.name || u}
                          </option>
                        ))}
                      </Select>
                      <FormField label="Horario de atención">
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={p.horarioInicio}
                            onChange={(e) => setProductoField(p.id, "horarioInicio", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
                          />
                          <span className="text-xs text-gray-500">a</span>
                          <input
                            type="time"
                            value={p.horarioFinal}
                            onChange={(e) => setProductoField(p.id, "horarioFinal", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
                          />
                        </div>
                      </FormField>
                      <FormField label="Días de atención" className="md:col-span-2">
                        <div className="flex flex-wrap gap-2">
                          {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dia) => {
                            const seleccionado = p.diasAtencion.includes(dia as DiasAtencion);
                            return (
                              <label
                                key={dia}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${seleccionado
                                  ? "border-[#5cb89a] bg-[#5cb89a]/10 text-[#318b70]"
                                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={seleccionado}
                                  onChange={(e) => {
                                    const nuevosDias: DiasAtencion[] = e.target.checked
                                      ? [...p.diasAtencion, dia as DiasAtencion]
                                      : p.diasAtencion.filter((d) => d !== dia);
                                    setProductoField(p.id, "diasAtencion", nuevosDias);
                                }}
                                  className="h-4 w-4 rounded border-gray-300 text-[#5cb89a] focus:ring-[#5cb89a]"
                                />
                                <span>{dia}</span>
                              </label>
                            );
                          })}
                        </div>
                      </FormField>
                      <FormField label="¿Requiere autorización previa?">
                        <div className="flex items-center gap-6">
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name={`autorizacion-${p.id}`}
                              value="Si"
                              checked={p.requiereAutorizacion === "Si"}
                              onChange={(e) => setProductoField(p.id, "requiereAutorizacion", e.target.value as "Si" | "No")}
                              className="h-4 w-4 text-[#5cb89a] focus:ring-[#5cb89a]"
                            />
                            Sí
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name={`autorizacion-${p.id}`}
                              value="No"
                              checked={p.requiereAutorizacion === "No"}
                              onChange={(e) => setProductoField(p.id, "requiereAutorizacion", e.target.value as "Si" | "No")}
                              className="h-4 w-4 text-[#5cb89a] focus:ring-[#5cb89a]"
                            />
                            No
                          </label>
                        </div>
                      </FormField>
                      <Select
                        label="Tiempo de anticipación requerida"
                        value={p.anticipacion}
                        onChange={(e) => setProductoField(p.id, "anticipacion", e.target.value as Anticipacion)}
                      >
                        {catalogs.anticipacion.map((t: any) => (
                          <option key={t.id || t} value={t.id || t}>
                            {t.name || t}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label="Contacto de autorización"
                        value={p.contactoAutorizacion}
                        onChange={(e) => setProductoField(p.id, "contactoAutorizacion", e.target.value)}
                        placeholder="Contacto de Autorización"
                      />
                      <Input
                        label="Numero de contacto"
                        value={p.numeroContacto}
                        onChange={(e) => setProductoField(p.id, "numeroContacto", e.target.value)}
                        placeholder="Número de Contacto"
                      />
                      <FormField label="Requisitos para el ingreso a planta" className="lg:col-span-4">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {["DNI vigente", "Carnet de sanidad", "Autorización del donante", "Uso obligatorio de EPP", "Seguro SCTR", "Inducción de seguridad", "Vehículo con sello de fumigación", "Otros requisitos"].map((requisito) => {
                            const seleccionado = p.requisitosIngreso.includes(requisito);
                            return (
                              <label
                                key={requisito}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${seleccionado
                                  ? "border-[#5cb89a] bg-[#5cb89a]/10 text-[#318b70]"
                                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={seleccionado}
                                  onChange={(e) => {
                                    const nuevosRequisitos = e.target.checked
                                      ? [...p.requisitosIngreso, requisito]
                                      : p.requisitosIngreso.filter((r) => r !== requisito);
                                    setProductoField(p.id, "requisitosIngreso", nuevosRequisitos);
                                }}
                                  className="h-4 w-4 rounded border-gray-300 text-[#5cb89a] focus:ring-[#5cb89a]"
                                />
                                <span>{requisito}</span>
                              </label>
                            );
                          })}
                        </div>
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#5cb89a]" />
                Disponibilidad para recojo
              </h2>
              <div className="space-y-6">
                {productosForm.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                      <p className="text-sm font-bold text-gray-700">
                        {p.producto || "Producto"} - Disponibilidad
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Input
                        label="Fecha desde"
                        type="date"
                        value={p.fechaDesde}
                        onChange={(e) => setProductoField(p.id, "fechaDesde", e.target.value)}
                      />
                      <Input
                        label="Fecha hasta"
                        type="date"
                        value={p.fechaHasta}
                        onChange={(e) => setProductoField(p.id, "fechaHasta", e.target.value)}
                      />
                      <Input
                        label="Horario disponible"
                        value={p.horarioDisponible}
                        onChange={(e) => setProductoField(p.id, "horarioDisponible", e.target.value)}
                        placeholder="Ej. 09:00 - 17:00"
                      />
                      <Input
                        label="Tiempo estimado de carga (min)"
                        type="number"
                        min="0"
                        value={p.tiempoEstimadoCarga}
                        onChange={(e) => setProductoField(p.id, "tiempoEstimadoCarga", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
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
