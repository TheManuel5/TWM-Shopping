import { Platform } from 'react-native';
import type {
  CatalogItem,
  ManagedCompany,
  ManagedUser,
  StateCollections,
  StateSnapshot,
  UserProfile,
} from './types';

const envBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? '';
let runtimeBaseUrl = envBaseUrl || (Platform.OS === 'web' ? 'http://localhost:5156/api' : '');

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  return runtimeBaseUrl;
}

export function setApiBaseUrl(url: string): string {
  runtimeBaseUrl = url.trim().replace(/\/+$/, '');
  return runtimeBaseUrl;
}

export function resolveImageUri(src: string | undefined | null): string | undefined {
  if (!src || src.includes('/catalog/placeholder.svg')) return undefined;
  if (/^(https?:|data:|file:|content:)/i.test(src)) return src;
  if (!runtimeBaseUrl) return undefined;
  const origin = runtimeBaseUrl.replace(/\/api$/i, '');
  return `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
}

function requireBaseUrl(): string {
  if (!runtimeBaseUrl) {
    throw new ApiError(
      'Configura EXPO_PUBLIC_API_URL en mobile/.env.local (ej: http://192.168.1.X:5156/api) o ingrésala en Ajustes de API.',
      0,
    );
  }
  return runtimeBaseUrl;
}

async function parseError(response: Response): Promise<ApiError> {
  if (response.status === 401) {
    return new ApiError('Inicia sesión para continuar en Shopping.', 401);
  }
  if (response.status === 403) {
    return new ApiError('Tu cuenta no tiene permisos para realizar esta acción.', 403);
  }
  if (response.status === 409) {
    return new ApiError(
      'Los datos cambiaron en el servidor. Recarga la pantalla e inténtalo otra vez.',
      409,
    );
  }
  if (response.status === 429) {
    return new ApiError('Demasiados intentos seguidos. Espera un momento e intenta de nuevo.', 429);
  }

  const body = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;

  const fieldErrors = body?.errors ? Object.values(body.errors).flat().join(' ') : '';
  const message = body?.message || fieldErrors || `La API respondió ${response.status}.`;
  return new ApiError(message, response.status);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = requireBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      signal: options.signal ?? controller.signal,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con la API. Verifica la IP local del servidor y que el backend esté activo.',
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getSessionProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/me');
}

export function loginWithRut(
  rut: string,
  password: string,
  remember = true,
): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ rut, password, remember }),
  });
}

export function logoutSession(): Promise<void> {
  return apiRequest<void>('/auth/logout', { method: 'POST' });
}

export function fetchStateSnapshot(): Promise<StateSnapshot> {
  return apiRequest<StateSnapshot>('/state');
}

export function commitDelta(
  revision: number,
  changes: Partial<StateCollections>,
  deleted?: Partial<Record<keyof StateCollections, string[]>>,
): Promise<StateSnapshot> {
  return apiRequest<StateSnapshot>('/state/transaction', {
    method: 'PUT',
    body: JSON.stringify({
      revision,
      changes,
      delta: true,
      ...(deleted ? { deleted } : {}),
    }),
  });
}

export function saveCatalogItem(revision: number, item: CatalogItem): Promise<StateSnapshot> {
  return commitDelta(revision, { catalog: [item] });
}

export function deleteCatalogItem(revision: number, id: string): Promise<StateSnapshot> {
  return commitDelta(revision, { catalog: [] }, { catalog: [id] });
}

export function saveUserRecord(revision: number, user: ManagedUser): Promise<StateSnapshot> {
  return commitDelta(revision, { users: [user] });
}

export function deleteUserRecord(revision: number, id: string): Promise<StateSnapshot> {
  return commitDelta(revision, { users: [] }, { users: [id] });
}

export function resetUserPassword(rut: string, next: string): Promise<void> {
  return apiRequest<void>(`/admin/database/accounts/${encodeURIComponent(rut)}/password`, {
    method: 'PUT',
    body: JSON.stringify({ next }),
  });
}

export function saveCompanyRecord(
  revision: number,
  company: ManagedCompany,
): Promise<StateSnapshot> {
  return commitDelta(revision, { companies: [company] });
}

export function deleteCompanyRecord(revision: number, id: string): Promise<StateSnapshot> {
  return commitDelta(revision, { companies: [] }, { companies: [id] });
}
