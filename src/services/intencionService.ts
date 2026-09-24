import { INITIAL_INTENCIONES, MOCK_ORGANIZACIONES } from "./mockData";
import type { Intencion } from "../types/intencion";

const STORAGE_KEY = "mock_intenciones";

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
  const current = getStoredIntenciones();
  const newIntencion: Intencion = {
    id: crypto.randomUUID(),
    codigo: `INT-2026-${(current.length + 1).toString().padStart(4, "0")}`,
    donante: data.donante,
    contacto: data.contacto,
    fechaIntencion: data.fechaIntencion,
    canal: data.canal,
    responsable: data.responsable,
    tipoIntencion: data.tipoIntencion,
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
