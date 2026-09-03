import { useState, useEffect, type FormEvent } from "react";
import { Save, Trash2, Loader2 } from "lucide-react";
import ProductosGrid from "../components/intencion/ProductosGrid";
import DetalleIntencion from "../components/intencion/DetalleIntencion";
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

const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20";

// Mapea ProductoForm -> ProductoIntencion con valores por defecto para los
// campos logisticos que aun no se han capturado en el formulario.
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

  useEffect(() => {
    catalogStore.loadCatalogs();
  }, []);

  // Cabecera
  const [donante, setDonante] = useState("");
  const [contacto, setContacto] = useState("");
  const [fechaIntencion, setFechaIntencion] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [canal, setCanal] = useState<string>("WhatsApp");
  const [responsable, setResponsable] = useState("");
  const [tipoIntencion, setTipoIntencion] = useState<string>("Donacion");

  // Productos
  const [productosForm, setProductosForm] = useState<ProductoForm[]>([
    emptyProducto(),
  ]);

  // Detalle
  const [motivoDonacion, setMotivoDonacion] = useState<MotivoDonacion | "">("");
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

  const eliminarProducto = (id: string) => {
    if (productosForm.length === 1) return;
    setProductosForm((prev) => prev.filter((p) => p.id !== id));
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!donante.trim() || !contacto.trim()) {
      alert("Completa los campos Donante y Contacto.");
      return;
    }

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
      motivoDonacion: motivoDonacion || undefined,
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

    intencionStore.add(nueva);
    onGuardada();
  };

  return (
    <div className="px-6 py-6 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
            Módulo de intención
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Nueva intención</h1>
        </div>
        <button
          type="button"
          onClick={onCancelar}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </button>
      </div>

      {catalogs.isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-[#5cb89a]" />
            <p className="text-sm font-medium text-gray-600">Cargando catálogos...</p>
          </div>
        </div>
      )}

      {catalogs.error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          <strong>Error al cargar catálogos:</strong> {catalogs.error}
          <p className="mt-1 text-xs">Por favor, revisa la consola del navegador (F12) para más detalles.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabecera */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Datos de la intención
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Donante
              </label>
              <input
                value={donante}
                onChange={(e) => setDonante(e.target.value)}
                placeholder="Razon social o nombre"
                className={inputBase}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Contacto
              </label>
              <input
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Correo o telefono"
                className={inputBase}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Fecha de intención
              </label>
              <input
                type="date"
                value={fechaIntencion}
                onChange={(e) => setFechaIntencion(e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Canal
              </label>

              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className={inputBase}
              >
                {catalogs.canales.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Responsable
              </label>
              <select
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className={inputBase}
              >
                {catalogs.responsables?.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Tipo de intención
              </label>
              <select
                value={tipoIntencion}
                onChange={(e) =>
                  setTipoIntencion(e.target.value)
                }
                className={inputBase}
              >
                {catalogs.tiposIntencion.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Productos */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Productos</h2>
            <button
              type="button"
              onClick={agregarProducto}
              className="rounded-lg border border-[#5cb89a] bg-white px-3 py-1.5 text-sm font-medium text-[#5cb89a] hover:bg-[#5cb89a]/10"
            >
              + Agregar producto
            </button>
          </div>

          <div className="space-y-4">
            {productosForm.map((p, idx) => (
              <div
                key={p.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Producto #{idx + 1}
                  </p>
                  {productosForm.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarProducto(p.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Quitar fila
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Producto
                    </label>
                    <input
                      value={p.producto}
                      onChange={(e) =>
                        setProductoField(p.id, "producto", e.target.value)
                      }
                      placeholder="Nombre del producto"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={p.cantidad}
                      onChange={(e) =>
                        setProductoField(p.id, "cantidad", e.target.value)
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Unidad
                    </label>
                    <select
                      value={p.unidad}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "unidad",
                          e.target.value as UnidadMedida
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.unidades.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Descripcion
                    </label>
                    <input
                      value={p.descripcion}
                      onChange={(e) =>
                        setProductoField(p.id, "descripcion", e.target.value)
                      }
                      placeholder="Detalle / presentacion"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Peso estimado (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={p.pesoEstimadoKg}
                      onChange={(e) =>
                        setProductoField(p.id, "pesoEstimadoKg", e.target.value)
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Vida util
                    </label>
                    <input
                      type="date"
                      value={p.vidaUtil}
                      onChange={(e) =>
                        setProductoField(p.id, "vidaUtil", e.target.value)
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Tipo de producto
                    </label>
                    <select
                      value={p.tipoProducto}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "tipoProducto",
                          e.target.value as TipoProducto
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.tiposProducto.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Procedencia
                    </label>
                    <select
                      value={p.procedencia}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "procedencia",
                          e.target.value as Procedencia
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.procedencias.map((pr) => (
                        <option key={pr} value={pr}>
                          {pr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview del grid */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Vista previa del panel de productos
            </h3>
            <ProductosGrid
              productos={productosForm
                .filter((p) => p.producto.trim() !== "")
                .map(toProductoIntencion)}
            />
          </div>
        </section>
        {/* Detalle */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Información de Calidad
          </h2>
          <DetalleIntencion
            motivoDonacion={motivoDonacion}
            compromisoIdoneidad={compromisoIdoneidad}
            condicionAlmacenamiento={condicionAlmacenamiento}
            fechaEstimadaEntrega={fechaEstimadaEntrega}
            descripcionGeneralDonacion={descripcionGeneralDonacion}
            incluyeProductosSensibles={incluyeProductosSensibles}
            recomendacionesConsumo={recomendacionesConsumo}
            condicionProducto={condicionProducto}
            declaracionProducto={declaracionProducto}
            documentos={documentos}
            fotos={fotos}
            editable
            onChange={(patch) => {
              if (patch.motivoDonacion !== undefined)
                setMotivoDonacion(patch.motivoDonacion);
              if (patch.compromisoIdoneidad !== undefined)
                setCompromisoIdoneidad(patch.compromisoIdoneidad);
              if (patch.condicionAlmacenamiento !== undefined)
                setCondicionAlmacenamiento(patch.condicionAlmacenamiento);
              if (patch.fechaEstimadaEntrega !== undefined)
                setFechaEstimadaEntrega(patch.fechaEstimadaEntrega);
              if (patch.descripcionGeneralDonacion !== undefined)
                setDescripcionGeneralDonacion(patch.descripcionGeneralDonacion);
              if (patch.incluyeProductosSensibles !== undefined)
                setIncluyeProductosSensibles(patch.incluyeProductosSensibles);
              if (patch.recomendacionesConsumo !== undefined)
                setRecomendacionesConsumo(patch.recomendacionesConsumo);
              if (patch.condicionProducto !== undefined)
                setCondicionProducto(patch.condicionProducto);
              if (patch.declaracionProducto !== undefined)
                setDeclaracionProducto(patch.declaracionProducto);
            }}
            onAddDocumentos={handleAddDocumentos}
            onAddFotos={handleAddFotos}
            onRemoveDocumento={(id) =>
              setDocumentos((prev) => prev.filter((d) => d.id !== id))
            }
            onRemoveFoto={(id) =>
              setFotos((prev) => prev.filter((f) => f.id !== id))
            }
          />
        </section>

        {/* Información Logística */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Información Logística</h2>
          </div>

          <div className="space-y-4">
            {productosForm.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Lugar de Recojo
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Tipo de Lugar
                    </label>
                    <select
                      value={p.tipoLugar}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "tipoLugar",
                          e.target.value as TipoLugar
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.tipoLugar.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Nombre del lugar / Planta
                    </label>
                    <input
                      value={p.lugar}
                      onChange={(e) =>
                        setProductoField(p.id, "lugar", e.target.value)
                      }
                      placeholder="Nombre del Lugar / Planta"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Persona contacto en Planta
                    </label>
                    <input
                      value={p.contactoPlanta}
                      onChange={(e) =>
                        setProductoField(p.id, "contactoPlanta", e.target.value)
                      }
                      placeholder="Persona contacto en Planta"
                      className={inputBase}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Dirección
                    </label>
                    <input
                      value={p.direccion}
                      onChange={(e) =>
                        setProductoField(p.id, "direccion", e.target.value)
                      }
                      placeholder="Dirección"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Referencia
                    </label>
                    <input
                      value={p.referencia}
                      onChange={(e) =>
                        setProductoField(p.id, "referencia", e.target.value)
                      }
                      placeholder="Referencia"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Distrito
                    </label>
                    <select
                      value={p.distrito}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "distrito",
                          e.target.value as Distrito
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.distritos.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Provincia
                    </label>
                    <select
                      value={p.provincia}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "provincia",
                          e.target.value as Provincia
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.provincias.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Departamento
                    </label>
                    <select
                      value={p.departamento}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "departamento",
                          e.target.value as Departamento
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.departamentos.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Código Postal
                    </label>
                    <input
                      value={p.codigoPostal}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "codigoPostal",
                          e.target.value
                        )
                      }
                      placeholder="Código Postal"
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ubicación en mapa */}
          <div className="mt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Ubicación en mapa
            </h3>
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
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    {p.producto
                      ? `Mapa - ${p.producto}`
                      : `Mapa - Producto`}
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Latitud
                      </label>
                      <input
                        value={p.latitud}
                        onChange={(e) =>
                          setProductoField(p.id, "latitud", e.target.value)
                        }
                        placeholder="Ej. -12.046374"
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Longitud
                      </label>
                      <input
                        value={p.longitud}
                        onChange={(e) =>
                          setProductoField(p.id, "longitud", e.target.value)
                        }
                        placeholder="Ej. -77.042793"
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {tieneCoord ? (
                      <>
                        <iframe
                          title={`Mapa de ubicación ${lat},${lng}`}
                          src={mapUrl}
                          className="h-[300px] w-full border-0"
                        />
                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-500">
                          <span>
                            ©{" "}
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#5cb89a] hover:underline"
                            >
                              OpenStreetMap
                            </a>{" "}
                            contributors
                          </span>
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
                        Ingresa latitud y longitud válidas para visualizar el
                        mapa.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        {/* Información Logística  2*/}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">


          <div className="space-y-4">
            {productosForm.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Accesos y requisitos de recojo
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Tipo de acceso
                    </label>
                    <select
                      value={p.tipoAcceso}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "tipoAcceso",
                          e.target.value as TipoAcceso
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.tipoAcceso.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Horario de atención
                    </label>
                    <input
                      type="time"
                      value={p.horarioInicio}
                      onChange={(e) => setProductoField(p.id, "horarioInicio", e.target.value)}
                    />
                    <span className="separador">a</span>
                    <input
                      type="time"
                      value={p.horarioFinal}
                      onChange={(e) => setProductoField(p.id, "horarioFinal", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-gray-600">
                      Días de atención
                    </label>

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
                        const seleccionado = p.diasAtencion.includes(
                          dia as DiasAtencion
                        );

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
                                  ? [
                                    ...p.diasAtencion,
                                    dia as DiasAtencion,
                                  ]
                                  : p.diasAtencion.filter(
                                    (d) => d !== dia
                                  );

                                setProductoField(
                                  p.id,
                                  "diasAtencion",
                                  nuevosDias
                                );
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-[#5cb89a] focus:ring-[#5cb89a]"
                            />

                            <span>{dia}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-600">
                      ¿Requiere autorización previa?
                    </label>

                    <div className="flex items-center gap-6">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name={`autorizacion-${p.id}`}
                          value="Si"
                          checked={p.requiereAutorizacion === "Si"}
                          onChange={(e) =>
                            setProductoField(
                              p.id,
                              "requiereAutorizacion",
                              e.target.value as "Si" | "No"
                            )
                          }
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
                          onChange={(e) =>
                            setProductoField(
                              p.id,
                              "requiereAutorizacion",
                              e.target.value as "Si" | "No"
                            )
                          }
                          className="h-4 w-4 text-[#5cb89a] focus:ring-[#5cb89a]"
                        />
                        No
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Tiempo de anticipación requerida
                    </label>
                    <select
                      value={p.anticipacion}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "anticipacion",
                          e.target.value as Anticipacion
                        )
                      }
                      className={inputBase}
                    >
                      {catalogs.anticipacion.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Contacto de autorización
                    </label>

                    <input
                      type="text"
                      value={p.contactoAutorizacion}
                      onChange={(e) =>
                        setProductoField(p.id, "contactoAutorizacion", e.target.value)
                      }
                      placeholder="Contacto de Autorización"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Numero de contacto
                    </label>
                    <input
                      type="text"
                      value={p.numeroContacto}
                      onChange={(e) =>
                        setProductoField(p.id, "numeroContacto", e.target.value)
                      }
                      placeholder="Número de Contacto"
                      className={inputBase}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <label className="mb-2 block text-xs font-medium text-gray-600">
                      Requisitos para el ingreso a planta
                      <span className="ml-1 font-normal text-gray-400">
                        (Selecciona todos los requeridos)
                      </span>
                    </label>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        "DNI vigente",
                        "Carnet de sanidad",
                        "Autorización del donante",
                        "Uso obligatorio de EPP",
                        "Seguro SCTR",
                        "Inducción de seguridad",
                        "Vehículo con sello de fumigación",
                        "Otros requisitos",
                      ].map((requisito) => {
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
                                  : p.requisitosIngreso.filter(
                                    (r) => r !== requisito
                                  );

                                setProductoField(
                                  p.id,
                                  "requisitosIngreso",
                                  nuevosRequisitos
                                );
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-[#5cb89a] focus:ring-[#5cb89a]"
                            />

                            <span>{requisito}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Observaciones de accesos */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Observaciones de accesos
            </h3>
            {productosForm.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {p.producto
                    ? `Observaciones - ${p.producto}`
                    : "Observaciones"}
                </label>
                <textarea
                  value={p.observacionesAcceso}
                  onChange={(e) =>
                    setProductoField(
                      p.id,
                      "observacionesAcceso",
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Ej. Ingreso por puerta lateral, portón verde. Se requiere llamada previa al guardia."
                  className={inputBase}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Información Logística  3*/}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">


          <div className="space-y-4">
            {productosForm.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Disponibilidad para recojo
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Fecha desde
                    </label>
                    <input
                      type="date"
                      value={p.fechaDesde}
                      onChange={(e) =>
                        setProductoField(p.id, "fechaDesde", e.target.value)
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Fecha hasta
                    </label>
                    <input
                      type="date"
                      value={p.fechaHasta}
                      onChange={(e) =>
                        setProductoField(p.id, "fechaHasta", e.target.value)
                      }
                      className={inputBase}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Horario disponible
                    </label>
                    <input
                      value={p.horarioDisponible}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "horarioDisponible",
                          e.target.value
                        )
                      }
                      placeholder="Ej. 09:00 - 17:00"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Tiempo estimado de carga (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={p.tiempoEstimadoCarga}
                      onChange={(e) =>
                        setProductoField(
                          p.id,
                          "tiempoEstimadoCarga",
                          e.target.value
                        )
                      }
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>



        {/* Acciones */}
        <div className="flex justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-md active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(90deg, #5cb89a 0%, #7dc8ad 50%, #a0d8c0 100%)",
            }}
          >
            <Save className="h-4 w-4" />
            Guardar intencion
          </button>
        </div>
      </form>
    </div>
  );
}
