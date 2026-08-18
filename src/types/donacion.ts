// Tipos del modulo de Donacion.
// Reutiliza catalogos de intencion.ts pero añade el modelo
// "estilo operacion" que se ve en la pantalla de Donacion:
// estados por fase, organizacion asignada, checklist, etc.

import type {
  Canal,
  DocumentoAdjunto,
  FotoAdjunta,
  Intencion,
  ProductoIntencion,
  TipoIntencion,
  TipoProducto,
} from "./intencion";

// Estados visibles en el resumen / grid de Donacion
export type EstadoDonacion =
  | "Pendiente"
  | "En evaluacion"
  | "En coordinacion"
  | "En operacion"
  | "Completado"
  | "Rechazado";

export const ESTADOS_DONACION: EstadoDonacion[] = [
  "Pendiente",
  "En evaluacion",
  "En coordinacion",
  "En operacion",
  "Completado",
  "Rechazado",
];

// Etapas del proceso (checklist del detalle)
export type EtapaProceso =
  | "Registro de intencion"
  | "Evaluacion de calidad"
  | "Aprobacion"
  | "Asignacion"
  | "Operacion"
  | "Cierre";

export const ETAPAS_PROCESO: EtapaProceso[] = [
  "Registro de intencion",
  "Evaluacion de calidad",
  "Aprobacion",
  "Asignacion",
  "Operacion",
  "Cierre",
];

export const ETAPAS_KEY: Record<EtapaProceso, string> = {
  "Registro de intencion": "registro",
  "Evaluacion de calidad": "evaluacion",
  Aprobacion: "aprobacion",
  Asignacion: "asignacion",
  Operacion: "operacion",
  Cierre: "cierre",
};

// Tipos de documentos que se solicitan
export type TipoDocumento =
  | "declaracion_aptitud"
  | "ficha_tecnica"
  | "certificado_analisis"
  | "fotografias";

export const TIPOS_DOCUMENTO: { key: TipoDocumento; label: string }[] = [
  { key: "declaracion_aptitud", label: "Declaracion de aptitud del producto" },
  { key: "ficha_tecnica", label: "Ficha tecnica del producto" },
  { key: "certificado_analisis", label: "Certificado de analisis" },
  { key: "fotografias", label: "Fotografias del producto" },
];

export type Origen =
  | "BAP"
  | "MINSA"
  | "Donante externo"
  | "Aliado comercial";

export const ORIGENES: Origen[] = [
  "BAP",
  "MINSA",
  "Donante externo",
  "Aliado comercial",
];

export type TipoProceso = "Regular" | "Urgente" | "Muestreo" | "Auditoria";

export const TIPOS_PROCESO: TipoProceso[] = [
  "Regular",
  "Urgente",
  "Muestreo",
  "Auditoria",
];

export type CondicionProducto =
  | "Bueno"
  | "Regular"
  | "Deficiente"
  | "Vencido";

export const CONDICIONES_PRODUCTO: CondicionProducto[] = [
  "Bueno",
  "Regular",
  "Deficiente",
  "Vencido",
];

export type CondicionAlmacenamiento =
  | "Refrigerado"
  | "Congelado"
  | "Ambiente seco"
  | "Almacen general";

export const CONDICIONES_ALMACENAMIENTO: CondicionAlmacenamiento[] = [
  "Refrigerado",
  "Congelado",
  "Ambiente seco",
  "Almacen general",
];

export type Urgencia = "Baja" | "Media" | "Alta" | "Critica";

export const URGENCIAS: Urgencia[] = ["Baja", "Media", "Alta", "Critica"];

export type Compatibilidad = "Alta" | "Media" | "Baja" | "No compatible";

export const COMPATIBILIDADES: Compatibilidad[] = [
  "Alta",
  "Media",
  "Baja",
  "No compatible",
];

// Datos de organizacion asignada (entidad beneficiaria)
export interface OrganizacionAsignada {
  nombre: string;
  direccion: string;
  compatibilidad: Compatibilidad;
}

export interface DocumentoDonacion {
  tipo: TipoDocumento;
  cargado: boolean;
  nombre?: string;
  url?: string;
  fechaCarga?: string;
}

export interface EtapaCheck {
  etapa: EtapaProceso;
  completado: boolean;
  fecha?: string;
  responsable?: string;
  observacion?: string;
}

// Extension del modelo de Intencion con todo lo del modulo Donacion
export interface Donacion extends Intencion {
  estadoDonacion: EstadoDonacion;
  origen: Origen;
  tipoProceso: TipoProceso;
  telefono: string;
  direccion: string;
  condicionProducto: CondicionProducto;
  condicionAlmacenamiento: CondicionAlmacenamiento;
  urgencia: Urgencia;
  observaciones?: string;
  productosResumen: ProductoIntencion[]; // alias usado por el grid
  organizacion?: OrganizacionAsignada;
  documentosDonacion: DocumentoDonacion[];
  checklist: EtapaCheck[];
}

// Filtros del modulo Donacion
export interface FiltrosDonacion {
  busqueda: string; // codigo, donante o producto
  canal: Canal | "";
  estado: EstadoDonacion | "";
  fechaIntencion: string;
  origen: Origen | "";
  tipoProceso: TipoProceso | "";
  tipoIntencion: TipoIntencion | "";
  responsable: string;
}

export const FILTROS_DONACION_VACIOS: FiltrosDonacion = {
  busqueda: "",
  canal: "",
  estado: "",
  fechaIntencion: "",
  origen: "",
  tipoProceso: "",
  tipoIntencion: "",
  responsable: "",
};

// Resumen del modulo Donacion
export interface ResumenDonacion {
  total: number;
  enEvaluacion: number;
  enCoordinacion: number;
  enOperacion: number;
  completados: number;
}

// Helpers de tipos que reexportamos para uso en otros archivos
export { CANALES, RESPONSABLES, TIPOS_INTENCION } from "./intencion";
export type { Canal, DocumentoAdjunto, FotoAdjunta, TipoProducto };
