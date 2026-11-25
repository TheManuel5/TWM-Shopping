const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

type Resource = 'conversaciones' | 'mensajes' | 'pedidos' | 'tarifas';

type Result<T> = {
    revision: number;
    items: T[];
};

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!baseUrl) {
        throw new Error('Configura EXPO_PUBLIC_API_URL en mobile/.env.local.');
    }

    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        credentials: 'include',
    });

    if (response.status === 401) {
        throw new Error('Inicia sesión en Shopping desde esta aplicación.');
    }
    if (response.status === 403) {
        throw new Error('Tu cuenta no tiene permiso para esta acción.');
    }
    if (response.status === 409) {
        throw new Error('Los datos cambiaron. Vuelve a cargar la pantalla e inténtalo otra vez.');
    }

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? `La API respondió ${response.status}.`);
    }

    return response.json();
}

export function list<T>(resource: Resource) {
    return request<Result<T>>(`/${resource}`);
}

export function save(
    resource: Resource,
    revision: number,
    body: object,
    id?: string,
) {
    const path = `/${resource}${id === undefined ? '' : `/${encodeURIComponent(id)}`}`;
    return request<unknown>(path, {
        method: id === undefined ? 'POST' : 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'If-Match': String(revision),
        },
        body: JSON.stringify(body),
    });
}

export function deleteRate(id: string | number, revision: number) {
    return request<unknown>(`/tarifas/${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
        headers: {
            'If-Match': String(revision),
        },
    });
}

export type Profile = { rut: string; canSell: boolean };

export type Order = {
    id: string;
    customerRut: string;
    sellerRut: string;
    customer: string;
    date: string;
    status: string;
    total: number;
    dispatch: { carrier: string; tracking: string; status: string } | null;
};