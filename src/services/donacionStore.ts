// Store del modulo Donacion. Reutiliza el store de Intencion como base y lo
// extiende con datos propios (organizacion, checklist, documentos, etc.).
// Reemplazable por API real.

import { useSyncExternalStore } from "react";
import type { Donacion, ResumenDonacion } from "../types/donacion";
import { ETAPAS_KEY, ETAPAS_PROCESO, TIPOS_DOCUMENTO } from "../types/donacion";
import { intencionStore } from "./intencionStore";
import type { Intencion } from "../types/intencion";

const baseChecklist = () =>
  ETAPAS_PROCESO.map((etapa) => ({ etapa, completado: false }));

const baseDocumentos = () =>
  TIPOS_DOCUMENTO.map((d) => ({ tipo: d.key, cargado: false }));

const enrich = (i: Intencion): Donacion => ({
  ...i,
  estadoDonacion:
    i.estado === "Aprobada"
      ? "En operacion"
      : i.estado === "Rechazada"
      ? "Rechazado"
      : i.estado === "En evaluacion"
      ? "En evaluacion"
      : "Pendiente",
  origen: "BAP",
  tipoProceso: "Regular",
  telefono: "+51 999 000 111",
  direccion: "Av. Ejemplo 123, Lima",
  condicionProducto: "Bueno",
  condicionAlmacenamiento: "Almacen general",
  urgencia: "Media",
  observaciones: "",
  productosResumen: i.productos,
  organizacion: {
    nombre: "Comedor Santa Maria",
    direccion: "Jr. Los Pinos 456, San Juan de Lurigancho",
    compatibilidad: "Alta",
  },
  documentosDonacion: baseDocumentos(),
  checklist: baseChecklist(),
});

// Datos extra de demo
const seedDonaciones: Record<string, Partial<Donacion>> = {
  "1": {
    estadoDonacion: "En evaluacion",
    origen: "Donante externo",
    tipoProceso: "Urgente",
    urgencia: "Alta",
    observaciones:
      "Donante prefiere entrega antes del 15 de agosto. Coordinar recojo en almacen de San Borja.",
    organizacion: {
      nombre: "Comedor Santa Maria",
      direccion: "Jr. Los Pinos 456, San Juan de Lurigancho",
      compatibilidad: "Alta",
    },
    documentosDonacion: [
      {
        tipo: "declaracion_aptitud",
        cargado: true,
        nombre: "declaracion-aptitud-alicorp.pdf",
        fechaCarga: "2026-08-08T11:00:00Z",
      },
      { tipo: "ficha_tecnica", cargado: false },
      { tipo: "certificado_analisis", cargado: false },
      { tipo: "fotografias", cargado: true, nombre: "fotos-alicorp.zip" },
    ],
    checklist: [
      { etapa: "Registro de intencion", completado: true, fecha: "2026-08-08" },
      { etapa: "Evaluacion de calidad", completado: true, fecha: "2026-08-09" },
      { etapa: "Aprobacion", completado: false },
      { etapa: "Asignacion", completado: false },
      { etapa: "Operacion", completado: false },
      { etapa: "Cierre", completado: false },
    ],
  },
  "2": {
    estadoDonacion: "En coordinacion",
    origen: "Aliado comercial",
    tipoProceso: "Regular",
    urgencia: "Media",
    organizacion: {
      nombre: "Casa Hogar Esperanza",
      direccion: "Av. La Marina 789, Callao",
      compatibilidad: "Media",
    },
    documentosDonacion: [
      {
        tipo: "declaracion_aptitud",
        cargado: true,
        nombre: "declaracion-gloria.pdf",
      },
      { tipo: "ficha_tecnica", cargado: true, nombre: "ficha-leche-uht.pdf" },
      { tipo: "certificado_analisis", cargado: false },
      { tipo: "fotografias", cargado: false },
    ],
    checklist: [
      { etapa: "Registro de intencion", completado: true },
      { etapa: "Evaluacion de calidad", completado: true },
      { etapa: "Aprobacion", completado: true },
      { etapa: "Asignacion", completado: true },
      { etapa: "Operacion", completado: false },
      { etapa: "Cierre", completado: false },
    ],
  },
};

let cache: Donacion[] = [];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const rebuild = () => {
  cache = intencionStore.getAll().map((i) => {
    const patch = seedDonaciones[i.id] ?? {};
    return { ...enrich(i), ...patch };
  });
  emit();
};

rebuild();
// Re-sincroniza cuando cambian las intenciones base
intencionStore.subscribe(rebuild);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => cache;

export const donacionStore = {
  subscribe,
  getSnapshot,
  getAll: () => cache,
  getById: (id: string) => cache.find((d) => d.id === id),
  update: (id: string, patch: Partial<Donacion>) => {
    cache = cache.map((d) => (d.id === id ? { ...d, ...patch } : d));
    emit();
  },
  toggleEtapa: (id: string, etapaKey: string) => {
    cache = cache.map((d) => {
      if (d.id !== id) return d;
      return {
        ...d,
        checklist: d.checklist.map((c) =>
          ETAPAS_KEY[c.etapa] === etapaKey
            ? {
                ...c,
                completado: !c.completado,
                fecha: !c.completado
                  ? new Date().toISOString().slice(0, 10)
                  : c.fecha,
              }
            : c
        ),
      };
    });
    emit();
  },
  toggleDocumento: (id: string, tipo: string) => {
    cache = cache.map((d) => {
      if (d.id !== id) return d;
      return {
        ...d,
        documentosDonacion: d.documentosDonacion.map((doc) =>
          doc.tipo === tipo
            ? {
                ...doc,
                cargado: !doc.cargado,
                fechaCarga: !doc.cargado
                  ? new Date().toISOString()
                  : doc.fechaCarga,
              }
            : doc
        ),
      };
    });
    emit();
  },
};

export function useDonaciones(): Donacion[] {
  return useSyncExternalStore(
    donacionStore.subscribe,
    donacionStore.getSnapshot,
    donacionStore.getSnapshot
  );
}

export function resumenDonaciones(items: Donacion[]): ResumenDonacion {
  return items.reduce<ResumenDonacion>(
    (acc, d) => {
      acc.total += 1;
      switch (d.estadoDonacion) {
        case "En evaluacion":
          acc.enEvaluacion += 1;
          break;
        case "En coordinacion":
          acc.enCoordinacion += 1;
          break;
        case "En operacion":
          acc.enOperacion += 1;
          break;
        case "Completado":
          acc.completados += 1;
          break;
      }
      return acc;
    },
    {
      total: 0,
      enEvaluacion: 0,
      enCoordinacion: 0,
      enOperacion: 0,
      completados: 0,
    }
  );
}
