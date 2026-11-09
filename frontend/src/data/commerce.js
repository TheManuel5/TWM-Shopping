import { API_MODE, apiService } from '../services/api'
import { flushPersistence, hydrateState } from './localStore'
import { getCatalog, effectivePrice } from './catalog'
import { readCollection, writeCollections, logEvent } from './localStore'

export const money = value => typeof value === 'number' ? value : Number(String(value || 0).replace(/[^\d-]/g, ''))
export const formatDate = value => new Date(value).toLocaleDateString('es-CL')
export function totals(items, shipping = 0) {
  const subtotal = items.reduce((sum, item) => sum + money(item.price) * (item.qty || 1), 0)
  const total = subtotal + shipping
  const net = Math.round(total / 1.19)
  return { subtotal, shipping, total, net, iva: total - net }
}
export function refreshQuotes(quotes, catalog, now = new Date()) {
  return quotes.filter(quote => !quote.createdAt || (now - new Date(quote.createdAt)) / 86400000 < 45).map(quote => {
    if (!quote.createdAt) return quote
    const days = (now - new Date(quote.createdAt)) / 86400000
    if (days <= 15 || quote.status === 'Aceptada por el cliente') return quote
    const week = Math.floor((days - 15) / 7)
    const items = week > (quote.adjustedWeek ?? -1) ? quote.items.map(item => {
      const product = catalog.find(product => product.id === item.id)
      return product ? { ...item, unitPrice: effectivePrice(product, now), price: effectivePrice(product, now) } : item
    }) : quote.items
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
    const changed = week > (quote.adjustedWeek ?? -1)
    return { ...quote, items, total, status: 'Expirada', adjustedWeek: week, history: changed ? [{ date: formatDate(now), total, reason: 'Actualización de precios tras la vigencia de 15 días' }, ...quote.history] : quote.history }
  })
}
export function checkout({ items, user, vendor, address, shipping = 0, payment, cardLast4, transferCode, deliveryMode, requestId }) {
  if (API_MODE) return (async () => {
    await flushPersistence()
    const result = await apiService.checkout({ items, vendor, address, payment, cardLast4, transferCode, deliveryMode, requestId })
    hydrateState(result.state)
    logEvent('Pedido registrado', { id: result.order.id, total: result.order.total })
    return result.order
  })()
  if (!user || !items.length || items.some(item => item.seller !== vendor)) throw new Error('La compra requiere un cliente y artículos de un solo vendedor.')
  if (deliveryMode === 'Despacho' && !address) throw new Error('Selecciona una dirección de despacho.')
  if (payment === 'Tarjeta' && !/^\d{4}$/.test(cardLast4)) throw new Error('Ingresa los últimos cuatro dígitos de la tarjeta.')
  if (payment === 'Transferencia' && transferCode.trim().length < 5) throw new Error('Ingresa un código de transferencia válido.')
  const catalog = getCatalog()
  const needed = new Map()
  const variantNeeded = new Map()
  for (const item of items) {
    if (!Number.isInteger(item.qty) || item.qty < 1) throw new Error('La cantidad debe ser un entero positivo.')
    needed.set(item.id, (needed.get(item.id) || 0) + item.qty)
    if (item.sku) variantNeeded.set(`${item.id}:${item.sku}`, (variantNeeded.get(`${item.id}:${item.sku}`) || 0) + item.qty)
    const product = catalog.find(product => product.id === item.id)
    if (!product || product.estado === 'Borrador') throw new Error('Uno de los artículos ya no está disponible.')
    if (product.edad && user.fechaNacimiento) { const born = new Date(user.fechaNacimiento); const today = new Date(); let age = today.getFullYear() - born.getFullYear(); if (today.getMonth() < born.getMonth() || (today.getMonth() === born.getMonth() && today.getDate() < born.getDate())) age -= 1; if (age < product.edad) throw new Error(`Este servicio requiere una edad mínima de ${product.edad} años.`) }
    const variant = product.variantes?.find(variant => variant.sku === item.sku)
    if (product.variantes?.length && (!variant || variant.stock < variantNeeded.get(`${item.id}:${item.sku}`))) throw new Error('El stock de la variante cambió. Revisa el carrito.')
  }
  if ([...needed].some(([id, qty]) => catalog.find(product => product.id === id).stock < qty)) throw new Error('El stock cambió. Revisa el carrito.')
  const prices = items.map(item => {
    const product = catalog.find(product => product.id === item.id)
    const variant = product.variantes?.find(variant => variant.sku === item.sku)
    const quote = item.quoteId ? readCollection('quotes', []).find(quote => quote.id === item.quoteId && quote.status === 'Aceptada por el cliente' && new Date() - new Date(quote.createdAt) <= 15 * 86400000) : null
    const quotedItem = quote?.items.find(quoted => quoted.id === item.id && (quoted.sku || '') === (item.sku || ''))
    const price = quotedItem ? quotedItem.unitPrice : product.oferta && effectivePrice(product) !== product.precio ? effectivePrice(product) : variant?.price ?? effectivePrice(product)
    if (price !== item.price) throw new Error('El precio cambió. Quita el artículo del carrito y agrégalo nuevamente.')
    return { ...item, price, detail: [item.sku, item.color, item.size].filter(Boolean).join(' · ') }
  })
  const order = { id: `PED-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(), date: new Date().toLocaleDateString('en-GB').replaceAll('/', '-') + '\n' + new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }), customer: user.nombre, customerRut: user.rut, email: user.email, phone: user.telefono, store: vendor, address: deliveryMode === 'Despacho' ? [address.street, address.number, address.department, address.commune, address.region].filter(Boolean).join(', ') : 'Retiro en tienda', status: 'Recibido', ...totals(prices, shipping), payment, cardLast4: payment === 'Tarjeta' ? cardLast4 : '', transferCode: payment === 'Transferencia' ? transferCode.trim() : '', products: prices, history: [{ date: new Date().toISOString(), status: 'Recibido' }] }
  const updated = catalog.map(product => ({ ...product, stock: product.stock - (needed.get(product.id) || 0), variantes: product.variantes?.map(variant => ({ ...variant, stock: variant.stock - (variantNeeded.get(`${product.id}:${variant.sku}`) || 0) })) }))
  // Validar la escritura completa antes de cambiar el estado visible.
  writeCollections({ catalog: updated, orders: [order, ...readCollection('orders', [])], cart: readCollection('cart', []).filter(item => item.seller !== vendor) })
  logEvent('Compra simulada', { id: order.id, total: order.total, products: prices.map(item => ({ id: item.id, qty: item.qty })) })
  return order
}
