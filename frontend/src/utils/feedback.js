import { API_MODE } from '../services/api'
import { flushPersistence, getPersistenceStatus } from '../data/localStore'
export function notify(message, severity = 'success') {
  const show = () => window.dispatchEvent(new CustomEvent('shopping:notice', { detail: { message, severity } }))
  if (API_MODE && severity === 'success' && getPersistenceStatus().pending) { flushPersistence().then(show).catch(() => {}); return }
  show()
}
export function confirmAction(message, title = 'Confirmar eliminación') {
  return new Promise(resolve => window.dispatchEvent(new CustomEvent('shopping:confirm', { detail: { title, message, resolve } })))
}
