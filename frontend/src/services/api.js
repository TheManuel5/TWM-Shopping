export const API_MODE = import.meta.env.PROD || import.meta.env.VITE_DATA_MODE !== 'demo'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5156/api'
export async function fetchApi(endpoint, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: 'include', ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }, signal: options.signal || AbortSignal.timeout(60000) })
  } catch { throw new Error('No se pudo conectar con la API. Comprueba la dirección configurada y que el servidor esté ejecutándose.') }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const error = new Error(data.message || Object.values(data.errors || {}).flat().join(' ') || `La API respondió ${response.status}.`)
    error.status = response.status
    throw error
  }
  return response.status === 204 ? null : response.json()
}
export const apiService = {
  getState: () => fetchApi('/state'),
  commit: (changes, revision, delta = false, deleted = {}) => fetchApi('/state/transaction', { method: 'PUT', body: JSON.stringify({ changes, revision, delta, deleted }) }),
  login: credentials => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: values => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(values) }),
  me: () => fetchApi('/auth/me'),
  logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  changePassword: values => fetchApi('/auth/password', { method: 'PUT', body: JSON.stringify(values) }),
  preview: values => fetchApi('/ventas/preview', { method: 'POST', body: JSON.stringify(values) }),
  checkout: values => fetchApi('/ventas/checkout', { method: 'POST', body: JSON.stringify(values) }),
}
