const root = '/catalog/referenciales/'
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export const isOwnImage = image => typeof image === 'string' && image.length > 0 && !image.includes('/catalog/placeholder.svg') && !image.includes(root)
export function catalogGallery(product = {}) {
  const own = [product.imagen, ...(product.imagenes || []), product.image].filter(isOwnImage)
  if (own.length) return [...new Set(own)]
  const category = normalize(product.categoria || product.category)
  let photo
  if (/remot/.test(category)) photo = 'remoto'
  else if (/profesional/.test(category)) photo = 'profesional'
  else if (/libro|material educativo/.test(category)) photo = 'libros'
  else if (/educa|clase/.test(category)) photo = 'educacion'
  else if (/alimenta|alimento/.test(category)) photo = 'alimentos'
  else if (/ropa|vestuario|calzado|invierno/.test(category)) photo = 'vestuario'
  else if (/tecnolog|comput|informatic|celular/.test(category)) photo = 'tecnologia'
  else return ['/catalog/placeholder.svg']
  return [root + photo + '.webp']
}
export const catalogImage = product => catalogGallery(product)[0]
