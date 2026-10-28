// Tipos del modulo de Seguimiento.
// Las organizaciones se derivan de las donaciones que ya tienen una
// organizacion asignada. La timeline sigue las 6 fases operativas.

import type { Donacion } from "./donacion";
import type { Intencion } from "./intencion";

// Las organizaciones asignadas y las opciones disponibles en Distribución
// se enlazan con la intención que está recorriendo el proceso.
export function organizacionesDesdeIntenciones(
  intenciones: Intencion[],
  candidatas: Array<{ Id: number | string; Nombre: string; Direccion: string; HistorialCumplimiento?: number }> = []
): Organizacion[] {
  return intenciones.flatMap((intencion, index) => {
    const asignada = (intencion as Intencion & { organizacionAsignada?: { id?: string; nombre: string; direccion?: string; compatibilidad?: string; conformidadPorcentaje?: number } }).organizacionAsignada;
    const estado = String(intencion.estado ?? "").toLowerCase();
    const seed = Array.from(intencion.id || String(index + 1)).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const vencimiento = intencion.productos?.map((producto) => producto.vidaUtil).filter(Boolean).sort()[0] ?? "";
    const completadas = estado === "5" || estado === "cerrada" ? 6 : estado === "4" || estado === "coordinada" ? 5 : estado === "3" || estado === "asignada" ? 3 : 2;
    const construir = (org: { id: string; nombre: string; direccion: string; compatibilidad: string; cumplimiento: number }, id: string, asignacion: string) => ({
      id, nombre: org.nombre, direccion: org.direccion || "-", compatibilidad: org.compatibilidad,
      asignacion, donacionId: intencion.id,
      conformidadPorcentaje: Math.max(0, Math.min(100, org.cumplimiento)), vencimientoProducto: vencimiento,
      coordenadas: { x: 18 + (seed * 13) % 60, y: 22 + (seed * 7) % 55 }, bapOrigen: { x: 12, y: 78 },
      timeline: ETAPAS_SEGUIMIENTO.map((etapa, etapaIndex) => ({ etapa, completado: etapaIndex < completadas, fecha: etapaIndex === 2 ? intencion.fechaAsignacion : undefined, responsable: etapaIndex === 2 ? intencion.responsable : undefined, nota: etapaIndex === 2 ? `Organización vinculada a la intención ${intencion.codigo}.` : undefined })),
    });

    if (asignada?.nombre) {
      const cumplimiento = Number(asignada.conformidadPorcentaje ?? 0);
      return [construir({ nombre: asignada.nombre, direccion: asignada.direccion || "", compatibilidad: asignada.compatibilidad || "Media", cumplimiento: Number.isFinite(cumplimiento) ? cumplimiento : 0 }, asignada.id || `org-${intencion.id}`, intencion.codigo)];
    }

    // Las intenciones aprobadas por Logística ya aparecen asociadas a las
    // organizaciones seleccionables en Distribución, pendientes de asignación.
    if (!["2", "aprobadalogistica"].includes(estado)) return [];
    return candidatas.map((org) => {
      const compliance = Number(org.HistorialCumplimiento ?? 0);
      return construir({ id: String(org.Id), nombre: org.Nombre, direccion: org.Direccion, compatibilidad: compliance >= 0.85 ? "Alta" : compliance >= 0.65 ? "Media" : "Baja", cumplimiento: compliance <= 1 ? compliance * 100 : compliance }, `org-${org.Id}-${intencion.id}`, `${intencion.codigo} · Pendiente de asignación`);
    });
  });
}
export type EtapaSeguimiento =
  | "Calidad"
  | "Logistica"
  | "Asignacion"
  | "Actividad de rescate en ejecucion"
  | "Seguimiento"
  | "Cierre";

export const ETAPAS_SEGUIMIENTO: EtapaSeguimiento[] = [
  "Calidad",
  "Logistica",
  "Asignacion",
  "Actividad de rescate en ejecucion",
  "Seguimiento",
  "Cierre",
];

export interface HitoTimeline {
  etapa: EtapaSeguimiento;
  completado: boolean;
  fecha?: string;
  responsable?: string;
  nota?: string;
}

export interface Organizacion {
  id: string;
  nombre: string;
  direccion: string;
  compatibilidad: string;
  asignacion: string; // donacion relacionada / codigo
  donacionId?: string;
  conformidadPorcentaje: number; // 0..100
  vencimientoProducto: string; // ISO date
  coordenadas: { x: number; y: number }; // coords 0..100 para SVG
  bapOrigen: { x: number; y: number };
  timeline: HitoTimeline[];
}

// Datos derivados de las donaciones (1 organizacion por donacion con organizacion)
export function organizacionesDesdeDonaciones(
  donaciones: Donacion[]
): Organizacion[] {
  return donaciones
    .filter((d) => !!d.organizacion)
    .map<Organizacion>((d, idx) => {
      const compatibilidad = d.organizacion?.compatibilidad ?? "Media";
      const conformidad =
        compatibilidad === "Alta"
          ? 95
          : compatibilidad === "Media"
          ? 78
          : compatibilidad === "Baja"
          ? 55
          : 30;

      // Pseudo-coordenadas estables segun id
      const seed = parseInt(d.id, 10) || idx + 1;
      const x = 18 + ((seed * 13) % 60);
      const y = 22 + ((seed * 7) % 55);

      const vencimiento = d.productos
        .map((p) => p.vidaUtil)
        .filter(Boolean)
        .sort()
        .reverse()[0];

      const etapasCumplidas = d.checklist.filter((c) => c.completado).length;

      const timeline: HitoTimeline[] = ETAPAS_SEGUIMIENTO.map(
        (etapa, i) => ({
          etapa,
          completado: i < Math.min(etapasCumplidas, ETAPAS_SEGUIMIENTO.length),
          fecha: i < etapasCumplidas ? d.checklist[i]?.fecha : undefined,
          responsable:
            i < etapasCumplidas
              ? d.checklist[i]?.responsable ?? d.responsable
              : undefined,
          nota:
            i === 0
              ? "Intencion registrada en el sistema."
              : i === 1
              ? "Calidad verificada y aptitud confirmada."
              : i === 2
              ? "Asignacion de organizacion beneficiaria."
              : i === 3
              ? "Rescate en ejecucion segun plan de logistica."
              : i === 4
              ? "Seguimiento de la entrega en curso."
              : "Cierre y reporte final.",
        })
      );

      return {
        id: `org-${d.id}`,
        nombre: d.organizacion?.nombre ?? "Sin organizacion",
        direccion: d.organizacion?.direccion ?? "-",
        compatibilidad,
        asignacion: d.codigo,
        donacionId: d.id,
        conformidadPorcentaje: conformidad,
        vencimientoProducto: vencimiento ?? "",
        coordenadas: { x, y },
        bapOrigen: { x: 12, y: 78 },
        timeline,
      };
    });
}



