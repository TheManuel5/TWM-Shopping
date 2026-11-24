import Constants from "expo-constants";
import { Platform } from "react-native";
import type { Snapshot } from "./types";

// Adaptador del catálogo: Samuel puede registrar aquí su cliente común sin cambiar las pantallas.
export type CatalogTransport = <T>(
  path: string,
  options?: RequestInit,
) => Promise<T>;
const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];
export const apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL ||
  `http://${Platform.OS === "web" ? "localhost" : metroHost || "10.0.2.2"}:5156/api`
).replace(/\/$/, "");
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
const defaultTransport: CatalogTransport = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: "include",
      signal: options?.signal || controller.signal,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new ApiError(
        body.message || `La solicitud falló (${response.status}).`,
        response.status,
      );
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "No pudimos conectar con la tienda. Comprueba tu conexión y vuelve a intentarlo.",
    );
  } finally {
    clearTimeout(timeout);
  }
};
let transport: CatalogTransport = defaultTransport;
export function configureCatalogTransport(client: CatalogTransport) {
  transport = client;
}
export async function readCatalog(): Promise<Snapshot> {
  const state = await transport<Snapshot>("/state");
  if (
    !Array.isArray(state.collections?.catalog) ||
    !state.collections?.categories
  ) {
    throw new ApiError("El servidor devolvió un catálogo incompleto.");
  }
  return state;
}
export const writeFeedback = (
  revision: number,
  key: string,
  row: Record<string, unknown>,
) =>
  transport<Snapshot>("/state/transaction", {
    method: "PUT",
    body: JSON.stringify({ revision, delta: true, changes: { [key]: [row] } }),
  });
