export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const phonePattern = /^\+?\d[\d\s-]{7,14}$/
export function isValidRut(value) {
  const rut = value.replace(/[.\s-]/g, '').toUpperCase()
  if (!/^\d{7,8}[\dK]$/.test(rut)) return false
  let sum = 0
  let multiplier = 2
  for (const digit of rut.slice(0, -1).split('').reverse()) {
    sum += Number(digit) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const result = 11 - sum % 11
  return rut.at(-1) === (result === 11 ? '0' : result === 10 ? 'K' : String(result))
}
export const normalizeRut = value => { const clean = value.replace(/[.\s-]/g, '').toUpperCase(); return clean.slice(0, -1) + '-' + clean.slice(-1) }
export function validateOffer(price, offer, start, end) {
  if (!(Number(offer) > 0 && Number(offer) < Number(price))) return 'La oferta debe ser mayor que cero y menor al precio oficial.'
  if (!start || !end || end < start) return 'El término de la oferta debe ser igual o posterior al inicio.'
  return ''
}
