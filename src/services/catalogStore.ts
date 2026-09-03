import { useSyncExternalStore } from "react";
import { fetchCatalogs } from "./catalogService";
import { loginUser } from "./authService";

interface CatalogItem {
  id: string;
  name: string;
}
interface CatalogState {
  canales: CatalogItem[];
  tiposIntencion: string[];
  tiposProducto: CatalogItem[];
  procedencias: string[];
  unidades: string[];
  tipoLugar: string[];
  distritos: string[];
  provincias: string[];
  departamentos: string[];
  tipoAcceso: CatalogItem[];
  anticipacion: string[];
  isLoading: boolean;
  error: string | null;
}

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
      // 1. Authenticate with the specific credentials provided by the user
      await loginUser("wolf@bap.com.pe", "banc36");
      console.log("Autenticación exitosa");

      // 2. Fetch the catalogs
      const data = await fetchCatalogs();
      console.log("Datos recibidos de la API:", data);

      // Mapping the API response to our state.
      state = {
        ...state,
        canales: data.origins || [],
        tiposIntencion: data.tiposIntencion || [],
        tiposProducto: data.productTypes || [],
        procedencias: data.procedencias || [],
        unidades: data.unidades || [],
        tipoLugar: data.tipoLugar || [],
        distritos: data.distritos || [],
        provincias: data.provincias || [],
        departamentos: data.departamentos || [],
        tipoAcceso: data.accessTypes || [],
        anticipacion: data.anticipacion || [],
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
