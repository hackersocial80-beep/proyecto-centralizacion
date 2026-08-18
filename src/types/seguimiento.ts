// Tipos del modulo de Seguimiento.
// Las organizaciones se derivan de las donaciones que ya tienen una
// organizacion asignada. La timeline sigue las 6 fases operativas.

import type { Donacion } from "./donacion";

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
