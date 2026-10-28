import { getToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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

export async function fetchSuppliers(searchTerm = ""): Promise<any[]> {
  const query = searchTerm.trim()
    ? `?search=${encodeURIComponent(searchTerm.trim())}`
    : "";
  const url = `${API_BASE_URL}/Commons/suppliers${query}`;
  let response = await safeFetch(url);
  if (response.status === 401) {
    response = await safeFetch(url, false);
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText || "No se pudieron obtener los donantes."}`);
  }

  const result = await response.json();
  if (Array.isArray(result)) return result;
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.suppliers)) return data.suppliers;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(result?.suppliers)) return result.suppliers;
  return [];
}

export interface CreateSupplierInput {
  supplierType: string;
  commercialName: string;
  supplierName: string;
  companyType: string;
  supplierRuc: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
  website: string;
  sectorActivity: string;
  statusCode: string;
  observations: string;
  contacts: Array<{
    contactType: "Principal" | "Secundario";
    fullName: string;
    position: string;
    email: string;
    mobilePhone: string;
    landline: string;
    whatsapp: string;
    responsibilities: string;
  }>;
  addresses: Array<{
    typeAddressId: string;
    addressName: string;
    description: string;
    departmentCode: string;
    provinceCode: string;
    districtCode: string;
    address: string;
    reference: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    accessTypeId: string;
    plantHoursFrom: string;
    plantHoursTo: string;
    attentionDays: string[];
    requiresAuthorization: boolean;
    leadTimeId: string;
    entryRequirements: string[];
    pickupWindowFrom: string;
    pickupWindowTo: string;
    estimatedLoadingTime: string;
    siteContactName: string;
    authorizationContactName: string;
    authorizationContactPhone: string;
    accessObservations: string;
  }>;
}

export async function createSupplier(input: CreateSupplierInput) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/Commons/suppliers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const responseText = await response.text();
  let result: any = null;
  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    result = responseText;
  }

  if (!response.ok || result?.success === false) {
    const message = typeof result === "string"
      ? result
      : result?.message || result?.title || `Error ${response.status} al registrar el donante.`;
    throw new Error(message);
  }
  return result?.data ?? result;
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
