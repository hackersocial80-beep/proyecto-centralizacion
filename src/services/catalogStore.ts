import { useSyncExternalStore } from "react";
import { fetchCatalogs, fetchSuppliers } from "./catalogService";

interface CatalogItem {
  id: string;
  name: string;
}
interface CatalogState {
  proveedores: CatalogItem[];
  canales: CatalogItem[];
  tiposIntencion: CatalogItem[];
  tiposProducto: CatalogItem[];
  procedencias: CatalogItem[];
  unidades: CatalogItem[];
  tipoLugar: CatalogItem[];
  distritos: string[];
  provincias: string[];
  departamentos: string[];
  tipoAcceso: CatalogItem[];
  anticipacion: CatalogItem[];
  motivosDonacion:CatalogItem[];
  condicionAlmacenamiento:CatalogItem[];
  compromisosIdoneidad:CatalogItem[];
  condicionesProducto:CatalogItem[];
  responsables: string[];
  isLoading: boolean;
  error: string | null;
}

const normalizeChannels = (items: any[] = []): CatalogItem[] =>
  items.map((item) => {
    if (typeof item === "string" || typeof item === "number") {
      const value = String(item);
      return { id: value, name: value };
    }

    const id = item.channelId ?? item.channelID ?? item.canalId ?? item.idCanal ?? item.id ?? item.code ?? item.channelCode ?? item.value;
    const name = item.channelName ?? item.nombreCanal ?? item.name ?? item.canal ?? item.channel ?? item.label ?? item.description ?? item.descripcion;
    return {
      id: String(id ?? name ?? ""),
      name: String(name ?? id ?? ""),
    };
  }).filter((item) => item.id !== "" && item.name !== "");

const normalizeCatalogItems = (items: any[] = []): CatalogItem[] =>
  items.map((item) => {
    if (typeof item === "string" || typeof item === "number") {
      const value = String(item);
      return { id: value, name: value };
    }
    if (!item || typeof item !== "object") return { id: "", name: "" };

    const entries = Object.entries(item);
    const idEntry = entries.find(([key]) => ["id", "code"].includes(key.toLowerCase()))
      ?? entries.find(([key]) => /(?:id|code)$/i.test(key))
      ?? entries.find(([key]) => key.toLowerCase() === "value");
    const nameEntry = entries.find(([key]) => /(?:name|nombre|label|description|descripcion|title|type|origin|unit|channel|intention|reason|condition)$/i.test(key));
    const id = idEntry?.[1] ?? nameEntry?.[1] ?? "";
    const name = nameEntry?.[1] ?? id;
    return { id: String(id), name: String(name) };
  }).filter((item) => item.id !== "" && item.name !== "");

const normalizePlaceTypes = (items: any[] = []): CatalogItem[] =>
  items.map((item) => {
    if (typeof item === "string" || typeof item === "number") {
      const value = String(item);
      return { id: "", name: value };
    }
    const id = item?.placeTypeId ?? item?.placeTypeID ?? item?.idPlaceType ?? item?.typePlaceId ?? item?.idTypePlace ?? item?.placeTypeCode ?? item?.id ?? item?.code ?? item?.value;
    const name = item?.placeTypeName ?? item?.placeType ?? item?.typePlaceName ?? item?.typePlace ?? item?.name ?? item?.description ?? item?.descripcion ?? item?.label ?? item?.value;
    return { id: String(id ?? ""), name: String(name ?? "") };
  }).filter((item) => item.id !== "" && item.name !== "");

const normalizeAccessTypes = (items: any[] = []): CatalogItem[] =>
  items.map((item) => {
    if (typeof item === "string" || typeof item === "number") {
      const value = String(item);
      return { id: "", name: value };
    }
    const id = item?.accessTypeId ?? item?.accessTypeID ?? item?.accesTypeId ?? item?.accesTypeID ?? item?.idAccessType ?? item?.idAccesType ?? item?.id ?? item?.code ?? item?.value;
    const name = item?.accessTypeName ?? item?.accesTypeName ?? item?.accessType ?? item?.accesType ?? item?.name ?? item?.description ?? item?.descripcion ?? item?.label ?? item?.value;
    return { id: String(id ?? ""), name: String(name ?? "") };
  }).filter((item) => item.id !== "" && item.name !== "");

const normalizeAnticipationTimes = (items: any[] = []): CatalogItem[] =>
  items.map((item) => {
    if (typeof item === "string" || typeof item === "number") {
      const value = String(item);
      return { id: value, name: value };
    }
    const id = item?.anticipationTimeId ?? item?.anticipationTimeID ?? item?.anticipationId ?? item?.idAnticipationTime ?? item?.id ?? item?.code ?? item?.value;
    const name = item?.anticipationTimeName ?? item?.anticipationName ?? item?.timeName ?? item?.name ?? item?.description ?? item?.descripcion ?? item?.label ?? item?.anticipationTime;
    return { id: String(id ?? ""), name: String(name ?? id ?? "") };
  }).filter((item) => item.id !== "" && item.name !== "");
const initialState: CatalogState = {
  proveedores: [],
  canales: [],
  tiposIntencion: [],
  tiposProducto: [],
  procedencias: [],
  unidades: [],
  tipoLugar: [],
  distritos: [],
  provincias: [],
  departamentos: [],
  tipoAcceso: [],
  anticipacion: [],
  motivosDonacion:[],
  condicionAlmacenamiento:[],
  compromisosIdoneidad:[],
  condicionesProducto:[],
  responsables: [],
  isLoading: false,
  error: null,
};

let listeners = new Set<() => void>();
let state: CatalogState = { ...initialState };

const emit = () => listeners.forEach((l) => l());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

export const catalogStore = {
  subscribe,
  getSnapshot,
  getState: () => state,
  async loadCatalogs() {
    state = { ...state, isLoading: true, error: null };
    emit();

    try {
      console.log("Iniciando carga de catálogos...");
      // Reuse the session established by the login screen.
      // Do not attempt a second login with optional build-time credentials.
      const [data, suppliers] = await Promise.all([
        fetchCatalogs(),
        fetchSuppliers().catch((error) => {
          console.error("Error cargando donantes:", error);
          return [];
        }),
      ]);
      console.log("Datos recibidos de la API:", data);

      // Mapping the API response to our state.
      state = {
        ...state,
        proveedores: normalizeCatalogItems(suppliers),
        canales: normalizeChannels(data.channels || []),
        tiposIntencion: normalizeCatalogItems(data.intentionTypes || []),
        tiposProducto: normalizeCatalogItems(data.productTypes || []),
        procedencias: normalizeCatalogItems(data.originType || []),
        unidades: normalizeCatalogItems(data.unidades || data.units || []),
        tipoLugar: normalizePlaceTypes(data.placeTypes || []),
        distritos: data.distritos || [],
        provincias: data.provincias || [],
        departamentos: data.departamentos || [],
        tipoAcceso: normalizeAccessTypes(data.accessTypes || data.accesTypes || []),
        anticipacion: normalizeAnticipationTimes(data.anticipationTimes || data.anticipationTime || data.anticipacion || data.anticipation || []),
        motivosDonacion: normalizeCatalogItems(data.donationsReason || []),
        condicionAlmacenamiento: normalizeCatalogItems(data.storageConditions || []),
        compromisosIdoneidad:data.intentionTypes|| [],
        isLoading: false,
      };
    } catch (e: any) {
      console.error("Error cargando catálogos:", e);
      state = {
        ...state,
        isLoading: false,
        error: e.message || "Error loading catalogs",
      };
    }
    emit();
  },
};

export function useCatalogs(): CatalogState {
  return useSyncExternalStore(
    catalogStore.subscribe,
    catalogStore.getSnapshot,
    catalogStore.getSnapshot
  );
}
