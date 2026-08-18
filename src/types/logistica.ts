// Tipos del modulo de Logistica.
// Encapsula el formulario de aprobacion logistica de una donacion:
// modo de recojo, ubicacion, resumen, aprobacion y condiciones del producto.

import type { Donacion } from "./donacion";

// Modos de recojo disponibles
export type ModoRecojo =
  | "Recojo con unidades BAP"
  | "Contratar Transporte Externo (tercero)"
  | "Organizacion beneficiaria recogera la donacion";

export const MODOS_RECOJO: ModoRecojo[] = [
  "Recojo con unidades BAP",
  "Contratar Transporte Externo (tercero)",
  "Organizacion beneficiaria recogera la donacion",
];

export interface VentajaConsideracion {
  texto: string;
}

// Informacion estructurada de cada modo de recojo
export interface DetalleModoRecojo {
  key: ModoRecojo;
  ventajas: string[];
  consideraciones: string[];
}

export const DETALLE_MODOS_RECOJO: DetalleModoRecojo[] = [
  {
    key: "Recojo con unidades BAP",
    ventajas: [
      "Control directo del transporte y manipulacion",
      "Sin costo adicional de transporte",
      "Asegura cumplimiento de protocolos BAP",
    ],
    consideraciones: [
      "Disponibilidad de unidades y rutas",
      "Tiempos de recojo",
    ],
  },
  {
    key: "Contratar Transporte Externo (tercero)",
    ventajas: [
      "Mayor flexibilidad de horarios",
      "Acceso a unidades especializadas",
      "Coberturas en zonas lejanas",
    ],
    consideraciones: [
      "Genera costos adicionales",
      "Requiere aprobacion de gerencia general",
    ],
  },
  {
    key: "Organizacion beneficiaria recogera la donacion",
    ventajas: [
      "Empodera a las organizaciones",
      "Reduce los costos logisticos",
    ],
    consideraciones: [
      "Dependencia de disponibilidad de la organizacion",
      "Requiere aprobacion y confirmacion previa",
    ],
  },
];

// Ubicacion de recojo (reutilizable)
export interface UbicacionRecojo {
  direccion: string;
  distrito: string;
  provincia: string;
}

// Resumen logistico
export interface ResumenLogistico {
  volumenTotal: string;
  pesoEstimado: string;
  cajasEstimadas: string;
  temperaturaRequerida: string;
  urgencia: string;
  tiempoDisponible: string;
  fechaLimiteSugerida: string;
}

// Estados de aprobacion logistica (coinciden con los de calidad)
export type EstadoAprobacionLogistica =
  | "Aprobado"
  | "Aprobado con observacion"
  | "Rechazado";

export const ESTADOS_APROBACION_LOGISTICA: EstadoAprobacionLogistica[] = [
  "Aprobado",
  "Aprobado con observacion",
  "Rechazado",
];

// Aprobacion logistica
export interface AprobacionLogistica {
  areaResponsable: string;
  responsableNombre: string;
  fechaAprobacion: string;
  estadosSeleccionados: EstadoAprobacionLogistica[];
}

// Condiciones del producto (texto libre, igual que en calidad)
export interface CondicionesProductoLogistica {
  condicion: string;
  vidaUtilPromedio: string;
  almacenamiento: string;
}

// Registro completo del formulario de aprobacion logistica
export interface AprobacionLogisticaRecord {
  donacionId: string;
  modoRecojo: ModoRecojo | "";
  ubicacionRecojo: UbicacionRecojo;
  resumen: ResumenLogistico;
  aprobacion: AprobacionLogistica;
  observacionesLogistica: string;
  condiciones: CondicionesProductoLogistica;
  restriccionesDonante: string;
}

export const APROBACION_LOGISTICA_VACIA: Omit<
  AprobacionLogisticaRecord,
  "donacionId"
> = {
  modoRecojo: "",
  ubicacionRecojo: { direccion: "", distrito: "", provincia: "" },
  resumen: {
    volumenTotal: "",
    pesoEstimado: "",
    cajasEstimadas: "",
    temperaturaRequerida: "",
    urgencia: "Media",
    tiempoDisponible: "",
    fechaLimiteSugerida: "",
  },
  aprobacion: {
    areaResponsable: "Logistica",
    responsableNombre: "",
    fechaAprobacion: new Date().toISOString().slice(0, 10),
    estadosSeleccionados: [],
  },
  observacionesLogistica: "",
  condiciones: {
    condicion: "Bueno",
    vidaUtilPromedio: "",
    almacenamiento: "Almacen general",
  },
  restriccionesDonante: "",
};

// Helper: resumen de la donacion para la cabecera del formulario
export interface ResumenDonacionParaLogistica {
  codigo: string;
  donante: string;
  fechaIntencion: string;
  canal: string;
}

export function resumenParaLogistica(
  d: Donacion
): ResumenDonacionParaLogistica {
  return {
    codigo: d.codigo,
    donante: d.donante,
    fechaIntencion: d.fechaIntencion,
    canal: d.canal,
  };
}
