import { useState, useEffect, type ChangeEvent, type FormEvent, useRef } from "react";
import { Save, Trash2, Loader2, FileText, Package, CheckCircle, Truck, Upload, Download, MapPin, Search } from "lucide-react";
import ProductosGrid from "../components/intencion/ProductosGrid";
import UbigeoSelector from "../components/intencion/UbigeoSelector";
import { getLocalDateISO } from "../utils/date";
import {
  type CompromisoIdoneidadFlags,
  COMPROMISO_IDONEIDAD_INICIAL,
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
import { fetchSuppliers } from "../services/catalogService";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { FormField } from "../components/ui/FormField";
import Tooltip from "../components/ui/Tooltip";

interface SupplierContactOption {
  id: string;
  name: string;
  position: string;
  email: string;
  mobilePhone: string;
}
interface SupplierOption { id: string; name: string; raw?: any; }
const contactsFromSupplier = (supplier: any): SupplierContactOption[] => {
  const source = supplier?.contacts ?? supplier?.supplierContacts ?? supplier?.contactPersons ?? supplier?.contactsList ?? [];
  const rows = Array.isArray(source) ? source : source?.items ?? source?.data ?? [];
  return rows.map((item: any, index: number) => ({
    id: String(item?.contactId ?? item?.id ?? index),
    name: String(item?.fullName ?? item?.contactName ?? item?.name ?? item?.personName ?? "").trim(),
    position: String(item?.position ?? item?.cargo ?? item?.jobTitle ?? item?.title ?? "").trim(),
    email: String(item?.email ?? item?.contactEmail ?? "").trim(),
    mobilePhone: String(item?.mobilePhone ?? item?.mobile ?? item?.cellPhone ?? item?.phoneNumber ?? item?.phone ?? "").trim(),
  })).filter((contact: SupplierContactOption) => contact.name);
};
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

const COMPROMISOS_IDONEIDAD: { key: keyof CompromisoIdoneidadFlags; label: string }[] = [
  { key: "envase_integro", label: "Envase íntegro y sellado (cuando aplique)" },
  { key: "sin_deterioro", label: "Producto sin signos de deterioro, contaminación o descomposición" },
  { key: "conservacion", label: "Conservado según las condiciones establecidas por el fabricante" },
];
interface CalidadForm {
  motivoDonacion: MotivoDonacion | "";
  compromisoIdoneidad: CompromisoIdoneidadFlags;
  condicionAlmacenamiento: CondicionAlmacenamiento | "";
  fechaEstimadaEntrega: string;
  porcentajeMerma: string;
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

// Cambiar a false para volver a mostrar el tab de productos.
const HIDE_PRODUCTS_TAB = true;

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

const normalizeHeader = (value: string) =>
  value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

const isImageFile = (file: File) =>
  file.type.toLowerCase().startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp|tiff?|heic|heif|svg)$/i.test(file.name);

// CSV parser that supports quoted fields, commas/semicolons and escaped quotes.
const parseCsv = (text: string): string[][] => {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
};

export default function NuevaIntencion({ onCancelar, onGuardada }: Props) {
  const catalogs = useCatalogs();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: "producto" | "documento" | "foto" } | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<Record<string, File>>({});

  const firstErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    catalogStore.loadCatalogs();
  }, []);

  const [donante, setDonante] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierResults, setSupplierResults] = useState<SupplierOption[]>([]);
  const [supplierSearchLoading, setSupplierSearchLoading] = useState(false);
  const [showSupplierResults, setShowSupplierResults] = useState(false);

  useEffect(() => {
    const query = supplierQuery.trim();
    if (supplierId && query === donante) {
      setSupplierResults([{ id: supplierId, name: donante }]);
      setSupplierSearchLoading(false);
      return;
    }
    const localResults = query
      ? catalogs.proveedores.filter((supplier) => `${supplier.name} ${supplier.id}`.toLowerCase().includes(query.toLowerCase()))
      : catalogs.proveedores;
    setSupplierResults(localResults);
    setSupplierSearchLoading(false);
    if (query.length < 2) return;

    let active = true;
    const timer = window.setTimeout(() => {
      setSupplierSearchLoading(true);
      fetchSuppliers(query)
        .then((items) => {
          if (!active) return;
          const remoteResults: SupplierOption[] = items.map((item: any) => {
            const id = item?.supplierId ?? item?.supplierID ?? item?.idSupplier ?? item?.id ?? item?.code;
            const name = item?.supplierName ?? item?.supplier_name ?? item?.businessName ?? item?.companyName ?? item?.razonSocial ?? item?.tradeName ?? item?.name ?? item?.description;
            return { id: String(id ?? ""), name: String(name ?? ""), raw: item };
          }).filter((supplier: { id: string; name: string }) => supplier.id && supplier.name);
          const matchingRemoteResults = remoteResults.filter((supplier: { id: string; name: string }) => `${supplier.name} ${supplier.id}`.toLowerCase().includes(query.toLowerCase()));
          setSupplierResults(matchingRemoteResults.length > 0 ? matchingRemoteResults : localResults);
        })
        .catch(() => {
          if (active) setSupplierResults(localResults);
        })
        .finally(() => {
          if (active) setSupplierSearchLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [supplierQuery, supplierId, donante, catalogs.proveedores]);

  useEffect(() => {
    const closeSupplierResults = (event: MouseEvent) => {
      if (!firstErrorRef.current?.contains(event.target as Node)) setShowSupplierResults(false);
    };
    document.addEventListener("mousedown", closeSupplierResults);
    return () => document.removeEventListener("mousedown", closeSupplierResults);
  }, []);

  const [contacto, setContacto] = useState("");
  const [contactoCargo, setContactoCargo] = useState("");
  const [contactoCorreo, setContactoCorreo] = useState("");
  const [contactoMovil, setContactoMovil] = useState("");
  const [supplierContacts, setSupplierContacts] = useState<SupplierContactOption[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const selectedSupplierContact = supplierContacts.find((item) => item.id === selectedContactId);
  const selectSupplier = async (supplier: SupplierOption) => {
    setSupplierId(supplier.id);
    setDonante(supplier.name);
    setSupplierQuery("");
    setShowSupplierResults(false);
    setValidationErrors((current) => ({ ...current, donante: "", contacto: "" }));
    setSelectedContactId("");
    setContacto("");
    setContactoCargo("");
    setContactoCorreo("");
    setContactoMovil("");
    let contacts = contactsFromSupplier(supplier.raw);
    if (contacts.length === 0) {
      setContactsLoading(true);
      try {
        const matches = await fetchSuppliers(supplier.name);
        const detail = matches.find((item: any) => String(item?.supplierId ?? item?.supplierID ?? item?.idSupplier ?? item?.id ?? item?.code ?? "") === supplier.id)
          ?? matches.find((item: any) => String(item?.supplierName ?? item?.supplier_name ?? item?.businessName ?? item?.companyName ?? item?.razonSocial ?? item?.tradeName ?? item?.name ?? item?.description ?? "").trim().toLowerCase() === supplier.name.trim().toLowerCase());
        contacts = contactsFromSupplier(detail);
      } catch (error) {
        console.warn("No se pudieron cargar los contactos del donante", error);
      } finally {
        setContactsLoading(false);
      }
    }
    setSupplierContacts(contacts);
  };
  const [fechaIntencion, setFechaIntencion] = useState(
    getLocalDateISO()
  );
  const [modalidadIntencion, setModalidadIntencion] = useState<"Normal" | "Campaña">("Normal");
  const [fechaInicioCampania, setFechaInicioCampania] = useState("");
  const [fechaFinCampania, setFechaFinCampania] = useState("");
  const [canal, setCanal] = useState<string>("");
  useEffect(() => {
    if (!canal && catalogs.canales.length > 0) {
      setCanal(catalogs.canales[0].id);
    }
  }, [canal, catalogs.canales]);
  const [responsable, setResponsable] = useState("");
  const [tipoIntencion, setTipoIntencion] = useState<string>("Donacion");
  const [CantidadPorKilos, setCantidadPorKilos] = useState("");

  const [productosForm, setProductosForm] = useState<ProductoForm[]>([
    emptyProducto(),
  ]);

  const [calidadForm, setCalidadForm] = useState<CalidadForm>({
    motivoDonacion: "",
    compromisoIdoneidad: { ...COMPROMISO_IDONEIDAD_INICIAL },
    condicionAlmacenamiento: "",
    fechaEstimadaEntrega: getLocalDateISO(),
    porcentajeMerma: "",
    descripcionGeneralDonacion: "",
    incluyeProductosSensibles: "No",
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

    fechaDesde: getLocalDateISO(),
    fechaHasta: getLocalDateISO(),
    horarioDisponible: "",
    tiempoEstimadoCarga: "",

    latitud: "",
    longitud: "",
    observacionesAcceso: "",
  });

  useEffect(() => {
    const normalize = (value: string) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
    const resolveId = (items: Array<{ id: string; name: string }>, value: string) =>
      items.find((item) => item.id === value || normalize(item.name) === normalize(value))?.id
      || items[0]?.id
      || "";

    if (catalogs.tipoLugar.length > 0) {
      const id = resolveId(catalogs.tipoLugar, logisticaForm.tipoLugar);
      if (id && id !== logisticaForm.tipoLugar) {
        setLogisticaForm((prev) => ({ ...prev, tipoLugar: id as TipoLugar }));
      }
    }
    if (catalogs.tipoAcceso.length > 0) {
      const id = resolveId(catalogs.tipoAcceso, logisticaForm.tipoAcceso);
      if (id && id !== logisticaForm.tipoAcceso) {
        setLogisticaForm((prev) => ({ ...prev, tipoAcceso: id as TipoAcceso }));
      }
    }
    if (catalogs.anticipacion.length > 0) {
      const id = resolveId(catalogs.anticipacion, logisticaForm.anticipacion);
      if (id && id !== logisticaForm.anticipacion) {
        setLogisticaForm((prev) => ({ ...prev, anticipacion: id as Anticipacion }));
      }
    }
  }, [catalogs.tipoLugar, catalogs.tipoAcceso, catalogs.anticipacion, logisticaForm.tipoLugar, logisticaForm.tipoAcceso, logisticaForm.anticipacion]);

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

  const handleImportarProductos = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      showToast("Adjunta un archivo CSV. Puedes guardar una hoja de Excel como CSV.", "error");
      return;
    }

    try {
      const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
      if (rows.length < 2) throw new Error("El archivo no contiene filas de productos.");

      const headers = rows[0].map(normalizeHeader);
      const findColumn = (...names: string[]) => headers.findIndex((header) => names.includes(header));
      const columns = {
        producto: findColumn("producto", "nombre", "nombreproducto", "product", "productname"),
        descripcion: findColumn("descripcion", "detalle", "description"),
        cantidad: findColumn("cantidad", "cantidadofrecida", "offeredquantity", "quantity"),
        unidad: findColumn("unidad", "unidadmedida", "unit", "unitcode"),
        peso: findColumn("pesoestimadokg", "pesoestimado", "peso", "estimatedweight"),
        vidaUtil: findColumn("vidautil", "fechadevencimiento", "fechacaducidad", "expirationdate"),
        tipo: findColumn("tipoproducto", "tipo", "producttype", "producttypecode"),
        procedencia: findColumn("procedencia", "origen", "origin", "origincode"),
      };

      if (columns.producto < 0) {
        throw new Error("Falta la columna obligatoria 'Producto' o 'Nombre'.");
      }

      const imported = rows.slice(1).flatMap((cells) => {
        const get = (index: number) => index >= 0 ? (cells[index] ?? "").trim() : "";
        const producto = get(columns.producto);
        if (!producto) return [];
        const number = (raw: string, fallback: number) => {
          const parsed = Number(raw.replace(",", "."));
          return Number.isFinite(parsed) ? parsed : fallback;
        };

        return [{
          id: crypto.randomUUID(),
          producto,
          descripcion: get(columns.descripcion),
          cantidad: String(number(get(columns.cantidad), 1)),
          unidad: (get(columns.unidad) || "unidad") as UnidadMedida,
          pesoEstimadoKg: String(number(get(columns.peso), 0)),
          vidaUtil: get(columns.vidaUtil),
          tipoProducto: (get(columns.tipo) || "No perecible") as TipoProducto,
          procedencia: (get(columns.procedencia) || "Nacional") as Procedencia,
        }];
      });

      if (imported.length === 0) throw new Error("No se encontraron productos con nombre en el archivo.");
      setProductosForm((prev) => [...prev.filter((item) => item.producto.trim()), ...imported]);
      showToast(`Se cargaron ${imported.length} productos desde el archivo.`, "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo leer el archivo.", "error");
    }
  };

  const descargarPlantillaProductos = () => {
    const contenido = "Producto,Descripcion,Cantidad,Unidad,Peso estimado kg,Vida util,Tipo de producto,Procedencia\nArroz,Arroz blanco bolsa 1 kg,10,unidad,10,2026-12-31,No perecible,Nacional\n";
    const url = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla-productos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

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
      setAttachmentFiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

    }

    if (type === "foto") {
      setCalidadForm((prev) => ({
        ...prev,
        fotos: prev.fotos.filter((f) => f.id !== id),
      }));
      setAttachmentFiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

    }

    setConfirmDelete(null);
  };

  const handleAddDocumentos = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const imageFiles = files.filter(isImageFile);
    const documentFiles = files.filter((file) => !isImageFile(file));
    const fileMap: Record<string, File> = {};
    const nuevos: DocumentoAdjunto[] = documentFiles.map((file) => {
      const id = crypto.randomUUID();
      fileMap[id] = file;
      return {
        id,
        nombre: file.name,
        tipo: file.type,
        tamanoKb: Math.round(file.size / 1024),
        url: URL.createObjectURL(file),
      };
    });
    const nuevasFotos: FotoAdjunta[] = imageFiles.map((file) => {
      const id = crypto.randomUUID();
      fileMap[id] = file;
      return { id, nombre: file.name, url: URL.createObjectURL(file) };
    });

    setAttachmentFiles((prev) => ({ ...prev, ...fileMap }));
    setCalidadForm((prev) => ({
      ...prev,
      documentos: [...prev.documentos, ...nuevos],
      fotos: [...prev.fotos, ...nuevasFotos],
    }));
    if (imageFiles.length > 0) {
      showToast("Las imágenes se agregaron como fotos y se enviarán en Photos.", "success");
    }
    event.target.value = "";
  };

  const handleAddFotos = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const fileMap: Record<string, File> = {};
    const nuevas: FotoAdjunta[] = files.map((file) => {
      const id = crypto.randomUUID();
      fileMap[id] = file;
      return { id, nombre: file.name, url: URL.createObjectURL(file) };
    });

    setAttachmentFiles((prev) => ({ ...prev, ...fileMap }));
    setCalidadForm((prev) => ({ ...prev, fotos: [...prev.fotos, ...nuevas] }));
    event.target.value = "";
  };
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!supplierId) errors.donante = "Selecciona un donante del catálogo";
    if (!contacto.trim()) errors.contacto = "El contacto es obligatorio";
    if (!responsable.trim()) errors.responsable = "El responsable es obligatorio";
    if (!canal) errors.canal = "Selecciona un canal";
    if (modalidadIntencion === "Campaña") {
      if (!fechaInicioCampania) errors.fechaInicioCampania = "La fecha de inicio de campaña es obligatoria";
      if (!fechaFinCampania) errors.fechaFinCampania = "La fecha de fin de campaña es obligatoria";
      if (fechaInicioCampania && fechaFinCampania && fechaFinCampania < fechaInicioCampania) {
        errors.fechaFinCampania = "La fecha de fin debe ser igual o posterior al inicio";
      }
    }
    if (!catalogs.tipoLugar.some((item) => item.id === logisticaForm.tipoLugar)) {
      errors.tipoLugar = "Selecciona un tipo de lugar del catálogo";
    }
    if (!catalogs.tipoAcceso.some((item) => item.id === logisticaForm.tipoAcceso)) {
      errors.tipoAcceso = "Selecciona un tipo de acceso del catálogo";
    }
    if (!catalogs.anticipacion.some((item) => item.id === logisticaForm.anticipacion)) {
      errors.anticipacion = "Selecciona un tiempo de anticipación del catálogo";
    }

    if (!HIDE_PRODUCTS_TAB) {
      productosForm.forEach((p, idx) => {
        if (!p.producto.trim()) errors[`prod_${idx}_nombre`] = "El nombre del producto es obligatorio";
        if (Number(p.cantidad) <= 0) errors[`prod_${idx}_cant`] = "La cantidad debe ser mayor a 0";
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Guardar solo desde el último tab del formulario.
    if (activeTab !== "logistica") return;

    if (!validateForm()) {
      firstErrorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isImageDocument = (documento: DocumentoAdjunto) => {
        const file = attachmentFiles[documento.id];
        return file
          ? isImageFile(file)
          : documento.tipo.toLowerCase().startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp|tiff?|heic|heif|svg)$/i.test(documento.nombre);
      };
      const imageDocuments = calidadForm.documentos.filter(isImageDocument);
      const documentFiles = calidadForm.documentos
        .filter((documento) => !isImageDocument(documento))
        .map((documento) => attachmentFiles[documento.id])
        .filter((file): file is File => Boolean(file));
      const imageFiles = imageDocuments
        .map((documento) => attachmentFiles[documento.id])
        .filter((file): file is File => Boolean(file));
      const photosToSave: FotoAdjunta[] = [
        ...calidadForm.fotos,
        ...imageDocuments.map(({ id, nombre, url }) => ({ id, nombre, url })),
      ];
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
        contactoCargo: contactoCargo.trim() || undefined,
        contactoCorreo: contactoCorreo.trim() || undefined,
        contactoMovil: contactoMovil.trim() || undefined,
        fechaIntencion,
        modalidadIntencion,
        fechaInicioCampania: modalidadIntencion === "Campaña" ? fechaInicioCampania : undefined,
        fechaFinCampania: modalidadIntencion === "Campaña" ? fechaFinCampania : undefined,
        canal,
        responsable: responsable.trim(),
        tipoIntencion,

        estado: "",

        // MUCHOS PRODUCTOS
        productos: productosValidos,

        // CALIDAD - UNA SOLA
        motivoDonacion:
          calidadForm.motivoDonacion || undefined,

        compromisoIdoneidad: { ...calidadForm.compromisoIdoneidad },

        condicionAlmacenamiento:
          calidadForm.condicionAlmacenamiento || undefined,

        fechaEstimadaEntrega:
          calidadForm.fechaEstimadaEntrega || undefined,
        porcentajeMerma: isAgroChannel && calidadForm.porcentajeMerma !== "" ? Number(calidadForm.porcentajeMerma) : undefined,

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

        documentos: calidadForm.documentos.filter((documento) => !isImageDocument(documento)),

        fotos: photosToSave,

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

      const guardada = await saveIntencion({ ...nueva, supplierId }, {
        documents: documentFiles,
        photos: [
          ...calidadForm.fotos
            .map((foto) => attachmentFiles[foto.id])
            .filter((file): file is File => Boolean(file)),
          ...imageFiles,
        ],
      });
      intencionStore.add(guardada);

      showToast(
        "¡Intención enviada y guardada exitosamente!",
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
    { id: "general", label: "Datos Generales y Calidad", icon: FileText },
    ...(!HIDE_PRODUCTS_TAB ? [{ id: "productos", label: "Productos", icon: Package }] : []),
    { id: "logistica", label: "Logística", icon: Truck },
  ];

  const activeTabIndex = tabs.findIndex((t) => t.id === activeTab) + 1;
  const selectedChannel = catalogs.canales.find((item) => String(item.id) === String(canal));
  const isAgroChannel = [canal, selectedChannel?.name ?? ""].some((value) => normalizeHeader(value).includes("agro"));
  const latitude = Number(logisticaForm.latitud);
  const longitude = Number(logisticaForm.longitud);
  const hasValidCoordinates =
    logisticaForm.latitud.trim() !== "" &&
    logisticaForm.longitud.trim() !== "" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180;
  const mapEmbedUrl = hasValidCoordinates
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : null;
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
              <div ref={firstErrorRef} className="relative">
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Donante <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  role="combobox"
                  aria-required="true"
                  aria-expanded={showSupplierResults}
                  aria-controls="resultados-donantes"
                  onClick={() => { const open = !showSupplierResults; setShowSupplierResults(open); if (open) { setSupplierQuery(""); setSupplierResults(catalogs.proveedores); } }}
                  onKeyDown={(event) => { if (event.key === "Escape") setShowSupplierResults(false); }}
                  className={`flex w-full items-center justify-between rounded-lg border ${validationErrors.donante ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2 text-left text-sm focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20`}
                >
                  <span className={donante ? "text-gray-800" : "text-gray-400"}>{donante || "Seleccionar donante"}</span>
                  <Search className="h-4 w-4 shrink-0 text-gray-400" />
                </button>
                {validationErrors.donante && <p className="mt-1 text-[11px] font-medium text-red-500">{validationErrors.donante}</p>}
                {showSupplierResults && <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                    <Search className="h-4 w-4 shrink-0 text-gray-400" />
                    <input
                      id="buscar-donante"
                      autoComplete="off"
                      autoFocus
                      value={supplierQuery}
                      onChange={(event) => { setSupplierQuery(event.target.value); setSupplierId(""); setDonante(""); setSupplierContacts([]); setSelectedContactId(""); setContacto(""); setContactoCargo(""); setContactoCorreo(""); setContactoMovil(""); }}
                      onKeyDown={(event) => { if (event.key === "Escape") setShowSupplierResults(false); }}
                      placeholder="Buscar donante por nombre o RUC..."
                      className="min-w-0 flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                      aria-controls="resultados-donantes"
                      role="searchbox"
                    />
                    {supplierSearchLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  </div>
                  <div id="resultados-donantes" role="listbox" className="max-h-56 overflow-y-auto py-1">
                    {supplierResults.length > 0 ? supplierResults.map((supplier) => <button key={supplier.id} type="button" role="option" aria-selected={supplier.id === supplierId} onClick={() => { void selectSupplier(supplier); }} className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-[#5cb89a]/10 hover:text-[#32876d]">{supplier.name}</button>) : <p className="px-3 py-3 text-sm text-gray-500">{supplierSearchLoading ? "Buscando donantes..." : "No se encontraron donantes. Prueba con otro nombre o RUC."}</p>}
                    {supplierSearchLoading && supplierResults.length > 0 && <p className="px-3 py-2 text-xs text-gray-400">Buscando en el catálogo completo...</p>}
                  </div>
                </div>}
              </div>
              <div>
                <label htmlFor="contacto-donante" className="mb-1.5 block text-xs font-medium text-gray-600">Contacto <span className="text-red-500">*</span></label>
                <select id="contacto-donante" required disabled={!supplierId || contactsLoading || supplierContacts.length === 0} value={selectedContactId} onChange={(event) => { const selected = supplierContacts.find((item) => item.id === event.target.value); setSelectedContactId(event.target.value); setContacto(selected?.name ?? ""); setContactoCargo(selected?.position ?? ""); setContactoCorreo(selected?.email ?? ""); setContactoMovil(selected?.mobilePhone ?? ""); setValidationErrors((current) => ({ ...current, contacto: "" })); }} className={`w-full rounded-lg border ${validationErrors.contacto ? "border-red-500" : "border-gray-300"} bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}>
                  <option value="">{!supplierId ? "Primero selecciona un donante" : contactsLoading ? "Cargando contactos..." : supplierContacts.length === 0 ? "No hay contactos registrados" : "Seleccionar contacto"}</option>
                  {supplierContacts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                {validationErrors.contacto && <p className="mt-1 text-[11px] font-medium text-red-500">{validationErrors.contacto}</p>}
                {supplierId && !contactsLoading && (selectedSupplierContact || supplierContacts.length === 0) && (
                  <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-[#dcebe1] bg-[#f8fcf9] p-3 sm:grid-cols-2">
                    <Input label="Nombre del contacto" required value={contacto} onChange={(event) => setContacto(event.target.value)} placeholder="Nombre y apellidos" />
                    <Input label="Cargo" required value={contactoCargo} onChange={(event) => setContactoCargo(event.target.value)} placeholder="Cargo del contacto" />
                    <Input label="Correo electrónico" type="email" value={contactoCorreo} onChange={(event) => setContactoCorreo(event.target.value)} placeholder="nombre@empresa.com" />
                    <Input label="Número móvil" type="tel" required value={contactoMovil} onChange={(event) => setContactoMovil(event.target.value)} placeholder="+51 999 999 999" />
                  </div>
                )}
              </div>
              <Input
                label="Fecha de intención"
                type="date"
                value={fechaIntencion}
                onChange={(e) => setFechaIntencion(e.target.value)}
              />
              <Select
                label="Modalidad de la intención"
                value={modalidadIntencion}
                onChange={(e) => {
                  const modalidad = e.target.value as "Normal" | "Campaña";
                  setModalidadIntencion(modalidad);
                  if (modalidad === "Normal") {
                    setFechaInicioCampania("");
                    setFechaFinCampania("");
                    setValidationErrors((current) => ({ ...current, fechaInicioCampania: "", fechaFinCampania: "" }));
                  }
                }}
              >
                <option value="Normal">Normal</option>
                <option value="Campaña">Por campaña</option>
              </Select>
              {modalidadIntencion === "Campaña" && <>
                <Input
                  label="Fecha de inicio de campaña"
                  type="date"
                  required
                  value={fechaInicioCampania}
                  onChange={(e) => setFechaInicioCampania(e.target.value)}
                  error={validationErrors.fechaInicioCampania}
                />
                <Input
                  label="Fecha fin de campaña"
                  type="date"
                  required
                  min={fechaInicioCampania || undefined}
                  value={fechaFinCampania}
                  onChange={(e) => setFechaFinCampania(e.target.value)}
                  error={validationErrors.fechaFinCampania}
                />
              </>}
              <Select
                label="Canal"
                required
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                error={validationErrors.canal}
              >
                <option value="">Seleccionar canal</option>
                {catalogs.canales.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
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
              <Input
                label="Cantidad Por Kilos"
                required
                value={CantidadPorKilos}
                onChange={(e) => setCantidadPorKilos(e.target.value)}
                placeholder="Cantidad Por Kilos"
                error={validationErrors.CantidadPorKilos}
              />
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
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={descargarPlantillaProductos}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Descargar plantilla CSV
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#5cb89a] bg-white px-4 py-2 text-sm font-medium text-[#32876d] hover:bg-[#5cb89a]/10">
                  <Upload className="h-4 w-4" />
                  Cargar listado CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(event) => {
                      void handleImportarProductos(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
                <Button
                  variant="primary"
                  onClick={agregarProducto}
                  leftIcon={<span className="text-lg">+</span>}
                >
                  Agregar producto
                </Button>
              </div>
            </div>
            <p className="mb-5 text-sm text-gray-500">
              Carga un CSV con las columnas Producto, Descripcion, Cantidad, Unidad, Peso estimado kg, Vida util, Tipo de producto y Procedencia. Los productos importados se agregan al listado.
            </p>

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

        {activeTab === "general" && (
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
              {isAgroChannel && (
                <Input
                  label="Porcentaje de merma (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={calidadForm.porcentajeMerma}
                  onChange={(event) => setCalidadField("porcentajeMerma", event.target.value)}
                  placeholder="Ej. 2.5"
                />
              )}
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
                  value={calidadForm.incluyeProductosSensibles || "No"}
                  onChange={(e) =>
                    setCalidadField("incluyeProductosSensibles", e.target.value as ProductoSensible)
                  }
                >
                  <option value="No">No</option>
                  <option value="Si">Sí</option>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Compromiso de idoneidad del Donante
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {COMPROMISOS_IDONEIDAD.map((compromiso) => (
                    <label key={compromiso.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={calidadForm.compromisoIdoneidad[compromiso.key]}
                        onChange={(event) =>
                          setCalidadField("compromisoIdoneidad", {
                            ...calidadForm.compromisoIdoneidad,
                            [compromiso.key]: event.target.checked,
                          })
                        }
                        className="mt-1 h-4 w-4 shrink-0"
                      />
                      <span className="text-sm text-gray-700 leading-6">{compromiso.label}</span>
                    </label>
                  ))}
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
                  {calidadForm.documentos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {calidadForm.documentos.map((documento) => (
                        <div
                          key={documento.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <span className="text-sm text-gray-700">{documento.nombre}</span>
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
                  {calidadForm.fotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {calidadForm.fotos.map((foto) => (
                        <div
                          key={foto.id}
                          className="relative rounded-lg border border-gray-200 bg-white p-2"
                        >
                          <img src={foto.url} alt={foto.nombre} className="h-32 w-full rounded object-cover" />
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
            {isAgroChannel && (
              <section className="rounded-2xl border border-[#cfe4d6] bg-[#f8fcf9] p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Package className="h-5 w-5 text-[#5cb89a]" />
                  Información de entrega y vida útil · AGRO
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Fecha estimada de entrega"
                    type="date"
                    value={calidadForm.fechaEstimadaEntrega}
                    onChange={(event) => setCalidadField("fechaEstimadaEntrega", event.target.value)}
                  />
                  {productosForm.map((producto, index) => (
                    <Input
                      key={producto.id}
                      label={`Vida útil · ${producto.producto.trim() || `Producto ${index + 1}`}`}
                      type="date"
                      value={producto.vidaUtil}
                      onChange={(event) => setProductoField(producto.id, "vidaUtil", event.target.value)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#5cb89a]" />
                Lugar de Recojo
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Select
                  label="Tipo de Lugar"
                  value={logisticaForm.tipoLugar}
                  onChange={(e) => {
                    setLogisticaField("tipoLugar", e.target.value as TipoLugar);
                    setValidationErrors((prev) => ({ ...prev, tipoLugar: "" }));
                  }}
                  error={validationErrors.tipoLugar}
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
                <div className="lg:col-span-4">
                  <UbigeoSelector
                    initialValues={{
                      departamento: logisticaForm.departamento,
                      provincia: logisticaForm.provincia,
                      distrito: logisticaForm.distrito,
                      codigoPostal: logisticaForm.codigoPostal
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
              {mapEmbedUrl ? (
                <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                  <iframe
                    title="Mapa de ubicación del lugar de recojo"
                    src={mapEmbedUrl}
                    className="h-72 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <div className="mt-5 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-sm text-gray-500">
                  Ingresa una latitud y longitud válidas para mostrar el mapa.
                </div>
              )}
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
                  onChange={(event) => {
                    setLogisticaField("tipoAcceso", event.target.value as TipoAcceso);
                    setValidationErrors((prev) => ({ ...prev, tipoAcceso: "" }));
                  }}
                  error={validationErrors.tipoAcceso}
                >
                  {catalogs.tipoAcceso.map((item: any) => (
                    <option key={item.id || item} value={item.id || item}>{item.name || item}</option>
                  ))}
                </Select>

                <FormField label="Horario de atención">
                  <div className="flex items-center gap-2">
                    <input type="time" value={logisticaForm.horarioInicio} onChange={(event) => setLogisticaField("horarioInicio", event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                    <span>a</span>
                    <input type="time" value={logisticaForm.horarioFinal} onChange={(event) => setLogisticaField("horarioFinal", event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  </div>
                </FormField>

                <FormField label="Días de atención" className="md:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as DiasAtencion[]).map((dia) => {
                      const seleccionado = logisticaForm.diasAtencion.includes(dia);
                      return (
                        <label key={dia} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${seleccionado ? "border-[#5cb89a] bg-[#5cb89a]/10" : "border-gray-300 bg-white"}`}>
                          <input type="checkbox" checked={seleccionado} onChange={(event) => setLogisticaField("diasAtencion", event.target.checked ? [...logisticaForm.diasAtencion, dia] : logisticaForm.diasAtencion.filter((item) => item !== dia))} />
                          {dia}
                        </label>
                      );
                    })}
                  </div>
                </FormField>

                <FormField label="¿Requiere autorización previa?">
                  <div className="flex gap-6">
                    <label><input type="radio" checked={logisticaForm.requiereAutorizacion === "Si"} onChange={() => setLogisticaField("requiereAutorizacion", "Si")} /><span className="ml-2">Sí</span></label>
                    <label><input type="radio" checked={logisticaForm.requiereAutorizacion === "No"} onChange={() => setLogisticaField("requiereAutorizacion", "No")} /><span className="ml-2">No</span></label>
                  </div>
                </FormField>

                <Select
                  label="Tiempo de anticipación requerida"
                  value={logisticaForm.anticipacion}
                  onChange={(event) => {
                    setLogisticaField("anticipacion", event.target.value as Anticipacion);
                    setValidationErrors((prev) => ({ ...prev, anticipacion: "" }));
                  }}
                  error={validationErrors.anticipacion}
                >
                  {catalogs.anticipacion.map((item: any) => (
                    <option key={item.id || item} value={item.id || item}>{item.name || item}</option>
                  ))}
                </Select>
                <Input label="Contacto de autorización" value={logisticaForm.contactoAutorizacion} onChange={(event) => setLogisticaField("contactoAutorizacion", event.target.value)} />
                <Input label="Número de contacto" value={logisticaForm.numeroContacto} onChange={(event) => setLogisticaField("numeroContacto", event.target.value)} />
              </div>

              <div className="mt-7 border-t border-gray-200 pt-6">
                <div className="mb-5">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <MapPin className="h-5 w-5 text-[#5cb89a]" />
                    Requisitos para ingreso a planta
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Selecciona los requisitos aplicables. Tus elecciones aparecerán en el panel lateral.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(250px,0.85fr)]">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-600">Lista de requisitos</p>
                      <p className="mt-0.5 text-xs text-gray-500">Marca uno o varios requisitos</p>
                    </div>
                    <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
                      {catalogs.requisitosIngreso.map((requisito) => {
                        const seleccionado = logisticaForm.requisitosIngreso.includes(requisito.id);
                        return (
                          <label key={requisito.id} className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors ${seleccionado ? "bg-[#f1f8f3] text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}>
                            <input type="checkbox" checked={seleccionado} onChange={(event) => setLogisticaField("requisitosIngreso", event.target.checked ? [...logisticaForm.requisitosIngreso, requisito.id] : logisticaForm.requisitosIngreso.filter((id) => id !== requisito.id))} className="h-4 w-4 rounded border-gray-300 text-[#5cb89a] focus:ring-[#5cb89a]" />
                            <span className="flex-1">{requisito.name}</span>
                            {seleccionado && <span className="text-xs font-semibold text-[#32876d]">Agregado</span>}
                          </label>
                        );
                      })}
                      {catalogs.requisitosIngreso.length === 0 && <p className="px-4 py-8 text-center text-sm text-gray-500">No hay requisitos disponibles en el catálogo.</p>}
                    </div>
                  </div>

                  <aside className="rounded-xl border border-[#cfe4d6] bg-[#f8fcf9] p-4" aria-live="polite">
                    <div className="flex items-center justify-between gap-2 border-b border-[#e0eee4] pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Seleccionados</h4>
                        <p className="mt-0.5 text-xs text-gray-500">Requisitos que se incluirán</p>
                      </div>
                      <span className="rounded-full bg-[#e4f2e9] px-2.5 py-1 text-xs font-bold text-[#315747]">{logisticaForm.requisitosIngreso.length}</span>
                    </div>
                    {logisticaForm.requisitosIngreso.length === 0 ? (
                      <p className="py-8 text-center text-sm text-gray-500">Aún no seleccionas requisitos.</p>
                    ) : (
                      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                        {logisticaForm.requisitosIngreso.map((id) => {
                          const requisito = catalogs.requisitosIngreso.find((item) => item.id === id);
                          return (
                            <li key={id} className="flex items-center justify-between gap-2 rounded-lg border border-[#e0eee4] bg-white px-3 py-2 text-sm text-gray-700">
                              <span>{requisito?.name || id}</span>
                              <button type="button" onClick={() => setLogisticaField("requisitosIngreso", logisticaForm.requisitosIngreso.filter((item) => item !== id))} className="rounded px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-700" aria-label={`Quitar ${requisito?.name || "requisito"}`}>Quitar</button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </aside>
                </div>
                {catalogs.requisitosIngreso.some((requisito) => normalizeHeader(requisito.name).includes("otro") && logisticaForm.requisitosIngreso.includes(requisito.id)) && (
                  <div className="mt-4 max-w-xl">
                    <Input label="Detalle de otros requisitos" value={logisticaForm.observacionesAcceso} onChange={(event) => setLogisticaField("observacionesAcceso", event.target.value)} placeholder="Especifica los requisitos adicionales" />
                  </div>
                )}
              </div>
            </section>
            
          </div>
        )}

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          {activeTab === "logistica" && (
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Guardar intención
            </Button>
          )}
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












