import { INITIAL_INTENCIONES, MOCK_ORGANIZACIONES } from "./mockData";
import type { Intencion } from "../types/intencion";
import axios from "axios";

const STORAGE_KEY = "mock_intenciones";
const API_BASE_URL = "http://zerobap-pruebas.bap.net.pe/api";

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

export interface IntencionRequest {
  donante: string;
  contacto: string;
  fechaIntencion: string;
  canal: string;
  responsable: string;
  tipoIntencion: string;
  productos: any[];
  motivoDonacion?: string;
  compromisoIdoneidad?: string;
  condicionAlmacenamiento?: string;
  fechaEstimadaEntrega?: string;
  descripcionGeneralDonacion?: string;
  incluyeProductosSensibles?: boolean;
  recomendacionesConsumo?: string;
  condicionProducto?: string;
  declaracionProducto?: boolean;
  documentos: any[];
  fotos: any[];
}

export async function saveIntencion(data: IntencionRequest) {
  // 1. Mapping to API Format (English)
  // Note: In a real scenario, IDs would come from catalog selectors.
  // Here we map the values. For IDs, we use the string value or a mock mapping.
  const apiPayload = {
    statusCode: "1",
    supplierName: data.donante,
    supplierId: "SUP-001", // Mock ID: should come from supplier selector
    contacto: data.contacto,
    fecha: data.fechaIntencion,
    channelId: data.canal, // Mapping: "Web" -> "WEB", etc.
    responsable: data.responsable,
    intentTypeId: data.tipoIntencion,
    donationReasonId: data.motivoDonacion || "1",
    suitabilityId: data.compromisoIdoneidad || "1",
    storageConditionId: data.condicionAlmacenamiento || "1",
    estimatedDeliveryDate: data.fechaEstimadaEntrega || "",
    productConditionId: data.condicionProducto || "1",
    donationDescription: data.descripcionGeneralDonacion || "",
    consumptionRecommendation: data.recomendacionesConsumo || "",
    productDeclaration: data.declaracionProducto || true,
    qualityUserAuthorization: null,
    qualityAuthorizationDate: null,
    logisticUserAuthorization: null,
    logisticAuthorizationDate: null,
    socialUserAuthorization: null,
    socialAuthorizationDate: null,
    products: data.productos.map((p: any) => ({
      donationIntentId: null,
      productName: p.producto,
      description: p.descripcion,
      offeredQuantity: p.cantidad,
      realQuantity: p.cantidad,
      unitCode: p.unidad,
      estimatedWeight: p.pesoEstimadoKg,
      expirationDate: p.vidaUtil,
      productTypeCode: p.tipoProducto,
      originCode: p.procedencia,
    })),
    infoLogistic: {
      placeTypeId: data.productos[0]?.tipoLugar || "1",
      placeName: data.productos[0]?.lugar || "",
      contactName: data.productos[0]?.contactoPlanta || "",
      direccion: data.productos[0]?.direccion || "",
      referencia: data.productos[0]?.referencia || null,
      districtCode: data.productos[0]?.distrito || "",
      provinceCode: data.productos[0]?.provincia || "",
      departmentCode: data.productos[0]?.departamento || "",
      postalCode: data.productos[0]?.codigoPostal || "",
      latitude: parseFloat(data.productos[0]?.latitud || "0"),
      longitude: parseFloat(data.productos[0]?.longitud || "0"),
      accesTypeId: data.productos[0]?.tipoAcceso || "1",
      requiresAuthorization: data.productos[0]?.requiereAutorizacion === "Si",
      anticipationTimeId: data.productos[0]?.anticipacion || "1",
      authorizationContact: data.productos[0]?.contactoAutorizacion || null,
      contactNumber: data.productos[0]?.numeroContacto || null,
      starDate: data.productos[0]?.fechaDesde || "",
      endDate: data.productos[0]?.fechaHasta || "",
      startTime: data.productos[0]?.horarioInicio || "",
      endTime: data.productos[0]?.horarioFinal || "",
      estimatedLoadingMinutes: parseInt(data.productos[0]?.tiempoEstimadoCarga || "0"),
      permitedHours: data.productos[0]?.horarioDisponible || "",
      donationPickupDays: (data.productos[0]?.diasAtencion || []).map((day: string) => ({
        dayOfWeek: 1, // Mock mapping for days
      })),
      donationPickupRequeriments: (data.productos[0]?.requisitosIngreso || []).map((req: string) => ({
        requirementId: 1, // Mock mapping for requirements
      })),
    },
  };

  try {
    // 2. API Call
    const response = await axios.post(`${API_BASE_URL}/Intents`, apiPayload);

    // 3. Persistence in Mock Store for local visibility
    const current = getStoredIntenciones();
    const newIntencion: Intencion = {
      id: response.data.id || crypto.randomUUID(),
      codigo: response.data.codigo || `INT-2026-${(current.length + 1).toString().padStart(4, "0")}`,
      donante: data.donante,
      contacto: data.contacto,
      fechaIntencion: data.fechaIntencion,
      canal: data.canal as any,
      responsable: data.responsable,
      tipoIntencion: data.tipoIntencion as any,
      estado: "Capturada",
      productos: data.productos,
      motivoDonacion: data.motivoDonacion || "Excedente de produccion",
      compromisoIdoneidad: data.compromisoIdoneidad || undefined,
      condicionAlmacenamiento: data.condicionAlmacenamiento || undefined,
      fechaEstimadaEntrega: data.fechaEstimadaEntrega || undefined,
      descripcionGeneralDonacion: data.descripcionGeneralDonacion || undefined,
      incluyeProductosSensibles: data.incluyeProductosSensibles || undefined,
      recomendacionesConsumo: data.recomendacionesConsumo || undefined,
      condicionProducto: data.condicionProducto || undefined,
      declaracionProducto: data.declaracionProducto || undefined,
      documentos: data.documentos,
      fotos: data.fotos,
      createdAt: new Date().toISOString(),
    };

    const updated = [newIntencion, ...current];
    setStoredIntenciones(updated);
    return newIntencion;
  } catch (error: any) {
    console.error("API Error while saving intention:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al guardar la intención en el servidor");
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
