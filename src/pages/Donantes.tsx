import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, CircleHelp, CloudUpload, FileText, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { createSupplier, fetchCatalogs, fetchSuppliers } from "../services/catalogService";
import UbigeoSelector from "../components/intencion/UbigeoSelector";

interface Props {
  mode?: "list" | "create";
  onAgregar?: () => void;
  onVolverListado?: () => void;
}

interface Donante {
  id: string;
  nombre: string;
  nombreComercial: string;
  ruc: string;
}

interface ContactoDonante {
  tipo: "Principal" | "Secundario";
  nombres: string;
  cargo: string;
  correo: string;
  movil: string;
  telefonoFijo: string;
  whatsapp: string;
  funciones: string;
}

interface ArticuloDonante {
  articulo: string;
  categoria: string;
  unidad: string;
  presentacion: string;
  estado: "Activo" | "Inactivo";
}

interface DocumentoDonante {
  id: string;
  nombre: string;
  descripcion: string;
  archivo: File | null;
}

const documentosRequeridos: DocumentoDonante[] = [
  { id: "ficha-ruc", nombre: "Ficha RUC", descripcion: "Copia simple del RUC vigente", archivo: null },
  { id: "contrato-convenio", nombre: "Contrato o convenio", descripcion: "Copia del contrato o convenio vigente con la organización", archivo: null },
  { id: "otros-documentos", nombre: "Otros documentos", descripcion: "Documentos adicionales relevantes (opcionales)", archivo: null },
  { id: "documentos-adicionales", nombre: "Documentos adicionales", descripcion: "Cualquier otro documento que respalde la información (opcional)", archivo: null },
];

interface OpcionCatalogo { id: string; nombre: string }
interface DireccionDonante {
  tipoDireccion: string; nombre: string; descripcion: string;
  departamento: string; provincia: string; distrito: string; direccion: string; referencia: string; codigoPostal: string;
  latitud: string; longitud: string; tipoAcceso: string; atencionDesde: string; atencionHasta: string; diasAtencion: string[];
  requiereAutorizacion: boolean; anticipacion: string; requisitos: string[]; recojoDesde: string; recojoHasta: string; tiempoCarga: string;
  contactoSede: string; contactoAutorizacion: string; telefonoAutorizacion: string; observacionesAcceso: string;
}

const direccionVacia = (): DireccionDonante => ({ tipoDireccion: "", nombre: "", descripcion: "", departamento: "", provincia: "", distrito: "", direccion: "", referencia: "", codigoPostal: "", latitud: "", longitud: "", tipoAcceso: "", atencionDesde: "", atencionHasta: "", diasAtencion: [], requiereAutorizacion: false, anticipacion: "", requisitos: [], recojoDesde: "", recojoHasta: "", tiempoCarga: "", contactoSede: "", contactoAutorizacion: "", telefonoAutorizacion: "", observacionesAcceso: "" });

const catalogOptions = (items: any[]): OpcionCatalogo[] => (Array.isArray(items) ? items : []).map((item) => ({
  id: String(item?.id ?? item?.typeAddressId ?? item?.accessTypeId ?? item?.leadTimeId ?? item?.requirementId ?? item?.code ?? item?.value ?? ""),
  nombre: String(item?.name ?? item?.typeAddressName ?? item?.accessTypeName ?? item?.leadTimeName ?? item?.requirementName ?? item?.description ?? item?.label ?? item?.value ?? ""),
})).filter((item) => item.id && item.nombre);

const contactoVacio = (tipo: ContactoDonante["tipo"] = "Principal"): ContactoDonante => ({
  tipo,
  nombres: "",
  cargo: "",
  correo: "",
  movil: "",
  telefonoFijo: "",
  whatsapp: "",
  funciones: "",
});

const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20";
const labelClass = "mb-1 block text-xs font-medium text-gray-600";

const normalizeDonante = (item: any): Donante => ({
  id: String(item?.supplierId ?? item?.supplierID ?? item?.idSupplier ?? item?.id ?? item?.code ?? ""),
  nombre: String(item?.supplierName ?? item?.supplier_name ?? item?.businessName ?? item?.companyName ?? item?.razonSocial ?? item?.tradeName ?? item?.name ?? item?.description ?? "Donante sin nombre"),
  nombreComercial: String(item?.commercialName ?? item?.commercial_name ?? item?.tradeName ?? item?.businessName ?? ""),
  ruc: String(item?.ruc ?? item?.taxId ?? item?.documentNumber ?? item?.supplierRuc ?? ""),
});

export default function DonantesPage({ mode = "list", onAgregar, onVolverListado }: Props) {
  const [donantes, setDonantes] = useState<Donante[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [ruc, setRuc] = useState("");
  const [tipoDonante, setTipoDonante] = useState("");
  const [nombreComercial, setNombreComercial] = useState("");
  const [tipoEmpresa, setTipoEmpresa] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefonoPrincipal, setTelefonoPrincipal] = useState("");
  const [telefonoSecundario, setTelefonoSecundario] = useState("");
  const [paginaWeb, setPaginaWeb] = useState("");
  const [sectorActividad, setSectorActividad] = useState("");
  const [estadoDonante, setEstadoDonante] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [contactoActual, setContactoActual] = useState<ContactoDonante>(contactoVacio());
  const [contactos, setContactos] = useState<ContactoDonante[]>([]);
  const [errorContacto, setErrorContacto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  const [tiposDireccion, setTiposDireccion] = useState<OpcionCatalogo[]>([]);
  const [tiposAcceso, setTiposAcceso] = useState<OpcionCatalogo[]>([]);
  const [tiemposAnticipacion, setTiemposAnticipacion] = useState<OpcionCatalogo[]>([]);
  const [requisitosPlanta, setRequisitosPlanta] = useState<OpcionCatalogo[]>([]);
  const [direccionActual, setDireccionActual] = useState<DireccionDonante>(direccionVacia());
  const [direcciones, setDirecciones] = useState<DireccionDonante[]>([]);
  const [errorDireccion, setErrorDireccion] = useState("");
  const [tabDonante, setTabDonante] = useState<"general" | "contactos" | "direcciones" | "articulos" | "documentos" | "resumen">("general");
  const [articulos, setArticulos] = useState<ArticuloDonante[]>([]);
  const [articuloActual, setArticuloActual] = useState<ArticuloDonante>({ articulo: "", categoria: "", unidad: "", presentacion: "", estado: "Activo" });
  const [articuloEditando, setArticuloEditando] = useState<number | null>(null);
  const [paginaArticulos, setPaginaArticulos] = useState(1);
  const articulosPorPagina = 5;
  const [documentos, setDocumentos] = useState<DocumentoDonante[]>(documentosRequeridos);
  const [errorDocumento, setErrorDocumento] = useState("");

  const subirDocumento = (id: string, archivo?: File) => {
    if (!archivo) return;
    const extensionValida = /\.(pdf|jpe?g|png)$/i.test(archivo.name);
    const tipoValido = !archivo.type || ["application/pdf", "image/jpeg", "image/png"].includes(archivo.type);
    if (!extensionValida || !tipoValido) {
      setErrorDocumento("El archivo debe estar en formato PDF, JPG o PNG.");
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      setErrorDocumento("El archivo no debe superar los 10 MB.");
      return;
    }
    setDocumentos((current) => current.map((documento) => documento.id === id ? { ...documento, archivo } : documento));
    setErrorDocumento("");
  };

  const guardarArticulo = () => {
    if (!articuloActual.articulo.trim() || !articuloActual.categoria.trim() || !articuloActual.unidad.trim() || !articuloActual.presentacion.trim()) return;
    if (articuloEditando === null) {
      setArticulos((current) => [...current, { ...articuloActual, articulo: articuloActual.articulo.trim() }]);
      setPaginaArticulos(Math.ceil((articulos.length + 1) / articulosPorPagina));
    } else {
      setArticulos((current) => current.map((item, index) => index === articuloEditando ? { ...articuloActual, articulo: articuloActual.articulo.trim() } : item));
      setArticuloEditando(null);
    }
    setArticuloActual({ articulo: "", categoria: "", unidad: "", presentacion: "", estado: "Activo" });
  };

  useEffect(() => {
    let active = true;
    const query = busqueda.trim();
    setCargando(true);
    setError("");
    const timer = window.setTimeout(() => {
      fetchSuppliers(query)
        .then((items) => {
          if (active) setDonantes(items.map(normalizeDonante));
        })
        .catch((loadError) => {
          console.error("Error cargando donantes:", loadError);
          if (active) setError("No se pudo cargar el catálogo de donantes.");
        })
        .finally(() => {
          if (active) setCargando(false);
        });
    }, query ? 300 : 0);

    return () => { active = false; window.clearTimeout(timer); };
  }, [busqueda]);

  useEffect(() => {
    fetchCatalogs().then((catalogs) => {
      const find = (...keys: string[]) => {
        const keySet = new Set(keys.map((key) => key.toLowerCase()));
        const match = Object.entries(catalogs ?? {}).find(([key]) => keySet.has(key.toLowerCase()));
        return match?.[1] as any[] | undefined;
      };
      setTiposDireccion(catalogOptions(find("typesAddress", "typesAddresses") ?? []));
      setTiposAcceso(catalogOptions(find("accessTypes", "accesTypes") ?? []));
      setTiemposAnticipacion(catalogOptions(find("leadTime", "leadTimes", "anticipationTimes") ?? []));
      setRequisitosPlanta(catalogOptions(find("requirements", "requeriments", "pickupRequirements") ?? []));
    }).catch((catalogError) => console.error("Error cargando catálogos de direcciones:", catalogError));
  }, []);

  const filtrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return donantes;
    return donantes.filter((item) => `${item.nombre} ${item.nombreComercial} ${item.id} ${item.ruc}`.toLowerCase().includes(query));
  }, [donantes, busqueda]);

  const guardarDonante = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorGuardado("");
    if (!tipoDonante || !nombre.trim() || !tipoEmpresa || !ruc.trim() || !estadoDonante) {
      setTabDonante("general");
      setErrorGuardado("Completa tipo de donante, razón social o nombre, tipo de empresa, RUC y estado.");
      return;
    }
    const draftHasData = Object.entries(contactoActual).some(([key, value]) => key !== "tipo" && Boolean(value.trim()));
    if (draftHasData && [contactoActual.nombres, contactoActual.cargo, contactoActual.correo, contactoActual.movil].some((value) => !value.trim())) {
      setTabDonante("contactos");
      setErrorGuardado("Completa los campos obligatorios del contacto o agrégalo antes de guardar.");
      return;
    }
    const contactsToSave = draftHasData ? [...contactos, contactoActual] : contactos;
    if (contactsToSave.length === 0) {
      setTabDonante("contactos");
      setErrorGuardado("Agrega al menos un contacto con los datos obligatorios.");
      return;
    }
    const addressHasData = Object.values(direccionActual).some((value) => Array.isArray(value) ? value.length > 0 : typeof value === "string" ? Boolean(value.trim()) : value);
    if (addressHasData && (!direccionActual.tipoDireccion || !direccionActual.nombre.trim() || !direccionActual.departamento || !direccionActual.provincia || !direccionActual.distrito || !direccionActual.direccion.trim() || !direccionActual.latitud || !direccionActual.longitud || !direccionActual.tipoAcceso || !direccionActual.atencionDesde || !direccionActual.atencionHasta || !direccionActual.diasAtencion.length || !direccionActual.anticipacion || !direccionActual.recojoDesde || !direccionActual.recojoHasta || !direccionActual.tiempoCarga || !direccionActual.contactoSede.trim())) {
      setTabDonante("direcciones");
      setErrorGuardado("Completa los campos obligatorios de la dirección o agrégala antes de guardar.");
      return;
    }
    const direccionesToSave = addressHasData ? [...direcciones, direccionActual] : direcciones;
    setGuardando(true);
    try {
      await createSupplier({
        supplierType: tipoDonante,
        commercialName: nombreComercial.trim(),
        supplierName: nombre.trim(),
        companyType: tipoEmpresa,
        supplierRuc: ruc.trim(),
        email: correo.trim(),
        primaryPhone: telefonoPrincipal.trim(),
        secondaryPhone: telefonoSecundario.trim(),
        website: paginaWeb.trim(),
        sectorActivity: sectorActividad.trim(),
        statusCode: estadoDonante,
        observations: observaciones.trim(),
        contacts: contactsToSave.map((contact) => ({
          contactType: contact.tipo,
          fullName: contact.nombres.trim(),
          position: contact.cargo.trim(),
          email: contact.correo.trim(),
          mobilePhone: contact.movil.trim(),
          landline: contact.telefonoFijo.trim(),
          whatsapp: contact.whatsapp.trim(),
          responsibilities: contact.funciones.trim(),
        })),
        addresses: direccionesToSave.map((address) => ({
          typeAddressId: address.tipoDireccion,
          addressName: address.nombre.trim(),
          description: address.descripcion.trim(),
          departmentCode: address.departamento,
          provinceCode: address.provincia,
          districtCode: address.distrito,
          address: address.direccion.trim(),
          reference: address.referencia.trim(),
          postalCode: address.codigoPostal,
          latitude: Number(address.latitud),
          longitude: Number(address.longitud),
          accessTypeId: address.tipoAcceso,
          plantHoursFrom: address.atencionDesde,
          plantHoursTo: address.atencionHasta,
          attentionDays: address.diasAtencion,
          requiresAuthorization: address.requiereAutorizacion,
          leadTimeId: address.anticipacion,
          entryRequirements: address.requisitos,
          pickupWindowFrom: address.recojoDesde,
          pickupWindowTo: address.recojoHasta,
          estimatedLoadingTime: address.tiempoCarga,
          siteContactName: address.contactoSede.trim(),
          authorizationContactName: address.contactoAutorizacion.trim(),
          authorizationContactPhone: address.telefonoAutorizacion.trim(),
          accessObservations: address.observacionesAcceso.trim(),
        })),
      });
      onVolverListado?.();
    } catch (saveError) {
      setErrorGuardado(saveError instanceof Error ? saveError.message : "No se pudo registrar el donante.");
    } finally {
      setGuardando(false);
    }
  };

  const agregarContacto = () => {
    const required = [contactoActual.nombres, contactoActual.cargo, contactoActual.correo, contactoActual.movil];
    if (required.some((value) => !value.trim())) {
      setErrorContacto("Completa nombres y apellidos, cargo, correo y teléfono móvil.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(contactoActual.correo.trim())) {
      setErrorContacto("Ingresa un correo electrónico válido para el contacto.");
      return;
    }
    setContactos((current) => [...current, contactoActual]);
    setContactoActual(contactoVacio("Secundario"));
    setErrorContacto("");
  };

  const agregarDireccion = () => {
    const required = [direccionActual.tipoDireccion, direccionActual.nombre, direccionActual.departamento, direccionActual.provincia, direccionActual.distrito, direccionActual.direccion, direccionActual.latitud, direccionActual.longitud, direccionActual.tipoAcceso, direccionActual.atencionDesde, direccionActual.atencionHasta, direccionActual.anticipacion, direccionActual.recojoDesde, direccionActual.recojoHasta, direccionActual.tiempoCarga, direccionActual.contactoSede];
    if (required.some((value) => !String(value).trim()) || !direccionActual.diasAtencion.length) {
      setErrorDireccion("Completa los datos obligatorios, incluidos ubicación, coordenadas y al menos un día de atención.");
      return;
    }
    const lat = Number(direccionActual.latitud), lng = Number(direccionActual.longitud);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      setErrorDireccion("Ingresa una latitud entre -90 y 90 y una longitud entre -180 y 180.");
      return;
    }
    setDirecciones((current) => [...current, direccionActual]);
    setDireccionActual(direccionVacia());
    setErrorDireccion("");
  };

  const setDireccionField = <K extends keyof DireccionDonante>(field: K, value: DireccionDonante[K]) => setDireccionActual((current) => ({ ...current, [field]: value }));
  const latitudMapa = Number.parseFloat(direccionActual.latitud);
  const longitudMapa = Number.parseFloat(direccionActual.longitud);
  const coordenadasValidas = direccionActual.latitud.trim() !== "" && direccionActual.longitud.trim() !== "" && Number.isFinite(latitudMapa) && Number.isFinite(longitudMapa) && latitudMapa >= -90 && latitudMapa <= 90 && longitudMapa >= -180 && longitudMapa <= 180;
  const urlMapa = coordenadasValidas ? `https://www.google.com/maps?q=${latitudMapa},${longitudMapa}&z=15&output=embed` : "";

  if (mode === "create") {
    return (
      <div className="space-y-6 px-6 py-6 lg:px-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">Catálogo</p>
          <h1 className="text-2xl font-bold text-gray-900">Agregar donante</h1>
        </div>
        <form onSubmit={guardarDonante} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex gap-2 border-b border-gray-200" role="tablist" aria-label="Secciones del donante">
            <button type="button" role="tab" aria-selected={tabDonante === "general"} onClick={() => setTabDonante("general")} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${tabDonante === "general" ? "border-[#5cb89a] text-[#32876d]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Información general</button>
            <button type="button" role="tab" aria-selected={tabDonante === "contactos"} onClick={() => setTabDonante("contactos")} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${tabDonante === "contactos" ? "border-[#5cb89a] text-[#32876d]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Contactos ({contactos.length})</button>
            <button type="button" role="tab" aria-selected={tabDonante === "direcciones"} onClick={() => setTabDonante("direcciones")} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${tabDonante === "direcciones" ? "border-[#5cb89a] text-[#32876d]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Direcciones ({direcciones.length})</button>
            <button type="button" role="tab" aria-selected={tabDonante === "documentos"} onClick={() => setTabDonante("documentos")} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${tabDonante === "documentos" ? "border-[#5cb89a] text-[#32876d]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Documentos</button>
            <button type="button" role="tab" aria-selected={tabDonante === "resumen"} onClick={() => setTabDonante("resumen")} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${tabDonante === "resumen" ? "border-[#5cb89a] text-[#32876d]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Resumen final</button>
          </div>

          {tabDonante === "general" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div><label className={labelClass}>Tipo de donante</label><select required value={tipoDonante} onChange={(event) => setTipoDonante(event.target.value)} className={inputClass}><option value="">Seleccionar tipo</option><option>Persona natural</option><option>Empresa</option><option>Institución</option><option>Organización</option></select></div>
              <div><label className={labelClass}>Nombre comercial</label><input value={nombreComercial} onChange={(event) => setNombreComercial(event.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Razón social / Nombre</label><input required value={nombre} onChange={(event) => setNombre(event.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Tipo de empresa</label><select required value={tipoEmpresa} onChange={(event) => setTipoEmpresa(event.target.value)} className={inputClass}><option value="">Seleccionar tipo</option><option>S.A.</option><option>S.A.C.</option><option>S.R.L.</option><option>E.I.R.L.</option><option>S.A.A.</option><option>Otra</option></select></div>
              <div><label className={labelClass}>RUC</label><input required inputMode="numeric" value={ruc} onChange={(event) => setRuc(event.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Correo electrónico</label><input type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Teléfono principal</label><input type="tel" value={telefonoPrincipal} onChange={(event) => setTelefonoPrincipal(event.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Teléfono secundario</label><input type="tel" value={telefonoSecundario} onChange={(event) => setTelefonoSecundario(event.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Página web</label><input type="url" value={paginaWeb} onChange={(event) => setPaginaWeb(event.target.value)} placeholder="https://" className={inputClass} /></div>
              <div><label className={labelClass}>Sector / Actividad</label><input value={sectorActividad} onChange={(event) => setSectorActividad(event.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Estado del donante</label><select required value={estadoDonante} onChange={(event) => setEstadoDonante(event.target.value)} className={inputClass}><option value="">Seleccionar estado</option><option>Activo</option><option>Inactivo</option><option>En revisión</option></select></div>
              <div className="md:col-span-2 xl:col-span-3"><label className={labelClass}>Observaciones</label><textarea rows={3} value={observaciones} onChange={(event) => setObservaciones(event.target.value)} className={inputClass} /></div>
            </div>
          ) : tabDonante === "contactos" ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900">Agregar contacto</h2>
                <div><label className={labelClass}>Tipo de contacto</label><select value={contactoActual.tipo} onChange={(event) => setContactoActual({ ...contactoActual, tipo: event.target.value as ContactoDonante["tipo"] })} className={inputClass}><option>Principal</option><option>Secundario</option></select></div>
                <div><label className={labelClass}>Nombres y apellidos *</label><input value={contactoActual.nombres} onChange={(event) => setContactoActual({ ...contactoActual, nombres: event.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Cargo *</label><input value={contactoActual.cargo} onChange={(event) => setContactoActual({ ...contactoActual, cargo: event.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Correo electrónico *</label><input type="email" value={contactoActual.correo} onChange={(event) => setContactoActual({ ...contactoActual, correo: event.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Teléfono móvil *</label><input type="tel" value={contactoActual.movil} onChange={(event) => setContactoActual({ ...contactoActual, movil: event.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Teléfono fijo</label><input type="tel" value={contactoActual.telefonoFijo} onChange={(event) => setContactoActual({ ...contactoActual, telefonoFijo: event.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>WhatsApp</label><input type="tel" value={contactoActual.whatsapp} onChange={(event) => setContactoActual({ ...contactoActual, whatsapp: event.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Funciones / Responsabilidad</label><textarea rows={2} value={contactoActual.funciones} onChange={(event) => setContactoActual({ ...contactoActual, funciones: event.target.value })} className={inputClass} /></div>
                {errorContacto && <p className="text-sm text-red-600">{errorContacto}</p>}
                <button type="button" onClick={agregarContacto} className="inline-flex items-center gap-2 rounded-lg border border-[#5cb89a]/50 px-4 py-2 text-sm font-semibold text-[#32876d] hover:bg-[#5cb89a]/10"><Plus className="h-4 w-4" /> Agregar otro contacto</button>
              </div>
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">Contactos registrados ({contactos.length})</h2>
                {contactos.length === 0 ? <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">Todavía no agregaste contactos.</p> : contactos.map((contact, index) => (
                  <article key={`${contact.correo}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-gray-900">{contact.nombres}</h3><span className="rounded-full bg-[#5cb89a]/10 px-2 py-0.5 text-xs font-medium text-[#32876d]">{contact.tipo}</span></div><p className="mt-1 text-xs text-gray-600">{contact.cargo}</p></div>
                      <button type="button" aria-label={`Eliminar contacto ${contact.nombres}`} onClick={() => setContactos((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-gray-600"><p>{contact.correo}</p><p>Móvil: {contact.movil}</p>{contact.telefonoFijo && <p>Fijo: {contact.telefonoFijo}</p>}{contact.whatsapp && <p>WhatsApp: {contact.whatsapp}</p>}{contact.funciones && <p>Funciones: {contact.funciones}</p>}</div>
                  </article>
                ))}
              </div>
            </div>
          ) : tabDonante === "direcciones" ? (
            <div className="space-y-6">
              <section className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h2 className="text-base font-semibold text-gray-900">Información general</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div><label className={labelClass}>Tipo de dirección *</label><select value={direccionActual.tipoDireccion} onChange={(e) => setDireccionField("tipoDireccion", e.target.value)} className={inputClass}><option value="">Seleccionar tipo</option>{tiposDireccion.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select></div>
                  <div><label className={labelClass}>Nombre de la dirección *</label><input value={direccionActual.nombre} onChange={(e) => setDireccionField("nombre", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Descripción</label><input value={direccionActual.descripcion} onChange={(e) => setDireccionField("descripcion", e.target.value)} className={inputClass} /></div>
                </div>
              </section>

              <section className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h2 className="text-base font-semibold text-gray-900">Ubicación</h2>
                <UbigeoSelector initialValues={direccionActual} onChange={(field, value) => setDireccionField(field, value)} />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div><label className={labelClass}>Dirección *</label><input value={direccionActual.direccion} onChange={(e) => setDireccionField("direccion", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Referencia</label><input value={direccionActual.referencia} onChange={(e) => setDireccionField("referencia", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Latitud *</label><input type="number" step="any" value={direccionActual.latitud} onChange={(e) => setDireccionField("latitud", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Longitud *</label><input type="number" step="any" value={direccionActual.longitud} onChange={(e) => setDireccionField("longitud", e.target.value)} className={inputClass} /></div>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2">
                    <p className="text-sm font-medium text-gray-700">Ubicación en mapa</p>
                    {coordenadasValidas && <a href={`https://www.google.com/maps?q=${latitudMapa},${longitudMapa}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#32876d] hover:underline">Abrir en Google Maps</a>}
                  </div>
                  {coordenadasValidas ? (
                    <iframe key={`${latitudMapa},${longitudMapa}`} title={`Mapa de ubicación ${latitudMapa}, ${longitudMapa}`} className="block h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={urlMapa} />
                  ) : (
                    <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-gray-500">Ingresa una latitud y longitud válidas para mostrar la ubicación en el mapa.</div>
                  )}
                </div>
              </section>

              <section className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h2 className="text-base font-semibold text-gray-900">Configuración y disponibilidad</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div><label className={labelClass}>Tipo de acceso *</label><select value={direccionActual.tipoAcceso} onChange={(e) => setDireccionField("tipoAcceso", e.target.value)} className={inputClass}><option value="">Seleccionar acceso</option>{tiposAcceso.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select></div>
                  <div><label className={labelClass}>Atención en planta: desde *</label><input type="time" value={direccionActual.atencionDesde} onChange={(e) => setDireccionField("atencionDesde", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Atención en planta: hasta *</label><input type="time" value={direccionActual.atencionHasta} onChange={(e) => setDireccionField("atencionHasta", e.target.value)} className={inputClass} /></div>
                </div>
                <fieldset><legend className={labelClass}>Días de atención *</legend><div className="flex flex-wrap gap-3">{[[1,"Lun"],[2,"Mar"],[3,"Mié"],[4,"Jue"],[5,"Vie"],[6,"Sáb"],[0,"Dom"]].map(([day, label]) => <label key={String(day)} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={direccionActual.diasAtencion.includes(String(day))} onChange={(e) => setDireccionField("diasAtencion", e.target.checked ? [...direccionActual.diasAtencion, String(day)] : direccionActual.diasAtencion.filter((d) => d !== String(day)))} />{label}</label>)}</div></fieldset>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div><label className={labelClass}>¿Requiere autorización previa?</label><select value={direccionActual.requiereAutorizacion ? "true" : "false"} onChange={(e) => setDireccionField("requiereAutorizacion", e.target.value === "true")} className={inputClass}><option value="false">No</option><option value="true">Sí</option></select></div>
                  <div><label className={labelClass}>Tiempo de anticipación *</label><select value={direccionActual.anticipacion} onChange={(e) => setDireccionField("anticipacion", e.target.value)} className={inputClass}><option value="">Seleccionar tiempo</option>{tiemposAnticipacion.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select></div>
                  <div><label className={labelClass}>Tiempo estimado de carga *</label><select value={direccionActual.tiempoCarga} onChange={(e) => setDireccionField("tiempoCarga", e.target.value)} className={inputClass}><option value="">Seleccionar duración</option><option value="1-2">1 a 2 horas</option><option value="2-4">2 a 4 horas</option><option value="4+">Más de 4 horas</option></select></div>
                </div>
                <fieldset><legend className={labelClass}>Requisitos para ingreso a planta</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{requisitosPlanta.map((o) => <label key={o.id} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={direccionActual.requisitos.includes(o.id)} onChange={(e) => setDireccionField("requisitos", e.target.checked ? [...direccionActual.requisitos, o.id] : direccionActual.requisitos.filter((id) => id !== o.id))} />{o.nombre}</label>)}</div></fieldset>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label className={labelClass}>Ventana de recojo: desde *</label><input type="time" value={direccionActual.recojoDesde} onChange={(e) => setDireccionField("recojoDesde", e.target.value)} className={inputClass} /></div><div><label className={labelClass}>Ventana de recojo: hasta *</label><input type="time" value={direccionActual.recojoHasta} onChange={(e) => setDireccionField("recojoHasta", e.target.value)} className={inputClass} /></div></div>
              </section>

              <section className="space-y-4 rounded-xl border border-gray-200 p-4">
                <h2 className="text-base font-semibold text-gray-900">Contacto en esta sede</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div><label className={labelClass}>Persona de contacto en planta *</label><input value={direccionActual.contactoSede} onChange={(e) => setDireccionField("contactoSede", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Contacto para autorización</label><input value={direccionActual.contactoAutorizacion} onChange={(e) => setDireccionField("contactoAutorizacion", e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Teléfono de autorización</label><input type="tel" value={direccionActual.telefonoAutorizacion} onChange={(e) => setDireccionField("telefonoAutorizacion", e.target.value)} className={inputClass} /></div>
                  <div className="md:col-span-3"><label className={labelClass}>Observaciones de acceso</label><textarea rows={2} value={direccionActual.observacionesAcceso} onChange={(e) => setDireccionField("observacionesAcceso", e.target.value)} className={inputClass} /></div>
                </div>
              </section>
              {errorDireccion && <p className="text-sm text-red-600">{errorDireccion}</p>}
              <div className="flex justify-end"><button type="button" onClick={agregarDireccion} className="inline-flex items-center gap-2 rounded-lg border border-[#5cb89a]/50 px-4 py-2 text-sm font-semibold text-[#32876d] hover:bg-[#5cb89a]/10"><Plus className="h-4 w-4" /> Agregar dirección</button></div>
              {direcciones.length > 0 && <div className="space-y-2"><h3 className="text-sm font-semibold">Direcciones agregadas ({direcciones.length})</h3>{direcciones.map((address, index) => <div key={`${address.nombre}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm"><span>{address.nombre} · {address.direccion} · {address.codigoPostal}</span><button type="button" aria-label={`Eliminar dirección ${address.nombre}`} onClick={() => setDirecciones((current) => current.filter((_, i) => i !== index))} className="text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div>}
            </div>
          ) : tabDonante === "articulos" ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Artículos que dona habitualmente</h2>
                <p className="mt-1 text-sm text-gray-600">Agrega los principales productos que este donante suele donar para facilitar futuras donaciones.</p>
              </div>
              <section className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2 xl:grid-cols-5">
                <div><label className={labelClass}>Artículo</label><input value={articuloActual.articulo} onChange={(event) => setArticuloActual({ ...articuloActual, articulo: event.target.value })} className={inputClass} placeholder="Nombre del producto" /></div>
                <div><label className={labelClass}>Categoría</label><input value={articuloActual.categoria} onChange={(event) => setArticuloActual({ ...articuloActual, categoria: event.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Unidad</label><input value={articuloActual.unidad} onChange={(event) => setArticuloActual({ ...articuloActual, unidad: event.target.value })} className={inputClass} placeholder="Ej. caja, kg" /></div>
                <div><label className={labelClass}>Forma de presentación</label><input value={articuloActual.presentacion} onChange={(event) => setArticuloActual({ ...articuloActual, presentacion: event.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Estado</label><select value={articuloActual.estado} onChange={(event) => setArticuloActual({ ...articuloActual, estado: event.target.value as ArticuloDonante["estado"] })} className={inputClass}><option>Activo</option><option>Inactivo</option></select></div>
                <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
                  <button type="button" onClick={guardarArticulo} disabled={!articuloActual.articulo.trim() || !articuloActual.categoria.trim() || !articuloActual.unidad.trim() || !articuloActual.presentacion.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#5cb89a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a9a82] disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" />{articuloEditando === null ? "Agregar artículo" : "Guardar cambios"}</button>
                  {articuloEditando !== null && <button type="button" onClick={() => { setArticuloEditando(null); setArticuloActual({ articulo: "", categoria: "", unidad: "", presentacion: "", estado: "Activo" }); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">Cancelar</button>}
                </div>
              </section>
              <section className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr>{["Artículo", "Categoría", "Unidad", "Forma de presentación", "Estado", "Acciones"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {articulos.slice((paginaArticulos - 1) * articulosPorPagina, paginaArticulos * articulosPorPagina).map((item, index) => {
                      const itemIndex = (paginaArticulos - 1) * articulosPorPagina + index;
                      return <tr key={`${item.articulo}-${itemIndex}`} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm font-medium text-gray-900">{item.articulo}</td><td className="px-4 py-3 text-sm text-gray-700">{item.categoria}</td><td className="px-4 py-3 text-sm text-gray-700">{item.unidad}</td><td className="px-4 py-3 text-sm text-gray-700">{item.presentacion}</td><td className="px-4 py-3 text-sm"><span className={`rounded-full px-2 py-1 text-xs font-medium ${item.estado === "Activo" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{item.estado}</span></td><td className="px-4 py-3"><div className="flex items-center gap-2"><button type="button" aria-label={`Editar ${item.articulo}`} onClick={() => { setArticuloActual(item); setArticuloEditando(itemIndex); }} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#32876d]"><Pencil className="h-4 w-4" /></button><button type="button" aria-label={`Eliminar ${item.articulo}`} onClick={() => { const next = articulos.filter((_, i) => i !== itemIndex); setArticulos(next); if (articuloEditando === itemIndex) setArticuloEditando(null); setPaginaArticulos(Math.min(paginaArticulos, Math.max(1, Math.ceil(next.length / articulosPorPagina)))); }} className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></td></tr>;
                    })}
                    {articulos.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">Todavía no hay artículos registrados.</td></tr>}
                  </tbody>
                </table></div>
                <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600">{articulos.length} producto{articulos.length === 1 ? "" : "s"}</p>
                  <div className="flex items-center justify-between gap-3 sm:justify-end"><span className="text-sm text-gray-500">Página {paginaArticulos} de {Math.max(1, Math.ceil(articulos.length / articulosPorPagina))}</span><button type="button" aria-label="Página anterior" disabled={paginaArticulos <= 1} onClick={() => setPaginaArticulos((page) => page - 1)} className="rounded-md border border-gray-300 p-1.5 text-gray-600 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Página siguiente" disabled={paginaArticulos >= Math.ceil(articulos.length / articulosPorPagina)} onClick={() => setPaginaArticulos((page) => page + 1)} className="rounded-md border border-gray-300 p-1.5 text-gray-600 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>
                </div>
              </section>
            </div>
          ) : tabDonante === "documentos" ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">Documentos requeridos</h2>
                  <span className="group relative inline-flex" title="Adjunta los documentos solicitados. Los archivos deben estar en formato PDF, JPG o PNG y no deben superar los 10 MB por archivo.">
                    <CircleHelp className="h-4 w-4 text-gray-400" aria-label="Ayuda sobre documentos" />
                    <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-72 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal text-white shadow-lg group-hover:block group-focus-within:block">Adjunta los documentos solicitados. Los archivos deben estar en formato PDF, JPG o PNG y no deben superar los 10 MB por archivo.</span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Adjunta los documentos solicitados. Los archivos deben estar en formato PDF, JPG o PNG y no deben superar los 10 MB por archivo.</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr>{["Documento", "Descripción", "Archivo", "Estado", "Acciones"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {documentos.map((documento) => <tr key={documento.id} className="align-top hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">{documento.nombre}</td>
                      <td className="max-w-xs px-4 py-4 text-sm text-gray-600">{documento.descripcion}</td>
                      <td className="px-4 py-4">
                        <div className="flex min-w-56 items-center gap-3">
                          <label htmlFor={`archivo-${documento.id}`} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-[#5cb89a] hover:text-[#32876d]" title="Subir archivo"><CloudUpload className="h-5 w-5" /></label>
                          <div className="min-w-0">
                            <label htmlFor={`archivo-${documento.id}`} className="cursor-pointer text-sm font-medium text-[#32876d] hover:underline">{documento.archivo ? "Cambiar archivo" : "Subir archivo"}</label>
                            <p className="text-xs text-gray-500">PDF, JPG o PNG (máx. 10 MB)</p>
                            {documento.archivo && <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-700" title={documento.archivo.name}><FileText className="h-3.5 w-3.5 shrink-0" />{documento.archivo.name}</p>}
                            <input id={`archivo-${documento.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" onChange={(event) => { subirDocumento(documento.id, event.target.files?.[0]); event.target.value = ""; }} />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${documento.archivo ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{documento.archivo ? "Cargado" : "Pendiente"}</span></td>
                      <td className="whitespace-nowrap px-4 py-4"><div className="flex items-center gap-2">
                        <button type="button" aria-label={`Editar archivo de ${documento.nombre}`} onClick={() => document.getElementById(`archivo-${documento.id}`)?.click()} disabled={!documento.archivo} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#32876d] disabled:cursor-not-allowed disabled:opacity-40"><Pencil className="h-4 w-4" /></button>
                        <button type="button" aria-label={`Eliminar archivo de ${documento.nombre}`} onClick={() => { setDocumentos((current) => current.map((item) => item.id === documento.id ? { ...item, archivo: null } : item)); setErrorDocumento(""); }} disabled={!documento.archivo} className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                      </div></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
              {errorDocumento && <p role="alert" className="text-sm text-red-600">{errorDocumento}</p>}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Resumen final del donante</h2>
                <p className="mt-1 text-sm text-gray-600">Revisa la información ingresada en las secciones del registro antes de guardar.</p>
              </div>

              <section className="rounded-xl border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Información general</h3>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[["Tipo de donante", tipoDonante], ["Razón social / Nombre", nombre], ["Nombre comercial", nombreComercial], ["Tipo de empresa", tipoEmpresa], ["RUC", ruc], ["Estado", estadoDonante], ["Correo", correo], ["Teléfono principal", telefonoPrincipal], ["Teléfono secundario", telefonoSecundario], ["Página web", paginaWeb], ["Sector / Actividad", sectorActividad], ["Observaciones", observaciones]].map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-gray-500">{label}</dt><dd className="mt-0.5 break-words text-sm text-gray-800">{value || "—"}</dd></div>)}
                </dl>
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Contactos ({contactos.length})</h3>
                {contactos.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{contactos.map((contact, index) => <article key={`${contact.correo}-${index}`} className="rounded-lg bg-gray-50 p-3"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-gray-900">{contact.nombres}</p><span className="rounded-full bg-[#5cb89a]/10 px-2 py-0.5 text-xs text-[#32876d]">{contact.tipo}</span></div><p className="mt-1 text-xs text-gray-600">{contact.cargo || "—"} · {contact.correo || "—"} · {contact.movil || "—"}</p></article>)}</div> : <p className="text-sm text-gray-500">No se agregaron contactos.</p>}
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Direcciones ({direcciones.length})</h3>
                {direcciones.length ? <div className="space-y-2">{direcciones.map((address, index) => <article key={`${address.nombre}-${index}`} className="rounded-lg bg-gray-50 p-3"><p className="text-sm font-medium text-gray-900">{address.nombre || "Dirección"} · {address.tipoDireccion || "Tipo no especificado"}</p><p className="mt-1 text-xs text-gray-600">{[address.direccion, address.distrito, address.provincia, address.departamento].filter(Boolean).join(", ") || "Sin ubicación"}</p><p className="mt-1 text-xs text-gray-600">Atención: {address.atencionDesde || "—"} a {address.atencionHasta || "—"} · Recojo: {address.recojoDesde || "—"} a {address.recojoHasta || "—"}</p></article>)}</div> : <p className="text-sm text-gray-500">No se agregaron direcciones.</p>}
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Artículos habituales ({articulos.length})</h3>
                {articulos.length ? <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{["Artículo", "Categoría", "Unidad", "Presentación", "Estado"].map((label) => <th key={label} className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{articulos.map((item, index) => <tr key={`${item.articulo}-${index}`}><td className="px-3 py-2 text-sm text-gray-800">{item.articulo}</td><td className="px-3 py-2 text-sm text-gray-700">{item.categoria}</td><td className="px-3 py-2 text-sm text-gray-700">{item.unidad}</td><td className="px-3 py-2 text-sm text-gray-700">{item.presentacion}</td><td className="px-3 py-2 text-sm text-gray-700">{item.estado}</td></tr>)}</tbody></table></div> : <p className="text-sm text-gray-500">No se registraron artículos habituales.</p>}
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Documentos requeridos</h3>
                <div className="space-y-2">{documentos.map((documento) => <div key={documento.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"><div><p className="text-sm font-medium text-gray-800">{documento.nombre}</p><p className="text-xs text-gray-500">{documento.archivo?.name || documento.descripcion}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${documento.archivo ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{documento.archivo ? "Cargado" : "Pendiente"}</span></div>)}</div>
              </section>
            </div>
          )}

          {errorGuardado && <p className="text-sm text-red-600">{errorGuardado}</p>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            <button type="button" onClick={onVolverListado} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /> Volver al listado</button>
            <button type="submit" disabled={guardando} className="inline-flex items-center gap-2 rounded-lg bg-[#5cb89a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a9a82] disabled:opacity-60"><Plus className="h-4 w-4" /> {guardando ? "Guardando..." : "Guardar donante"}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">Catálogo</p>
          <h1 className="text-2xl font-bold text-gray-900">Donantes</h1>
        </div>
        <button type="button" onClick={onAgregar} className="inline-flex items-center gap-2 rounded-lg bg-[#5cb89a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a9a82]">
          <Plus className="h-4 w-4" /> Agregar donante
        </button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">{filtrados.length} donante{filtrados.length === 1 ? "" : "s"}</p>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar empresa por nombre o RUC..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
            />
          </div>
        </div>

        {cargando ? (
          <p className="py-10 text-center text-sm text-gray-500">Cargando donantes...</p>
        ) : error ? (
          <p className="py-10 text-center text-sm text-red-600">{error}</p>
        ) : filtrados.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            <Users className="mx-auto mb-2 h-6 w-6 text-gray-400" />
            No hay donantes que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Donante</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">RUC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtrados.map((item, index) => (
                  <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.id || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.ruc || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
