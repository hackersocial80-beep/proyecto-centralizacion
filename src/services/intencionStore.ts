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
    calidad: {
      motivoDonacion: "Excedente de produccion",
      compromisoIdoneidad: {
        envase_integro: true,
        sin_deterioro: true,
        conservacion: true,
      },
      condicionAlmacenamiento: "Temperatura ambiente",
      fechaEstimadaEntrega: "2026-10-15",
      descripcionGeneralDonacion: "Datos ficticios para prueba de visualización.",
      incluyeProductosSensibles: "No",
      recomendacionesConsumo: "Sin recomendaciones de prueba.",
      condicionProducto: "",
      declaracionProducto: true,
    },
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
      },
    ],
    logistica: {
      tipoLugar: "Centro de acopio",
      lugar: "Centro de recojo de prueba - Alicorp",
      contactoPlanta: "Contacto de prueba Alicorp",
      direccion: "Dirección de prueba 123",
      referencia: "Ingreso principal de prueba",
      distrito: "Cercado de Lima",
      provincia: "Canta",
      departamento: "Lima",
      codigoPostal: "15001",
      tipoAcceso: "Vehicular",
      horarioInicio: "09:00",
      horarioFinal: "16:00",
      diasAtencion: ["Lunes", "Miércoles", "Viernes"],
      requiereAutorizacion: "Si",
      anticipacion: "24 horas",
      contactoAutorizacion: "Responsable de prueba Alicorp",
      numeroContacto: "999000001",
      requisitosIngreso: ["1", "4", "5"],
      fechaDesde: "2026-10-12",
      fechaHasta: "2026-10-30",
      horarioDisponible: "09:00 - 16:00",
      tiempoEstimadoCarga: "45",
      latitud: "-12.0464",
      longitud: "-77.0428",
      observacionesAcceso: "Datos ficticios para prueba de visualización.",
    },
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
    calidad: {
      motivoDonacion: "Vencimiento proximo",
      compromisoIdoneidad: {
        envase_integro: true,
        sin_deterioro: true,
        conservacion: false,
      },
      condicionAlmacenamiento: "Temperatura ambiente",
      fechaEstimadaEntrega: "2026-10-18",
      descripcionGeneralDonacion: "Datos ficticios para prueba de visualización.",
      incluyeProductosSensibles: "No",
      recomendacionesConsumo: "Sin recomendaciones de prueba.",
      condicionProducto: "",
      declaracionProducto: true,
    },
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
      },
    ],
    logistica: {
      tipoLugar: "Centro de acopio",
      lugar: "Centro de recojo de prueba - Gloria",
      contactoPlanta: "Contacto de prueba Gloria",
      direccion: "Dirección de prueba 456",
      referencia: "Puerta de carga de prueba",
      distrito: "Cercado de Lima",
      provincia: "Canta",
      departamento: "Lima",
      codigoPostal: "15002",
      tipoAcceso: "Vehicular",
      horarioInicio: "08:30",
      horarioFinal: "15:30",
      diasAtencion: ["Martes", "Jueves", "Sábado"],
      requiereAutorizacion: "Si",
      anticipacion: "48 horas",
      contactoAutorizacion: "Responsable de prueba Gloria",
      numeroContacto: "999000002",
      requisitosIngreso: ["1", "3", "6"],
      fechaDesde: "2026-10-13",
      fechaHasta: "2026-10-31",
      horarioDisponible: "08:30 - 15:30",
      tiempoEstimadoCarga: "60",
      latitud: "-12.0500",
      longitud: "-77.0300",
      observacionesAcceso: "Datos ficticios para prueba de visualización.",
    },
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
