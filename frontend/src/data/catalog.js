import { catalogImage } from '../utils/catalogImages'
import { API_MODE } from '../services/api'
import { dateKey } from '../utils/dates'
import laptop from '../assets/home/prod_lenovo.png'
import phone from '../assets/home/prod_iphone.png'
import appliance from '../assets/home/prod_freidora.png'
import shoe from '../assets/home/prod_adidas.png'
import chair from '../assets/home/prod_silla.png'
import fashion from '../assets/products/fashion.jpg'
import { readCollection, writeCollection, logEvent } from './localStore'

export const catalogSeed = [
  { id: 1, nombre: 'Notebook Lenovo IdeaPad 3 15,6 pulgadas', categoria: 'Tecnología', precio: 449990, stock: 10, imagen: laptop, descripcion: 'Ryzen 5 · 16 GB RAM · 512 GB SSD', material: 'Aluminio', peso: 1650 },
  { id: 2, nombre: 'iPhone 15 128 GB Negro', categoria: 'Celulares', precio: 749950, stock: 8, imagen: phone, descripcion: 'Pantalla de 6,1 pulgadas y cámara de 48 MP', material: 'Aluminio', peso: 171 },
  { id: 3, nombre: 'Freidora de aire Oster 5,5 litros', categoria: 'Hogar y Cocina', precio: 79990, stock: 9, imagen: appliance, descripcion: 'Cocina tus recetas con menos aceite', material: 'Acero', peso: 4500 },
  { id: 4, nombre: 'Zapatillas Adidas Grand Court', categoria: 'Ropa, moda y calzado', precio: 54990, stock: 11, imagen: shoe, descripcion: 'Estilo y comodidad para tu día a día', material: 'Sintético', peso: 650, talla: '38', color: 'Blanco', variantes: [{ sku: 'ADI-38-BL', size: '38', color: 'Blanco', price: 54990, stock: 6 }, { sku: 'ADI-42-NG', size: '42', color: 'Negro', price: 54990, stock: 5 }] },
  { id: 5, nombre: 'Silla de escritorio ergonómica Mesh Pro', categoria: 'Hogar y Cocina', precio: 89990, stock: 12, imagen: chair, descripcion: 'Respaldo ajustable y soporte lumbar', material: 'Malla', peso: 12000 },
  { id: 6, nombre: 'Polera básica de algodón', categoria: 'Ropa, moda y calzado', precio: 11900, stock: 18, imagen: fashion, descripcion: 'Algodón suave y transpirable', material: 'Algodón', peso: 180, talla: 'M', color: 'Beige' },
  { id: 102, nombre: 'Mantenimiento de computadores', categoria: 'Computación y Tecnología', precio: 29750, stock: 20, imagen: laptop, descripcion: 'Diagnóstico, limpieza y optimización de tu equipo.', tipo: 'Servicio', duracion: '90 minutos', edad: 18, modalidad: 'En local' },
  { id: 101, nombre: 'Veterinaria Patitas Felices', categoria: 'Servicios profesionales', precio: 25000, stock: 10, imagen: fashion, descripcion: 'Consulta y cuidado veterinario para tus mascotas.', tipo: 'Servicio', duracion: '60 minutos', edad: 18, modalidad: 'En local' },
  { id: 103, nombre: 'Aseo Hogar del Sur', categoria: 'Servicios domésticos', precio: 35000, stock: 10, imagen: chair, descripcion: 'Limpieza y aseo domiciliario por profesionales.', tipo: 'Servicio', duracion: '120 minutos', edad: 18, modalidad: 'A domicilio' },
  { id: 104, nombre: 'Sur Media Producciones', categoria: 'Servicios profesionales', precio: 45000, stock: 10, imagen: phone, descripcion: 'Fotografía, diseño y publicidad para tu emprendimiento.', tipo: 'Servicio', duracion: '90 minutos', edad: 0, modalidad: 'Remoto' },
].map(item => ({ tipo: 'Producto', vendedor: 'Tienda Sur', color: 'Gris', talla: 'Única', tamano: 'Estándar', ...item }))

export const getCatalog = () => readCollection('catalog', catalogSeed)
export function asItem(product) {
  return { ...product, name: product.nombre, category: product.categoria, price: effectivePrice(product), image: catalogImage(product), type: product.tipo || 'Producto', seller: product.vendedor || '', vendorId: product.ownerRut || product.vendedor || '', rating: product.rating == null ? '—' : Number(product.rating).toLocaleString('es-CL', { maximumFractionDigits: 1 }), reviews: product.reviews || 0, qty: 1 }
}
export function effectivePrice(product, now = new Date()) {
  if (API_MODE) return product.precio
  const today = dateKey(now)
  return product.oferta && today >= product.oferta.inicio && today <= product.oferta.fin ? product.oferta.precio : product.precio
}
export function addToCart(item, qty = 1) {
  if (!Number.isInteger(qty) || qty < 1 || (item.type !== 'Servicio' && qty > item.stock)) throw new Error('Cantidad fuera del stock disponible.')
  const product = getCatalog().find(product => product.id === item.id)
  if (!product || product.estado === 'Borrador') throw new Error('La publicación ya no está disponible.')
  if (product.variantes?.length && !item.sku) {
    const variant = product.variantes.find(variant => variant.stock > 0)
    if (!variant) throw new Error('No quedan variantes disponibles.')
    item = { ...item, sku: variant.sku, size: variant.size, color: variant.color, stock: variant.stock, price: effectivePrice(product) !== product.precio ? effectivePrice(product) : variant.price }
  }
  if ((item.type !== 'Servicio' && qty > item.stock)) throw new Error('Cantidad fuera del stock disponible.')
  const cart = readCollection('cart', [])
  const key = `${item.id}:${item.sku || ''}`
  const existing = cart.find(row => row.key === key)
  if (item.type !== 'Servicio' && (existing?.qty || 0) + qty > item.stock) throw new Error('Ya tienes el máximo de unidades disponibles en el carrito.')
  writeCollection('cart', existing ? cart.map(row => row.key === key ? { ...row, qty: row.qty + qty } : row) : [...cart, { ...item, key, qty }])
  writeCollection('selectedVendor', item.seller)
  logEvent('Agregar al carrito', { id: item.id, sku: item.sku, qty })
}
export function toggleFavorite(item) {
  const items = readCollection('wishlist', [])
  writeCollection('wishlist', items.some(row => row.id === item.id) ? items.filter(row => row.id !== item.id) : [...items, item])
  logEvent('Actualizar favoritos', { id: item.id })
}
export function requestQuote(items) {
  if (!items.length) throw new Error('Selecciona al menos un producto.')
  if (new Set(items.map(item => item.seller)).size > 1) throw new Error('Selecciona artículos de un solo vendedor.')
  const selectedItems = items.map(item => { const product = getCatalog().find(product => product.id === item.id); if (product?.variantes?.length && !item.sku) { const variant = product.variantes.find(variant => variant.stock > 0); if (!variant) throw new Error('Hay artículos sin stock.'); return { ...item, sku: variant.sku, size: variant.size, stock: variant.stock, price: variant.price } } return item })
  const date = new Date()
  const quote = { id: `COT-${Date.now()}`, vendor: items[0].seller, createdAt: date.toISOString(), emittedDate: date.toLocaleDateString('es-CL'), validUntil: new Date(date.getTime() + 15 * 86400000).toLocaleDateString('es-CL'), status: 'Solicitada', total: selectedItems.reduce((sum, row) => sum + row.price * row.qty, 0), items: selectedItems.map(row => ({ ...row, unitPrice: row.price, detail: row.sku || row.talla || '' })), history: [] }
  writeCollection('quotes', current => [quote, ...current])
  logEvent('Solicitar cotización', quote)
  return quote
}
