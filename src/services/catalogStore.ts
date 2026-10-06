import { useSyncExternalStore } from "react";
import { fetchCatalogs } from "./catalogService";

interface CatalogItem {
  id: string;
  name: string;
}
interface CatalogState {
  canales: CatalogItem[];
  tiposIntencion: CatalogItem[];
  tiposProducto: CatalogItem[];
  procedencias: CatalogItem[];
  unidades: string[];
  tipoLugar: CatalogItem[];
  distritos: string[];
  provincias: string[];
  departamentos: string[];
  tipoAcceso: CatalogItem[];
  anticipacion: string[];
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
const initialState: CatalogState = {
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
      const data = await fetchCatalogs();
      console.log("Datos recibidos de la API:", data);

      // Mapping the API response to our state.
      state = {
        ...state,
        canales: normalizeChannels(data.channels || []),
        tiposIntencion: data.intentionTypes || [],
        tiposProducto: data.productTypes || [],
        procedencias: data.originType || [],
        unidades: data.unidades || [],
        tipoLugar: data.placeTypes || [],
        distritos: data.distritos || [],
        provincias: data.provincias || [],
        departamentos: data.departamentos || [],
        tipoAcceso: data.accessTypes || [],
        anticipacion: data.anticipacion || [],
        motivosDonacion: data.donationsReason || [],
        condicionAlmacenamiento:data.storageConditions|| [],
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
