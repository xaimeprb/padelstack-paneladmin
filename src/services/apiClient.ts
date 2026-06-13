import { auth } from "./firebase";

const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

export const apiBaseUrl = rawApiBaseUrl.replace(/\/api\/v1\/?$/i, "");
export const apiRootUrl = apiBaseUrl ? `${apiBaseUrl}${API_PREFIX}` : "";

export function hasApiBaseUrl() {
  return apiBaseUrl.length > 0;
}

function normalizeApiPath(path: string) {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  const withoutPrefix = withSlash.replace(/^\/api\/v1(?=\/|$)/i, "");
  return withoutPrefix || "/";
}

function buildApiUrl(path: string) {
  return `${apiRootUrl}${normalizeApiPath(path)}`;
}

async function parseError(response: Response) {
  try {
    const payload = await response.json();
    return payload?.message ?? payload?.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!hasApiBaseUrl()) {
    throw new ApiError("La URL de la API no esta configurada.", 0);
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new ApiError("Sesion no valida.", 401);
  }

  const token = await currentUser.getIdToken();
  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  } catch (error) {
    console.error("[PADELSTACK Admin] API request failed", error);
    throw new ApiError("No se pudo conectar con la API. Comprueba la conexion o intentalo de nuevo.", 0);
  }

  if (!response.ok) {
    const message = await parseError(response);
    if (response.status === 401) {
      throw new ApiError(message || "Sesion no autorizada. Vuelve a iniciar sesion.", response.status);
    }
    if (response.status === 403) {
      throw new ApiError(message || "No tienes permisos para realizar esta accion.", response.status);
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
