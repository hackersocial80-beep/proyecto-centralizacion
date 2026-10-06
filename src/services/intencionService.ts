import { INITIAL_INTENCIONES, MOCK_ORGANIZACIONES } from "./mockData";
import type { Intencion } from "../types/intencion";
import axios from "axios";
import { getToken } from "./authService";

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
  motivoDonacion?: string;
  compromisoIdoneidad?: string[] | string;
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

export async function saveIntencion(data: IntencionApiData): Promise<Intencion> {
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
  const commitments = Array.isArray(quality.compromisoIdoneidad)
    ? quality.compromisoIdoneidad
    : quality.compromisoIdoneidad ? [quality.compromisoIdoneidad] : [];

  // Convertimos el modelo del formulario al contrato POST /api/Intents.
  const apiPayload = {
    statusCode: "1",
    supplierId: import.meta.env.VITE_DEFAULT_SUPPLIER_ID || "SUP-001",
    supplierName: data.donante,
    contacto: data.contacto || null,
    fecha: data.fechaIntencion,
    channelId: data.canal,
    responsable: data.responsable,
    intentTypeId: data.tipoIntencion,
    productSensibily:
      quality.incluyeProductosSensibles === true ||
      quality.incluyeProductosSensibles === "Si" ||
      quality.incluyeProductosSensibles === "true"
        ? "Si"
        : "No",
    createdBy,
    donationReasonId: quality.motivoDonacion || "",
    suitabilityId: commitments.join(","),
    storageConditionId: quality.condicionAlmacenamiento || "",
    estimatedDeliveryDate: quality.fechaEstimadaEntrega || "",
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
      unitCode: product.unidad,
      estimatedWeight: product.pesoEstimadoKg,
      expirationDate: product.vidaUtil || "",
      productTypeCode: product.tipoProducto,
      originCode: product.procedencia,
    })),
    infoLogistic: {
      placeTypeId: logistics.tipoLugar,
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
      accesTypeId: logistics.tipoAcceso,
      requiresAuthorization: logistics.requiereAutorizacion === "Si",
      anticipationTimeId: logistics.anticipacion,
      authorizationContact: logistics.contactoAutorizacion || null,
      contactNumber: logistics.numeroContacto || null,
      starDate: logistics.fechaDesde || "",
      endDate: logistics.fechaHasta || "",
      startTime: logistics.horarioInicio || "",
      endTime: logistics.horarioFinal || "",
      estimatedLoadingMinutes: Number(logistics.tiempoEstimadoCarga) || 0,
      permitedHours: logistics.horarioDisponible || "",
      donationPickupDays: logistics.diasAtencion.map((day) => ({
        dayOfWeek: DAY_OF_WEEK[day],
      })),
      donationPickupRequeriments: logistics.requisitosIngreso
        .map((requirement) => Number(requirement))
        .filter(Number.isFinite)
        .map((requirementId) => ({ requirementId })),
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
    if (response.data?.success === false) {
      throw new Error(response.data.message || "La API rechazó la intención.");
    }

    const current = getStoredIntenciones();
    const now = new Date().toISOString();
    const saved = {
      ...data,
      id: result?.id ?? result?.intentId ?? data.id ?? crypto.randomUUID(),
      codigo: result?.codigo ?? result?.code ?? data.codigo,
      estado: "Capturada",
      createdAt: now,
      calidad: {
        motivoDonacion: quality.motivoDonacion,
        compromisoIdoneidad: commitments,
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

export async function getIntenciones() {
  return getStoredIntenciones();
}

export async function getIntencionById(id: string) {
  const data = getStoredIntenciones();
  const item = data.find((i) => i.id === id);
  if (!item) throw new Error("No se pudo obtener la intención");
  return item;
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
