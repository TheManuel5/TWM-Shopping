import { API_MODE, apiService } from '../services/api'
// API: caché reactiva en memoria. Demo: almacenamiento local explícito.
let authenticated = false
const guestKeys = new Set(['cart', 'wishlist', 'selectedVendor', 'comuna'])
let revision = 0
let queue = Promise.resolve()
let generation = 0
let pending = 0
let completed = 0
let total = 0
let persistenceError = ''
const statusListeners = new Set()
let status = { pending: 0, completed: 0, total: 0, error: '' }
function emitStatus() { status = { pending, completed, total, error: persistenceError }; statusListeners.forEach(listener => listener()) }
export const subscribePersistence = listener => { statusListeners.add(listener); return () => statusListeners.delete(listener) }
export const getPersistenceStatus = () => status
export function hydrateState(snapshot) {
  authenticated = snapshot.isAuthenticated
  cache.clear()
  Object.entries(snapshot.collections).forEach(([key, value]) => cache.set(key, value))
  if (!authenticated) for (const key of guestKeys) {
    const saved = sessionStorage.getItem('shopping-guest:' + key)
    if (saved) try { cache.set(key, JSON.parse(saved)) } catch { /* ignorar datos inválidos */ }
  }
  revision = snapshot.revision
  listeners.forEach(listener => listener())
}
export async function loadRemoteState() {
  await queue
  const snapshot = await apiService.getState()
  if (snapshot.source !== 'public' || snapshot.dataMode !== 'relational') throw new Error('La API activa no usa la base importada. Inicia la versión relacional del backend.')
  generation += 1
  hydrateState(snapshot)
  if (authenticated) {
    const guestChanges = {}
    for (const key of guestKeys) {
      const saved = sessionStorage.getItem('shopping-guest:' + key)
      if (saved) {
        try { const value = JSON.parse(saved); guestChanges[key] = Array.isArray(value) ? [...readCollection(key, []), ...value].filter((row, index, list) => list.findIndex(item => (item.key || item.id) === (row.key || row.id)) === index) : value } catch { /* ignorar datos inválidos */ }
        sessionStorage.removeItem('shopping-guest:' + key)
      }
    }
    if (Object.keys(guestChanges).length) hydrateState(await apiService.commit(guestChanges, revision))
  }
  persistenceError = ''; emitStatus()
  return snapshot
}
export const flushPersistence = async () => { await queue; if (persistenceError) throw new Error(persistenceError) }
function persist(changes) {
  if (!authenticated) {
    if (Object.keys(changes).some(key => !guestKeys.has(key))) throw new Error('Inicia sesión para guardar esta información.')
    Object.entries(changes).forEach(([key, value]) => sessionStorage.setItem('shopping-guest:' + key, JSON.stringify(value)))
    return
  }
  persistenceError = ''
  const deltaKeys = new Set(['catalog', 'orders', 'users', 'companies', 'quotes', 'returns', 'messages', 'conversations', 'zones'])
  const values = {}, deleted = {}
  for (const [key, next] of Object.entries(changes)) {
    if (deltaKeys.has(key) && Array.isArray(next)) {
      const previous = readCollection(key, []), indexed = new Map(previous.map(row => [String(row.id), JSON.stringify(row)]))
      values[key] = next.filter(row => indexed.get(String(row.id)) !== JSON.stringify(row))
      const present = new Set(next.map(row => String(row.id)))
      deleted[key] = previous.filter(row => !present.has(String(row.id))).map(row => String(row.id))
    } else values[key] = next
  }
  if (Object.keys(changes).every(key => JSON.stringify(readCollection(key, null)) === JSON.stringify(changes[key]))) return
  const prepared = structuredClone(values)
  const currentGeneration = generation
  if (pending === 0) { completed = 0; total = 0 }
  total += 1; pending += 1; emitStatus()
  queue = queue.then(async () => {
    if (currentGeneration !== generation) { pending -= 1; emitStatus(); return }
    try {
      const snapshot = await apiService.commit(prepared, revision, true, deleted)
      revision = snapshot.revision
      logEvent('Datos confirmados por la API', prepared)
      // Mantener las ediciones pendientes posteriores; al finalizar se usa el estado canónico del servidor.
      if (pending === 1) hydrateState(snapshot)
    } catch (error) {
      generation += 1
      persistenceError = error.message + ' Los cambios rechazados no se guardaron.'
      try { hydrateState(await apiService.getState()) } catch { /* conservar el error visible */ }
      window.dispatchEvent(new CustomEvent('shopping:notice', { detail: { message: persistenceError, severity: 'error' } }))
    } finally { completed += 1; pending -= 1; emitStatus() }
  })
}

const cache = new Map()
const listeners = new Set()
const prefix = 'shopping-demo-v2:'
export function readCollection(key, initial = []) {
  if (!cache.has(key)) {
    try {
      const saved = API_MODE ? null : localStorage.getItem(prefix + key)
      cache.set(key, saved === null ? initial : JSON.parse(saved))
    } catch { cache.set(key, initial) }
  }
  return cache.get(key)
}
export function writeCollection(key, value, initial = []) {
  const next = typeof value === 'function' ? value(readCollection(key, initial)) : value
  // Guardar primero: una cuota agotada no debe mostrar un éxito falso.
  if (API_MODE) persist({ [key]: next })
  else localStorage.setItem(prefix + key, JSON.stringify(next))
  cache.set(key, next)
  listeners.forEach(listener => listener())
  return next
}
export function writeCollections(entries) {
  if (API_MODE) {
    persist(entries)
    Object.entries(entries).forEach(([key, value]) => cache.set(key, value))
    listeners.forEach(listener => listener())
    return
  }
  const prepared = Object.entries(entries).map(([key, value]) => [key, value, JSON.stringify(value), localStorage.getItem(prefix + key)])
  try {
    prepared.forEach(([key, , json]) => localStorage.setItem(prefix + key, json))
  } catch (error) {
    prepared.forEach(([key, , , previous]) => {
      if (previous === null) localStorage.removeItem(prefix + key)
      else localStorage.setItem(prefix + key, previous)
    })
    throw error
  }
  prepared.forEach(([key, value]) => cache.set(key, value))
  listeners.forEach(listener => listener())
}
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export function collectionEntries() {
  for (let index = 0; !API_MODE && index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(prefix)) readCollection(key.slice(prefix.length))
  }
  return [...cache.entries()]
}
export function logEvent(action, data = {}) {
  const redact = (value) => {
    if (Array.isArray(value)) return value.map(redact)
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !/password|contrase|token|secret|salt|hash/i.test(key))
      .map(([key, item]) => [key, /^(email|correo|rut|run|phone|phones|telefono|address|addresses|direccion|fullName|customerRut)$/i.test(key) ? '[protegido]' : /^(imagen|imagenes|image|images)$/i.test(key) ? (Array.isArray(item) ? item.length + ' imágenes' : '[imagen]') : redact(item)]))
    return value
  }
  console.log(`[Shopping] ${action}`, redact(data))
}
