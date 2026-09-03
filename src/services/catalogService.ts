const apiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = apiUrl;

import { getToken } from "./authService";

export interface CatalogResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
  errors: unknown;
  timestamp: string;
}

export async function fetchCatalogs(): Promise<any> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/Commons/catalogs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });

  const result = (await response.json()) as CatalogResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "No se pudieron obtener los catálogos.");
  }

  return result.data;
}
