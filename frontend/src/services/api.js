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

export const apiService = {
  getState: onProgress => fetchJsonWithProgress('/state', onProgress),
  commit: (changes, revision, delta = false, deleted = {}) => fetchApi('/state/transaction', { method: 'PUT', body: JSON.stringify({ changes, revision, delta, deleted }) }),
  login: credentials => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: values => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(values) }),
  me: () => fetchApi('/auth/me'),
  logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  changePassword: values => fetchApi('/auth/password', { method: 'PUT', body: JSON.stringify(values) }),
  preview: values => fetchApi('/ventas/preview', { method: 'POST', body: JSON.stringify(values) }),
  checkout: values => fetchApi('/ventas/checkout', { method: 'POST', body: JSON.stringify(values) }),
}
