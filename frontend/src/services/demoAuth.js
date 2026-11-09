import { API_MODE, apiService } from './api'
import { readCollection, writeCollection, writeCollections, logEvent } from '../data/localStore'
import { normalizeRut, isValidRut, emailPattern, phonePattern } from '../utils/validation'
async function derive(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new Uint8Array(salt), iterations: 210000, hash: 'SHA-256' }, key, 256)
  return Array.from(new Uint8Array(bits)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}
export async function registerLocal(values) {
  if (API_MODE) { const profile = await apiService.register(values); logEvent('Registro de cuenta', { rut: profile.rut, role: profile.role }); return profile }
  if (!isValidRut(values.rut) || !emailPattern.test(values.email.trim()) || !phonePattern.test(values.telefono) || values.nombre.trim().length < 3 || values.direccion.trim().length < 5 || values.password.length < 8 || !values.fechaNacimiento || !Number.isFinite(new Date(values.fechaNacimiento).getTime()) || new Date(values.fechaNacimiento) > new Date()) throw new Error('Revisa los datos obligatorios del registro.')
  const users = readCollection('accounts', [])
  const rut = normalizeRut(values.rut)
  if (users.some(user => user.rut === rut || user.email === values.email.trim().toLowerCase() || user.telefono.replace(/\D/g, '') === values.telefono.replace(/\D/g, ''))) throw new Error('El RUT, correo o teléfono ya está registrado.')
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
  const passwordHash = await derive(values.password, salt)
  const profile = { ...values }; delete profile.password
  const account = { ...profile, rut, run: rut, nombre: values.nombre.trim(), email: values.email.trim().toLowerCase(), telefono: values.telefono.trim(), role: values.rol === 'vendedor' ? 'Vendedor' : 'Comprador', salt, passwordHash }
  const directory = readCollection('users', [])
  const directoryEntry = { id: Date.now(), name: account.nombre, rut, email: account.email, phones: [account.telefono], birthDate: account.fechaNacimiento, address: account.direccion, roles: values.rol === 'vendedor' ? ['Cliente', 'Emprendedor'] : ['Cliente'], status: 'Activo' }
  writeCollections({ accounts: [...users, account], users: [...directory, directoryEntry] })
  logEvent('Registro de cuenta', { rut, role: account.role })
}
export async function loginLocal(rut, password, remember = false) {
  if (API_MODE) { const profile = await apiService.login({ rut, password, remember }); logEvent('Inicio de sesión', { rut: profile.rut, role: profile.role }); return profile }
  const normalized = normalizeRut(rut)
  const account = readCollection('accounts', []).find(user => user.rut === normalized)
  if (!account || await derive(password, account.salt) !== account.passwordHash) throw new Error('RUT o contraseña incorrectos.')
  const user = { ...account }; delete user.salt; delete user.passwordHash
  logEvent('Inicio de sesión', { rut: user.rut })
  return user
}
export async function changePassword(rut, current, next) {
  if (API_MODE) { await apiService.changePassword({ current, next }); logEvent('Cambio de contraseña', { completado: true }); return }
  const account = readCollection('accounts', []).find(user => user.rut === normalizeRut(rut))
  if (!account || await derive(current, account.salt) !== account.passwordHash) throw new Error('La contraseña actual no es correcta.')
  if (next.length < 8 || current === next) throw new Error('Usa una nueva contraseña de al menos 8 caracteres.')
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
  const passwordHash = await derive(next, salt)
  writeCollection('accounts', users => users.map(user => user.rut === account.rut ? { ...user, salt, passwordHash } : user))
  logEvent('Cambio de contraseña', { completado: true })
}
