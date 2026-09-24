
const apiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = apiUrl;

export type LoginUser = {
  publicId: string;
  username: string;
  fullName: string;
  email: string;
};

export type LoginData = {
  token: string;
  expiresAt: string;
  user: LoginUser;
};

export type LoginResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: LoginData | null;
  errors: unknown;
  timestamp: string;
};

export type AuthenticatedLoginResponse = LoginResponse & {
  data: LoginData;
};

export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export async function loginUser(
  login: string,
  password: string
): Promise<AuthenticatedLoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        login: login,
        username: login,
        password: password
      }),
    });
  } catch (err) {
    throw new Error(
      "No se pudo conectar con la API. Verifique su conexión o el estado del servidor."
    );
  }

  const result = await response.json().catch(() => {
    return {
      success: false,
      message: "La respuesta del servidor no es un JSON válido.",
    };
  }) as LoginResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "No se pudo iniciar sesion");
  }

  // Búsqueda flexible de token
  let token = null;
  if (result.data) {
    const keys = Object.keys(result.data);
    const tokenKey = keys.find(k =>
      k.toLowerCase().includes('token') ||
      k.toLowerCase().includes('jwt') ||
      k.toLowerCase().includes('access')
    );
    if (tokenKey) token = (result.data as any)[tokenKey];
  }

  if (!token && result.token) token = result.token;

  // FALLBACK GLOBAL PARA CUALQUIER AMBIENTE DE BAP (PRUEBAS O PRODUCCIÓN)
  // Si el servidor responde éxito pero no envía token, es probable que use cookies.
  if (!token && (API_BASE_URL.includes("bap.net.pe"))) {
    console.warn("Token no encontrado en respuesta, usando FALLBACK para permitir flujo basado en cookies.");
    token = "BAP_SESSION_COOKIE_ACTIVE";
  }

  if (!token) {
    throw new Error("El servidor no proporcionó un token de acceso válido.");
  }

  setToken(token);

  return {
    ...result,
    data: {
      ...result.data,
      token: token
    } as LoginData,
  };
}
