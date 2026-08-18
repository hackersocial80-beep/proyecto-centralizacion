// Store ligero (en memoria) para intenciones. Reemplazable por API real.
import { useSyncExternalStore } from "react";
import type { Intencion } from "../types/intencion";

const seed: Intencion[] = [
  {
    id: "1",
    codigo: "INT-2026-0001",
    donante: "Alicorp S.A.",
    contacto: "ventas@alicorp.com",
    fechaIntencion: "2026-08-08",
    canal: "Correo electronico",
    responsable: "Maria Lopez",
    tipoIntencion: "Donacion",
    estado: "Pendiente",
    productos: [
      {
        id: "p1",
        producto: "Fideos Don Vittorio 500g",
        descripcion: "Pasta seca, caja cerrada",
        cantidad: 120,
        unidad: "caja",
        pesoEstimadoKg: 60,
        vidaUtil: "2027-06-30",
        tipoProducto: "No perecible",
        procedencia: "Nacional",
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
        fechaDesde: "",
        fechaHasta: "",
        horarioDisponible: "",
        tiempoEstimadoCarga: "",
        latitud: "",
        longitud: "",
        observacionesAcceso: "",
      },
      {
        id: "p2",
        producto: "Aceite Primor 1L",
        descripcion: "Aceite vegetal, botella sellada",
        cantidad: 80,
        unidad: "unidad",
        pesoEstimadoKg: 76,
        vidaUtil: "2027-01-15",
        tipoProducto: "No perecible",
        procedencia: "Nacional",
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
        fechaDesde: "",
        fechaHasta: "",
        horarioDisponible: "",
        tiempoEstimadoCarga: "",
        latitud: "",
        longitud: "",
        observacionesAcceso: "",
      },
    ],
    documentos: [],
    fotos: [],
    createdAt: "2026-08-08T10:30:00Z",
  },
  {
    id: "2",
    codigo: "INT-2026-0002",
    donante: "Gloria S.A.",
    contacto: "+51 999 888 777",
    fechaIntencion: "2026-08-05",
    canal: "WhatsApp",
    responsable: "Carlos Mendoza",
    tipoIntencion: "Donacion",
    estado: "En evaluacion",
    productos: [
      {
        id: "p3",
        producto: "Leche Gloria UHT 1L",
        descripcion: "Caja tetra pak, larga vida",
        cantidad: 200,
        unidad: "unidad",
        pesoEstimadoKg: 210,
        vidaUtil: "2026-10-20",
        tipoProducto: "Lacteo",
        procedencia: "Nacional",
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
        fechaDesde: "",
        fechaHasta: "",
        horarioDisponible: "",
        tiempoEstimadoCarga: "",
        latitud: "",
        longitud: "",
        observacionesAcceso: "",
      },
    ],
    documentos: [],
    fotos: [],
    createdAt: "2026-08-05T14:15:00Z",
  },
];

let listeners = new Set<() => void>();
let state: Intencion[] = [...seed];

const emit = () => listeners.forEach((l) => l());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

export const intencionStore = {
  subscribe,
  getSnapshot,
  getAll: () => state,
  add: (i: Intencion) => {
    state = [i, ...state];
    emit();
  },
  update: (id: string, patch: Partial<Intencion>) => {
    state = state.map((i) => (i.id === id ? { ...i, ...patch } : i));
    emit();
  },
  remove: (id: string) => {
    state = state.filter((i) => i.id !== id);
    emit();
  },
  getById: (id: string) => state.find((i) => i.id === id),
};

export function useIntenciones(): Intencion[] {
  return useSyncExternalStore(
    intencionStore.subscribe,
    intencionStore.getSnapshot,
    intencionStore.getSnapshot
  );
}
