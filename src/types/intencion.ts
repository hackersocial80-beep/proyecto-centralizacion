// Tipos y constantes del modulo de Intencion
// Sistema de centralizacion - Banco de Alimentos Peru

export type Canal =
  | "WhatsApp"
  | "Correo electronico"
  | "Telefono"
  | "Presencial"
  | "Redes sociales"
  | "Web";

export type TipoIntencion =
  | "Donacion"
  | "Compra"
  | "Canje"
  | "Convenio";

export type EstadoIntencion =
  | "Pendiente"
  | "En evaluacion"
  | "Aprobada"
  | "Rechazada";

export type TipoProducto =
  | "No perecible"
  | "Perecible"
  | "Fruta/Verdura"
  | "Lacteo"
  | "Carne"
  | "Panaderia"
  | "Bebida"
  | "Insumo";

export type Procedencia =
  | "Nacional"
  | "Importado"
  | "Donacion externa"
  | "Produccion propia"
  | "Socio estrategico";

export type UnidadMedida =
  | "kg"
  | "g"
  | "L"
  | "ml"
  | "unidad"
  | "caja"
  | "saco"
  | "pack";

export type CentroAcopio =
  | "Lima Central"
  | "Ate"
  | "Callao"
  | "San Juan de Lurigancho"
  | "Trujillo"
  | "Arequipa";

export type MotivoDonacion =
  | "Vencimiento proximo"
  | "Excedente de produccion"
  | "Campana solidaria"
  | "Aliado estrategico"
  | "Voluntariado corporativo";

  export type TipoLugar =
  | "Planta de produccion"
  | "Centro de acopio";

export type Distrito =
  | "Cercado de Lima"
  | "Los Olivos"
  | "Comas"
  | "Lince";
  export type Provincia =
  | "Canta"
  | "Huarochiri"
  | "Carhuaz"
  | "Huantac"
  | "Huanta";
  export type Departamento =
  | "Piura"
  | "Callao"
  | "Chiclayo"
  | "Lima";

  export type TipoAcceso =
  | "Vehicular"
  | "Peatonal";

  export type DiasAtencion =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

  export type Anticipacion =
  | "72 horas"
  | "48 horas"
  | "24 horas"
  | "12 horas"
  | "6 horas";
  
export interface ProductoIntencion {
  id: string;
  producto: string;
  descripcion: string;
  cantidad: number;
  unidad: UnidadMedida;
  pesoEstimadoKg: number;
  vidaUtil: string; // ISO date
  tipoProducto: TipoProducto;
  procedencia: Procedencia;
  // Información del lugar de recojo
  tipoLugar: TipoLugar;
  lugar: string;
  contactoPlanta: string;
  direccion: string;
  referencia: string;
  distrito: Distrito;
  provincia: Provincia;
  departamento: Departamento;
  codigoPostal: string;
  // Accesos y requisitos de recojo
  tipoAcceso: TipoAcceso;
  horarioInicio: string;
  horarioFinal: string;
  diasAtencion: DiasAtencion[];
  requiereAutorizacion: "Si" | "No";
  anticipacion: Anticipacion;
  contactoAutorizacion: string;
  numeroContacto: string;
  requisitosIngreso: string[];
  // Disponibilidad para recojo
  fechaDesde: string;
  fechaHasta: string;
  horarioDisponible: string;
  tiempoEstimadoCarga: string;
  // Ubicacion en mapa
  latitud: string;
  longitud: string;
  // Observaciones de accesos
  observacionesAcceso: string;
}

export interface DocumentoAdjunto {
  id: string;
  nombre: string;
  tipo: string; // mime
  tamanoKb: number;
  url: string; // objectURL temporal
}

export interface FotoAdjunta {
  id: string;
  nombre: string;
  url: string; // objectURL
}

export interface Intencion {
  id: string;
  codigo: string; // INT-2026-0001
  donante: string;
  contacto: string;
  fechaIntencion: string; // ISO
  canal: Canal;
  responsable: string;
  tipoIntencion: TipoIntencion;
  estado: EstadoIntencion;
  productos: ProductoIntencion[];
  motivoDonacion?: MotivoDonacion;
  centroAcopio?: CentroAcopio;
  declaracionProducto?: string;
  documentos: DocumentoAdjunto[];
  fotos: FotoAdjunta[];
  createdAt: string;
}

export interface FiltrosIntencion {
  donante: string;
  contacto: string;
  fechaIntencion: string;
  canal: Canal | "";
  responsable: string;
  tipoIntencion: TipoIntencion | "";
}

// Catálogos (luego pueden venir de la API)
export const CANALES: Canal[] = [
  "WhatsApp",
  "Correo electronico",
  "Telefono",
  "Presencial",
  "Redes sociales",
  "Web",
];

export const TIPOS_INTENCION: TipoIntencion[] = [
  "Donacion",
  "Compra",
  "Canje",
  "Convenio",
];

export const TIPOS_PRODUCTO: TipoProducto[] = [
  "No perecible",
  "Perecible",
  "Fruta/Verdura",
  "Lacteo",
  "Carne",
  "Panaderia",
  "Bebida",
  "Insumo",
];

export const PROCEDENCIAS: Procedencia[] = [
  "Nacional",
  "Importado",
  "Donacion externa",
  "Produccion propia",
  "Socio estrategico",
];

export const UNIDADES: UnidadMedida[] = [
  "kg",
  "g",
  "L",
  "ml",
  "unidad",
  "caja",
  "saco",
  "pack",
];
export const TIPOLUGAR: TipoLugar[] = [
  "Planta de produccion",
  "Centro de acopio",
];
export const CENTROS_ACOPIO: CentroAcopio[] = [
  "Lima Central",
  "Ate",
  "Callao",
  "San Juan de Lurigancho",
  "Trujillo",
  "Arequipa",
];

export const MOTIVOS_DONACION: MotivoDonacion[] = [
  "Vencimiento proximo",
  "Excedente de produccion",
  "Campana solidaria",
  "Aliado estrategico",
  "Voluntariado corporativo",
];

export const RESPONSABLES = [
  "Maria Lopez",
  "Carlos Mendoza",
  "Ana Torres",
  "Jorge Ramirez",
  "Lucia Fernandez",
  "Pedro Sanchez",
];

export const FILTROS_VACIOS: FiltrosIntencion = {
  donante: "",
  contacto: "",
  fechaIntencion: "",
  canal: "",
  responsable: "",
  tipoIntencion: "",
};
export const DISTRITO: Distrito[] = [
  "Cercado de Lima",
  "Los Olivos",
  "Comas",
  "Lince",
];export const PROVINCIA: Provincia[] = [
  "Canta",
  "Huarochiri",
  "Carhuaz",
  "Huantac",
  "Huanta",
];export const DEPARTAMENTO: Departamento[] = [
  "Piura",
  "Callao",
  "Chiclayo",
  "Lima",
];
export const TIPOACCESO: TipoAcceso[] = [
  "Vehicular",
  "Peatonal",
];
export const DIAATENCION: DiasAtencion[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
export const ANTICIPACION: Anticipacion[] = [
  "72 horas",
  "48 horas",
  "24 horas",
  "12 horas",
  "6 horas",
];