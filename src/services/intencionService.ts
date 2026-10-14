import { INITIAL_INTENCIONES, MOCK_ORGANIZACIONES } from "./mockData";
import { COMPROMISO_IDONEIDAD_INICIAL, type CompromisoIdoneidadFlags, type Intencion } from "../types/intencion";
import axios from "axios";
import { getToken } from "./authService";
import { catalogStore } from "./catalogStore";

const STORAGE_KEY = "mock_intenciones";
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function getStoredIntenciones(): Intencion[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored intentions", e);
      return INITIAL_INTENCIONES;
    }
  }
  return INITIAL_INTENCIONES;
}

function setStoredIntenciones(data: Intencion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type IntencionApiData = Intencion & {
  supplierId?: string;
  motivoDonacion?: string;
  compromisoIdoneidad?: CompromisoIdoneidadFlags | string[] | string;
  condicionAlmacenamiento?: string;
  fechaEstimadaEntrega?: string;
  descripcionGeneralDonacion?: string;
  recomendacionesConsumo?: string;
  condicionProducto?: string;
  declaracionProducto?: boolean;
  incluyeProductosSensibles?: string | boolean;
};

const DAY_OF_WEEK: Record<string, number> = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Domingo: 7,
};

const numberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const dateOnlyProperty = (property: string, value?: string) =>
  value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? { [property]: value }
    : {};

const catalogId = (
  items: Array<{ id: string; name: string }>,
  value: unknown,
  allowUnmatchedValue = true
) => {
  const selected = String(value ?? "");
  const normalize = (text: string) => text.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  const normalizedSelection = normalize(selected);
  const match = items.find((item) =>
    item.id === selected || normalize(item.name) === normalizedSelection
  );
  return match?.id ?? (allowUnmatchedValue ? selected : "");
};

const extractIntentId = (value: unknown): string | undefined => {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const id = extractIntentId(item);
      if (id) return id;
    }
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const idKeys = new Set(["intentid", "intentionid", "intentpublicid", "publicid", "intentguid", "intentionguid", "uuid", "guid", "id"]);
  for (const [key, candidate] of Object.entries(record)) {
    if (!idKeys.has(key.toLowerCase())) continue;
    if ((typeof candidate === "string" || typeof candidate === "number") && String(candidate).trim()) {
      return String(candidate).trim();
    }
  }

  const wrapperKeys = new Set(["data", "intent", "intention", "result", "createdintent", "created"]);
  for (const [key, nested] of Object.entries(record)) {
    if (!wrapperKeys.has(key.toLowerCase())) continue;
    const id = extractIntentId(nested);
    if (id) return id;
  }
  return undefined;
};

const intentIdFromLocation = (location?: unknown): string | undefined => {
  if (typeof location !== "string" || !location.trim()) return undefined;
  const lastSegment = location.split(/[?#]/, 1)[0].split("/").filter(Boolean).pop();
  if (!lastSegment || lastSegment.toLowerCase() === "intents") return undefined;
  try {
    return decodeURIComponent(lastSegment);
  } catch {
    return lastSegment;
  }
};

export async function saveIntencion(
  data: IntencionApiData,
  files: { documents?: File[]; photos?: File[] } = {}
): Promise<Intencion> {
  const token = getToken();
  const loggedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("authUser") || "null") as {
        username?: string;
        publicId?: string;
      } | null;
    } catch {
      return null;
    }
  })();
  const createdBy = loggedUser?.username || loggedUser?.publicId || data.responsable;
  const quality = data as IntencionApiData;
  const logistics = data.logistica;
  const catalogs = catalogStore.getState();
  const rawCommitments = quality.compromisoIdoneidad;
  const commitmentFlags: CompromisoIdoneidadFlags =
    rawCommitments !== null &&
    typeof rawCommitments === "object" &&
    !Array.isArray(rawCommitments)
      ? { ...COMPROMISO_IDONEIDAD_INICIAL, ...rawCommitments }
      : {
          envase_integro: Array.isArray(rawCommitments)
            ? rawCommitments.includes("envase_integro")
            : rawCommitments === "envase_integro",
          sin_deterioro: Array.isArray(rawCommitments)
            ? rawCommitments.includes("sin_deterioro")
            : rawCommitments === "sin_deterioro",
          conservacion: Array.isArray(rawCommitments)
            ? rawCommitments.includes("conservacion")
            : rawCommitments === "conservacion",
        };
  // Convertimos el modelo del formulario al contrato POST /api/Intents.
  const apiPayload = {
    statusCode: "",
    supplierId: data.supplierId || import.meta.env.VITE_DEFAULT_SUPPLIER_ID || "SUP-001",
    supplierName: data.donante,
    contacto: data.contacto || null,
    fecha: data.fechaIntencion,
    channelId: catalogId(catalogs.canales, data.canal),
    responsable: data.responsable,
    intentTypeId: catalogId(catalogs.tiposIntencion, data.tipoIntencion),
    productSensibily:
      quality.incluyeProductosSensibles === true ||
      quality.incluyeProductosSensibles === "Si" ||
      quality.incluyeProductosSensibles === "true"
        ? "Si"
        : "No",
    createdBy,
    donationReasonId: catalogId(catalogs.motivosDonacion, quality.motivoDonacion),
    packagingIntact: commitmentFlags.envase_integro,
    noSignsOfDeterioration: commitmentFlags.sin_deterioro,
    storedAsRecommended: commitmentFlags.conservacion,
    storageConditionId: catalogId(catalogs.condicionAlmacenamiento, quality.condicionAlmacenamiento),
    ...dateOnlyProperty("estimatedDeliveryDate", quality.fechaEstimadaEntrega),
    productConditionId: quality.condicionProducto || "",
    donationDescription: quality.descripcionGeneralDonacion || "",
    consumptionRecommendation: quality.recomendacionesConsumo || "",
    productDeclaration: quality.declaracionProducto ?? false,
    qualityUserAuthorization: null,
    qualityAuthorizationDate: null,
    logisticUserAuthorization: null,
    logisticAuthorizationDate: null,
    socialUserAuthorization: null,
    socialAuthorizationDate: null,
    products: data.productos.map((product) => ({
      donationIntentId: null,
      productName: product.producto,
      description: product.descripcion || "",
      offeredQuantity: product.cantidad,
      realQuantity: product.cantidad,
      unitCode: catalogId(catalogs.unidades, product.unidad),
      estimatedWeight: product.pesoEstimadoKg,
      ...dateOnlyProperty("expirationDate", product.vidaUtil),
      productTypeCode: catalogId(catalogs.tiposProducto, product.tipoProducto),
      originCode: catalogId(catalogs.procedencias, product.procedencia),
    })),
    infoLogistic: {
      placeTypeId: catalogId(catalogs.tipoLugar, logistics.tipoLugar, false),
      placeName: logistics.lugar,
      contactName: logistics.contactoPlanta,
      direccion: logistics.direccion,
      referencia: logistics.referencia || null,
      districtCode: logistics.distrito,
      provinceCode: logistics.provincia,
      departmentCode: logistics.departamento,
      postalCode: logistics.codigoPostal,
      latitude: numberOrNull(logistics.latitud),
      longitude: numberOrNull(logistics.longitud),
      accesTypeId: catalogId(catalogs.tipoAcceso, logistics.tipoAcceso, false),
      requiresAuthorization: logistics.requiereAutorizacion === "Si",
      anticipationTimeId: catalogId(catalogs.anticipacion, logistics.anticipacion, false),
      authorizationContact: logistics.contactoAutorizacion || null,
      contactNumber: logistics.numeroContacto || null,
      ...dateOnlyProperty("starDate", logistics.fechaDesde),
      ...dateOnlyProperty("endDate", logistics.fechaHasta),
      startTime: logistics.horarioInicio || "",
      endTime: logistics.horarioFinal || "",
      estimatedLoadingMinutes: Number(logistics.tiempoEstimadoCarga) || 0,
      permitedHours: logistics.horarioDisponible || "",
      donationPickupDays: logistics.diasAtencion.map((day) => ({
        dayOfWeek: DAY_OF_WEEK[day],
      })),
      donationPickupRequeriments: logistics.requisitosIngreso
        .map((requirement) => {
          const numericId = Number(requirement);
          return { requirementId: Number.isFinite(numericId) ? numericId : requirement };
        }),
    },
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/Intents`, apiPayload, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      withCredentials: true,
    });
    const result = response.data?.data ?? response.data;
    const createdIntentId =
      extractIntentId(response.data) ?? intentIdFromLocation(response.headers?.["location"]);
    if (response.data?.success === false) {
      throw new Error(response.data.message || "La API rechazó la intención.");
    }

    const documents = files.documents ?? [];
    const photos = files.photos ?? [];
    if (documents.length > 0 || photos.length > 0) {
      if (!createdIntentId) {
        throw new Error("La intención se creó, pero la API no devolvió su ID para cargar los archivos.");
      }

      const formData = new FormData();
      documents.forEach((file) => formData.append("Documents", file, file.name));
      photos.forEach((file) => formData.append("Photos", file, file.name));

      await axios.post(
        `${API_BASE_URL}/Intents/${encodeURIComponent(createdIntentId)}/files`,
        formData,
        {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          withCredentials: true,
        }
      );
    }

    const current = getStoredIntenciones();
    const now = new Date().toISOString();
    const saved = {
      ...data,
      id: createdIntentId ?? result?.id ?? result?.intentId ?? data.id ?? crypto.randomUUID(),
      codigo: result?.codigo ?? result?.code ?? data.codigo,
      estado: "",
      createdAt: now,
      calidad: {
        motivoDonacion: quality.motivoDonacion,
        compromisoIdoneidad: commitmentFlags,
        condicionAlmacenamiento: quality.condicionAlmacenamiento,
        fechaEstimadaEntrega: quality.fechaEstimadaEntrega,
        descripcionGeneralDonacion: quality.descripcionGeneralDonacion,
        incluyeProductosSensibles: quality.incluyeProductosSensibles,
        recomendacionesConsumo: quality.recomendacionesConsumo,
        condicionProducto: quality.condicionProducto,
        declaracionProducto: quality.declaracionProducto ?? false,
      },
    } as unknown as Intencion;

    setStoredIntenciones([saved, ...current]);
    return saved;
  } catch (error) {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string; title?: string; errors?: unknown } | string };
      message?: string;
    };
    const responseData = axiosError.response?.data;
    const validationDetails = typeof responseData === "object" && responseData?.errors
      ? Object.entries(responseData.errors as Record<string, unknown>)
          .map(([field, messages]) => {
            const detail = Array.isArray(messages) ? messages.join(", ") : String(messages);
            return `${field}: ${detail}`;
          })
          .join("; ")
      : undefined;
    const responseMessage = typeof responseData === "string"
      ? responseData
      : validationDetails || responseData?.message || responseData?.title;
    const message = responseMessage ||
      (axiosError.response?.status
        ? `Error ${axiosError.response.status} al guardar la intención.`
        : axiosError.message) ||
      "Error al guardar la intención en el servidor";

    console.error("API Error while saving intention:", responseData || axiosError.message);
    throw new Error(message);
  }
}

const readField = (source: any, ...names: string[]): any => {
  if (!source || typeof source !== "object") return undefined;
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  const entry = Object.entries(source).find(([key]) => wanted.has(key.toLowerCase()));
  return entry?.[1];
};

const unwrapIntentList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["data", "items", "intents", "intentions", "results", "result", "records"])
    if (key in payload) {
      const found = unwrapIntentList(payload[key]);
      if (found.length || Array.isArray(payload[key])) return found;
    }
  return [];
};

const displayCatalogValue = (value: any, catalogs: ReturnType<typeof catalogStore.getState>, collection: "canales" | "origins" | "tiposIntencion" | "proveedores") => {
  if (value === null || value === undefined) return "";
  const id = String(value);
  const match = catalogs[collection].find((item) => item.id.toLowerCase() === id.toLowerCase());
  return match?.name ?? id;
};

const mapApiIntent = (raw: any, index: number): Intencion => {
  const catalogs = catalogStore.getState();
  const logistic = readField(raw, "infoLogistic", "logistics", "logistica") ?? {};
  const quality = readField(raw, "quality", "qualityInfo") ?? raw;
  const rawId = readField(raw, "intentId", "intentionId", "id", "uuid", "guid");
  const channelId = readField(raw, "channelId", "channel", "canal");
  const supplierId = readField(raw, "supplierId", "supplier", "donorId");
  const intentTypeId = readField(raw, "intentTypeId", "intentionTypeId", "intentType", "tipoIntencion");
  const date = readField(raw, "fechaIntencion", "fecha", "intentDate", "intentionDate", "createdAt", "date");
  const status = readField(raw, "status", "statusName", "statusCode", "estado");
  const dateText = date ? String(date).slice(0, 10) : "";
  const flags = {
    envase_integro: Boolean(readField(quality, "packagingIntact", "envase_integro")),
    sin_deterioro: Boolean(readField(quality, "noSignsOfDeterioration", "sin_deterioro")),
    conservacion: Boolean(readField(quality, "storedAsRecommended", "conservacion")),
  };
  const dayNames: Record<number, any> = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo" };
  const daysRaw = readField(logistic, "donationPickupDays", "diasAtencion");
  const pickupDays = Array.isArray(daysRaw) ? daysRaw.map((item: any) => dayNames[Number(readField(item, "dayOfWeek") ?? item)]).filter(Boolean) : [];
  const requirementsRaw = readField(logistic, "donationPickupRequeriments", "donationPickupRequirements", "requisitosIngreso");
  const requirements = Array.isArray(requirementsRaw) ? requirementsRaw.map((item: any) => String(readField(item, "requirementId", "id") ?? item)) : [];
  const estado = status == null ? "" : String(status);
  return {
    id: String(rawId ?? `api-${index}`),
    codigo: String(readField(raw, "code", "codigo", "intentCode", "intentNumber") ?? `INT-${String(rawId ?? index)}`),
    donante: String(readField(raw, "supplierName", "donorName", "donante") ?? displayCatalogValue(supplierId, catalogs, "proveedores")),
    contacto: String(readField(raw, "contacto", "contact", "contactName", "email", "phone") ?? ""),
    fechaIntencion: dateText,
    canal: (displayCatalogValue(channelId, catalogs, "canales") !== String(channelId ?? "")
      ? displayCatalogValue(channelId, catalogs, "canales")
      : catalogs.origins.find((item) => item.id.toLowerCase() === String(channelId ?? "").toLowerCase())?.name ?? String(channelId ?? "")) as any,
    responsable: String(readField(raw, "responsable", "responsible", "createdBy") ?? ""),
    tipoIntencion: displayCatalogValue(intentTypeId, catalogs, "tiposIntencion") as any,
    estado: estado as any,
    productos: [],
    calidad: {
      motivoDonacion: String(readField(quality, "donationReasonName", "donationReasonId", "motivoDonacion") ?? "") as any,
      compromisoIdoneidad: flags,
      condicionAlmacenamiento: String(readField(quality, "storageConditionName", "storageConditionId", "condicionAlmacenamiento") ?? "") as any,
      fechaEstimadaEntrega: String(readField(quality, "estimatedDeliveryDate", "fechaEstimadaEntrega") ?? "").slice(0, 10),
      descripcionGeneralDonacion: String(readField(quality, "donationDescription", "descripcionGeneralDonacion") ?? ""),
      incluyeProductosSensibles: String(readField(quality, "productSensibily", "incluyeProductosSensibles") ?? "No") as any,
      recomendacionesConsumo: String(readField(quality, "consumptionRecommendation", "recomendacionesConsumo") ?? ""),
      condicionProducto: String(readField(quality, "productConditionName", "productConditionId", "condicionProducto") ?? ""),
      declaracionProducto: Boolean(readField(quality, "productDeclaration", "declaracionProducto")),
    },
    logistica: {
      tipoLugar: String(readField(logistic, "placeTypeName", "placeTypeId", "tipoLugar") ?? "") as any,
      lugar: String(readField(logistic, "placeName", "lugar") ?? ""),
      contactoPlanta: String(readField(logistic, "contactName", "contactoPlanta") ?? ""),
      direccion: String(readField(logistic, "direccion", "address") ?? ""), referencia: String(readField(logistic, "referencia", "reference") ?? ""),
      distrito: String(readField(logistic, "districtName", "districtCode", "distrito") ?? "") as any,
      provincia: String(readField(logistic, "provinceName", "provinceCode", "provincia") ?? "") as any,
      departamento: String(readField(logistic, "departmentName", "departmentCode", "departamento") ?? "") as any,
      codigoPostal: String(readField(logistic, "postalCode", "codigoPostal") ?? ""),
      tipoAcceso: String(readField(logistic, "accessTypeName", "accesTypeId", "accessTypeId", "tipoAcceso") ?? "") as any,
      horarioInicio: String(readField(logistic, "startTime", "horarioInicio") ?? ""), horarioFinal: String(readField(logistic, "endTime", "horarioFinal") ?? ""),
      diasAtencion: pickupDays,
      requiereAutorizacion: readField(logistic, "requiresAuthorization", "requiereAutorizacion") ? "Si" : "No",
      anticipacion: String(readField(logistic, "leadTimeName", "anticipationTimeId", "anticipacion") ?? "") as any,
      contactoAutorizacion: String(readField(logistic, "authorizationContact", "contactoAutorizacion") ?? ""),
      numeroContacto: String(readField(logistic, "contactNumber", "numeroContacto") ?? ""), requisitosIngreso: requirements,
      fechaDesde: String(readField(logistic, "starDate", "startDate", "fechaDesde") ?? "").slice(0, 10),
      fechaHasta: String(readField(logistic, "endDate", "fechaHasta") ?? "").slice(0, 10),
      horarioDisponible: String(readField(logistic, "permitedHours", "permittedHours", "horarioDisponible") ?? ""),
      tiempoEstimadoCarga: String(readField(logistic, "estimatedLoadingMinutes", "tiempoEstimadoCarga") ?? ""),
      latitud: String(readField(logistic, "latitude", "latitud") ?? ""), longitud: String(readField(logistic, "longitude", "longitud") ?? ""), observacionesAcceso: "",
    },
    documentos: [], fotos: [], createdAt: String(readField(raw, "createdAt", "createdDate") ?? ""),
  };
};

export async function getIntenciones(): Promise<Intencion[]> {
  const token = getToken();
  const response = await axios.get(`${API_BASE_URL}/Intents/GetIntents`, {
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    withCredentials: true,
  });
  const rows = unwrapIntentList(response.data).map(mapApiIntent);
  // Keep local test fixtures available in every workflow alongside API data.
  // Local entries win on duplicate IDs so simulated status changes persist.
  const merged = new Map<string, Intencion>();
  rows.forEach((item) => merged.set(item.id, item));
  getStoredIntenciones().forEach((item) => merged.set(item.id, item));
  return [...merged.values()];
}

export async function getIntencionById(id: string) {
  const data = getStoredIntenciones();
  const item = data.find((i) => i.id === id);
  if (item) return item;
  const apiItem = (await getIntenciones()).find((i) => i.id === id);
  if (!apiItem) throw new Error("No se pudo obtener la intención");
  return apiItem;
}

export async function updateIntencionStatus(id: string, status: number | string) {
  const current = getStoredIntenciones();
  const index = current.findIndex((i) => i.id === id);
  if (index === -1) throw new Error("Intención no encontrada");

  const updated = [...current];

  const statusMap: Record<number, string> = {
    0: "Capturada",
    1: "AprobadaCalidad",
    2: "AprobadaLogistica",
    3: "Asignada",
    4: "Coordinada",
    5: "Cerrada",
  };

  const finalStatus = typeof status === "number" ? statusMap[status] : status;
  updated[index] = { ...updated[index], estado: finalStatus };

  setStoredIntenciones(updated);
  return updated[index];
}

export async function getRecommendations(id: string) {
  return MOCK_ORGANIZACIONES.map(org => {
    let score = 60;
    if (org.CapacidadSemanalKg > 1000) score += 20;
    if (org.HistorialCumplimiento > 0.9) score += 20;

    return {
      Organizacion: org,
      Compatibility: score,
      Reason: `Sugerida por: ${org.Categoria}, alta capacidad y cumplimiento del ${org.HistorialCumplimiento * 100}%.`
    };
  }).sort((a, b) => b.Compatibility - a.Compatibility);
}
