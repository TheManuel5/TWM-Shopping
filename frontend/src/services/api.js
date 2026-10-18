// URL base de tu API Backend en .NET (ajustado al puerto de tu terminal)
const API_BASE_URL = 'http://localhost:5156/api';

// Función genérica para manejar peticiones HTTP
export async function fetchApi(endpoint, options = {}) {
  const token = window.localStorage.getItem('shopping-user-session')
    ? JSON.parse(window.localStorage.getItem('shopping-user-session')).token
    : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error en la petición: ${response.statusText}`);
    }

    // Si la respuesta es vacía (ej. DELETE), retornamos null
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`Error consultando a la API en ${endpoint}:`, error);
    throw error;
  }
}

// Servicios específicos organizados por módulos de negocio
export const apiService = {
  // --- 1. CATÁLOGO UNIFICADO (Conectado y Funcional) ---
  // Llama a fn_catalogo_unificado() en PostgreSQL a través de .NET
  getCatalogo: (query = '') => {
    const url = query ? `/catalogo?q=${query}` : '/catalogo';
    return fetchApi(url);
  },

  // --- 2. AUTENTICACIÓN Y USUARIOS (Para implementar luego) ---
  login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  
  // --- 3. CARRITO Y ÓRDENES (RF12 / RF15 - Para implementar luego) ---
  createOrder: (orderData) => fetchApi('/ventas/checkout', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrderTracking: (orderId) => fetchApi(`/ventas/${orderId}/seguimiento`),

  // --- 4. COTIZACIONES (RF22 - Para implementar luego) ---
  getQuotes: () => fetchApi('/cotizaciones'),
  createQuote: (quoteData) => fetchApi('/cotizaciones', { method: 'POST', body: JSON.stringify(quoteData) }),

  // --- 4. MÓDULO ANALÍTICO ---
  runReport: (queryId) => fetchApi(`/reportes/ejecutar/${queryId}`),
};