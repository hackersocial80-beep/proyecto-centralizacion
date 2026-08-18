// Tipos del modulo de Calidad.
// Encapsula la evaluacion que se hace a una donacion antes de su aprobacion.

import type { Donacion } from "./donacion";

// Criterios / puntos a evaluar
export type CriterioCalidad =
  | "Condicion del producto"
  | "Inocuidad y seguridad alimentaria"
  | "Etiquetado / informacion"
  | "Empaque / envase"
  | "Almacenamiento y transporte";

export const CRITERIOS_CALIDAD: CriterioCalidad[] = [
  "Condicion del producto",
  "Inocuidad y seguridad alimentaria",
  "Etiquetado / informacion",
  "Empaque / envase",
  "Almacenamiento y transporte",
];

// Estado por criterio
export type EstadoCriterio =
  | "Aprobado"
  | "Aprobado con observacion"
  | "Rechazado";

export const ESTADOS_CRITERIO: EstadoCriterio[] = [
  "Aprobado",
  "Aprobado con observacion",
  "Rechazado",
];

// Estado global de la evaluacion
export type EstadoEvaluacion = EstadoCriterio;

export const ESTADOS_EVALUACION: EstadoEvaluacion[] = ESTADOS_CRITERIO;

export interface PuntoEvaluacion {
  criterio: CriterioCalidad;
  estado: EstadoCriterio;
  observacion?: string;
}

export interface UbicacionRecojo {
  direccion: string;
  distrito: string;
  provincia: string;
}

export interface CondicionesProducto {
  condicion: string;
  vidaUtilPromedio: string; // texto libre, p.ej. "60 dias" o una fecha
  almacenamiento: string;
}

export interface EvaluacionCalidad {
  donacionId: string;
  puntos: PuntoEvaluacion[];
  ubicacionRecojo: UbicacionRecojo;
  estadoGeneral: EstadoEvaluacion;
  observacionesGenerales: string;
  condiciones: CondicionesProducto;
  restriccionesDonante: string;
}

export const EVALUACION_VACIA: Omit<EvaluacionCalidad, "donacionId"> = {
  puntos: CRITERIOS_CALIDAD.map((criterio) => ({
    criterio,
    estado: "Aprobado",
    observacion: "",
  })),
  ubicacionRecojo: { direccion: "", distrito: "", provincia: "" },
  estadoGeneral: "Aprobado",
  observacionesGenerales: "",
  condiciones: {
    condicion: "Bueno",
    vidaUtilPromedio: "",
    almacenamiento: "Almacen general",
  },
  restriccionesDonante: "",
};

export type CalidadRecord = EvaluacionCalidad;

// Helper: resumen de la donacion para la cabecera
export interface ResumenDonacionParaCalidad {
  codigo: string;
  donante: string;
  fechaIntencion: string;
  canal: string;
}

export function resumenParaCalidad(d: Donacion): ResumenDonacionParaCalidad {
  return {
    codigo: d.codigo,
    donante: d.donante,
    fechaIntencion: d.fechaIntencion,
    canal: d.canal,
  };
}
