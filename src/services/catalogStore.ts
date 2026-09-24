import { useSyncExternalStore } from "react";
import { fetchCatalogs } from "./catalogService";
import { loginUser } from "./authService";

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
      // 1. Authenticate with the credentials from environment variables
      await loginUser(
        import.meta.env.VITE_AUTH_LOGIN,
        import.meta.env.VITE_AUTH_PASSWORD
      );
      console.log("Autenticación exitosa");

      // 2. Fetch the catalogs
      const data = await fetchCatalogs();
      console.log("Datos recibidos de la API:", data);

      // Mapping the API response to our state.
      state = {
        ...state,
        canales: data.channels || [],
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
