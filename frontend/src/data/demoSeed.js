import { catalogSeed, asItem } from './catalog'
import { readCollection } from './localStore'
import { totals } from './commerce'
import users from './usersSeed'
import companies from './companiesSeed'

export function initializeDemo() {
  readCollection('catalog', catalogSeed)
  readCollection('cart', [])
  readCollection('wishlist', [])
  readCollection('users', users)
  readCollection('companies', companies)
  const products = [asItem(catalogSeed[3]), asItem(catalogSeed[5])].map(item => item.variantes?.length ? { ...item, sku: item.variantes[0].sku, size: item.variantes[0].size, color: item.variantes[0].color } : item)
  const now = new Date()
  const before = days => new Date(now.getTime() - days * 86400000).toISOString()
  readCollection('orders', [
    { id: '1032', createdAt: before(3), date: new Date(before(3)).toLocaleDateString('en-GB').replaceAll('/', '-') + '\n10:24', customer: 'Ana Rodríguez', customerRut: '12345678-5', email: 'ana@shopping.cl', phone: '+56987654321', store: 'Tienda Sur', status: 'Entregado', address: 'Av. Manuel Rodríguez 1234, Osorno, Los Lagos', products, ...totals(products, 3570), payment: 'Tarjeta', cardLast4: '4242', dispatch: { carrier: 'Chilexpress', tracking: '9087654321' }, history: [{ date: before(3), status: 'Recibido' }, { date: before(2), status: 'En preparación' }, { date: before(1), status: 'Enviado' }, { date: now.toISOString(), status: 'Entregado' }] },
    { id: '1031', createdAt: before(1), date: new Date(before(1)).toLocaleDateString('en-GB').replaceAll('/', '-') + '\n14:30', customer: 'Ana Rodríguez', customerRut: '12345678-5', email: 'ana@shopping.cl', phone: '+56987654321', store: 'Tienda Sur', status: 'En preparación', address: 'Av. Manuel Rodríguez 1234, Osorno', products: [products[0]], ...totals([products[0]], 3570), payment: 'Transferencia', transferCode: 'DEMO-1031', history: [{ date: before(1), status: 'Recibido' }] },
  ])
  readCollection('quotes', [0, 20].map((days, index) => ({ id: `COT-02${4 - index}`, vendor: 'Tienda Sur', createdAt: before(days), emittedDate: new Date(before(days)).toLocaleDateString('es-CL'), validUntil: new Date(new Date(before(days)).getTime() + 15 * 86400000).toLocaleDateString('es-CL'), status: index ? 'Expirada' : 'Respondida', total: totals(products).total, items: products.map(item => ({ ...item, unitPrice: item.price, detail: item.talla })), history: [{ date: new Date(before(days)).toLocaleDateString('es-CL'), total: totals(products).total, reason: 'Cotización de demostración' }] })))
  readCollection('returns', [])
  readCollection('zones', [{ id: 1, region: 'Los Lagos', provincia: 'Osorno', comuna: 'Osorno', rate: 3570 }, { id: 2, region: 'Los Lagos', provincia: 'Llanquihue', comuna: 'Puerto Montt', rate: 4760 }, { id: 3, region: 'Los Ríos', provincia: 'Valdivia', comuna: 'Valdivia', rate: 5950 }])
}
