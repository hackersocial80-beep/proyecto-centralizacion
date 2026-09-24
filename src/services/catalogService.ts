import { getToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface CatalogResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
  errors: unknown;
  timestamp: string;
}

async function safeFetch(url: string, useToken = true) {
  const token = getToken();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(useToken && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!response.ok && response.status !== 401) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText || "Error en la petición"}`);
  }
  return response;
}

export async function fetchCatalogs(): Promise<any> {
  let response = await safeFetch(`${API_BASE_URL}/Commons/catalogs`);

  if (response.status === 401) {
    console.warn("Intento con token falló (401), probando acceso público...");
    response = await safeFetch(`${API_BASE_URL}/Commons/catalogs`, false);
  }

  if (!response.ok) {
    throw new Error("No se pudieron obtener los catálogos.");
  }

  const text = await response.text();
  const result = JSON.parse(text) as CatalogResponse;
  return result.success ? result.data : null;
}

export async function fetchDepartments(): Promise<any[]> {
  try {
    let response = await safeFetch(`${API_BASE_URL}/Commons/ubigeo/departments`);
    if (response.status === 401) response = await safeFetch(`${API_BASE_URL}/Commons/ubigeo/departments`, false);

    const text = await response.text();
    const result = JSON.parse(text) as CatalogResponse;
    return result.success ? result.data : [];
  } catch (e) {
    console.error("Error fetching departments:", e);
    return [];
  }
}

export async function fetchProvinces(deptCode: string): Promise<any[]> {
  try {
    let response = await safeFetch(`${API_BASE_URL}/Commons/ubigeo/provinces?departmentCode=${deptCode}`);
    if (response.status === 401) response = await safeFetch(`${API_BASE_URL}/Commons/ubigeo/provinces?departmentCode=${deptCode}`, false);

    const text = await response.text();
    const result = JSON.parse(text) as CatalogResponse;
    return result.success ? result.data : [];
  } catch (e) {
    console.error("Error fetching provinces:", e);
    return [];
  }
}

export async function fetchDistricts(provCode: string): Promise<any[]> {
  try {
    let response = await safeFetch(`${API_BASE_URL}/Commons/ubigeo/districts?provinceCode=${provCode}`);
    if (response.status === 401) response = await safeFetch(`${API_BASE_URL}/Commons/ubigeo/districts?provinceCode=${provCode}`, false);

    const text = await response.text();
    const result = JSON.parse(text) as CatalogResponse;
    return result.success ? result.data : [];
  } catch (e) {
    console.error("Error fetching districts:", e);
    return [];
  }
}
