
const apiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = apiUrl;

export type LoginUser = {
  publicId: string;
  username: string;
  fullName: string;
  email: string;
};

export type LoginData = {
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
      body: JSON.stringify({ login, password }),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con la API. Reinicia npm run dev para activar el proxy local."
    );
  }

  const result = (await response.json()) as LoginResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "No se pudo iniciar sesion.");
  }

  return {
    ...result,
    data: result.data,
  };
}
