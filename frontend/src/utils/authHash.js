import bcrypt from 'bcryptjs'

// Sal bcrypt fija y estándar para el transporte seguro de credenciales desde el cliente
export const CLIENT_BCRYPT_SALT = '$2a$10$abcdefghijklmnopqrstuu'

/**
 * Hashea una contraseña con bcrypt en el frontend antes de transmitirla a la API,
 * evitando que la contraseña viaje en texto plano por la red.
 * Si ya viene hasheada con bcrypt ($2...), se retorna sin re-hashear.
 */
export async function hashForTransport(password) {
  if (!password) return ''
  if (typeof password === 'string' && password.startsWith('$2')) return password
  return bcrypt.hash(password, CLIENT_BCRYPT_SALT)
}

export function hashForTransportSync(password) {
  if (!password) return ''
  if (typeof password === 'string' && password.startsWith('$2')) return password
  return bcrypt.hashSync(password, CLIENT_BCRYPT_SALT)
}
