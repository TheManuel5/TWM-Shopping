import { hashForTransport } from '../utils/authHash'

export const API_MODE = import.meta.env.PROD || import.meta.env.VITE_DATA_MODE !== 'demo'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5156/api'
const CONNECTION_ERROR = 'No se pudo conectar con la API. Comprueba la dirección configurada y que el servidor esté ejecutándose.'

async function toError(response) {
  const data = await response.json().catch(() => ({}))
  const error = new Error(data.message || Object.values(data.errors || {}).flat().join(' ') || `La API respondió ${response.status}.`)
  error.status = response.status
  return error
}

export async function fetchApi(endpoint, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: options.signal || AbortSignal.timeout(60000),
    })
  } catch { throw new Error(CONNECTION_ERROR) }
  if (!response.ok) throw await toError(response)
  return response.status === 204 ? null : response.json()
}

/**
 * Descarga JSON informando el avance real.
 * onProgress recibe { phase: 'response' } cuando el servidor empieza a responder y
 * { phase: 'download', loaded, total } por cada bloque recibido (bytes reales).
 */
async function fetchJsonWithProgress(endpoint, onProgress) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { credentials: 'include', signal: AbortSignal.timeout(120000) })
  } catch { throw new Error(CONNECTION_ERROR) }
  if (!response.ok) throw await toError(response)
  onProgress?.({ phase: 'response' })
  const total = Number(response.headers.get('Content-Length')) || 0
  if (!response.body || !total) return response.json()
  const reader = response.body.getReader()
  const buffer = new Uint8Array(total)
  let loaded = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (loaded + value.length > total) throw new Error('La respuesta de la API está incompleta.')
      buffer.set(value, loaded)
      loaded += value.length
      onProgress?.({ phase: 'download', loaded, total })
    }
  } catch (error) { throw new Error(error.message === 'La respuesta de la API está incompleta.' ? error.message : CONNECTION_ERROR, { cause: error }) }
  return JSON.parse(new TextDecoder().decode(buffer.subarray(0, loaded)))
}

// La contraseña se transforma con bcrypt en el navegador antes de enviarla. Las cuentas creadas antes
// de ese cambio guardan bcrypt de la contraseña original: si el servidor rechaza la versión transformada
// (401), se reintenta con la original, que viaja por HTTPS igual que antes del cambio.
async function withCredentialFallback(password, send) {
  const transformed = await hashForTransport(password)
  try {
    return await send(transformed)
  } catch (error) {
    if (error.status === 401 && password && transformed !== password) return send(password)
    throw error
  }
}

export const apiService = {
  getState: onProgress => fetchJsonWithProgress('/state', onProgress),
  commit: (changes, revision, delta = false, deleted = {}) => fetchApi('/state/transaction', { method: 'PUT', body: JSON.stringify({ changes, revision, delta, deleted }) }),
  login: credentials => withCredentialFallback(credentials?.password, password => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ ...credentials, password }) })),
  me: () => fetchApi('/auth/me'),
  logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  changePassword: async values => {
    const next = await hashForTransport(values?.next)
    return withCredentialFallback(values?.current, current => fetchApi('/auth/password', { method: 'PUT', body: JSON.stringify({ ...values, current, next }) }))
  },
  preview: values => fetchApi('/ventas/preview', { method: 'POST', body: JSON.stringify(values) }),
  checkout: values => fetchApi('/ventas/checkout', { method: 'POST', body: JSON.stringify(values) }),
}
