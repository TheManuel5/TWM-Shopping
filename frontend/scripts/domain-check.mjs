import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const data = new Map()
globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key), key: index => [...data.keys()][index], get length() { return data.size } }
globalThis.sessionStorage = { getItem: () => null }
const server = await createServer({ root: fileURLToPath(new URL('..', import.meta.url)), configFile: false, define: { 'import.meta.env.VITE_DATA_MODE': JSON.stringify('demo') }, server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true } })
const load = path => server.ssrLoadModule('/src/' + path)
const validation = await load('utils/validation.js')
const store = await load('data/localStore.js')
const catalog = await load('data/catalog.js')
const commerce = await load('data/commerce.js')
const auth = await load('services/demoAuth.js')
const categories = await load('utils/categories.js')
const photos = await load('utils/catalogImages.js')
const { CATEGORY_TREE } = await load('utils/taxonomyData.js')

try {
  await test('Fotos referenciales por categoría: prioridad de fotos propias y sin mutar el catálogo', () => {
    const product = { categoria: 'Accesorios informáticos', imagen: '/catalog/placeholder.svg', imagenes: [] }
    assert.equal(photos.catalogImage(product), '/catalog/referenciales/tecnologia.webp')
    assert.equal(product.imagen, '/catalog/placeholder.svg')
    assert.equal(photos.catalogImage({ categoria: 'Profesional remoto', tipo: 'Servicio' }), '/catalog/referenciales/remoto.webp')
    assert.equal(photos.catalogImage({ ...product, imagenes: ['data:image/webp;base64,real'] }), 'data:image/webp;base64,real')
    assert.deepEqual(photos.catalogGallery({ ...product, imagen: '/propia.webp', imagenes: ['/propia.webp', '/otra.webp'] }), ['/propia.webp', '/otra.webp'])
    assert.equal(photos.catalogImage({ categoria: 'Sin correspondencia' }), '/catalog/placeholder.svg')
  })
  await test('RUT: dígito verificador, formatos y entradas inválidas', () => {
    assert(validation.isValidRut('12.345.678-5'))
    assert(validation.isValidRut('12345678-5'))
    assert(!validation.isValidRut('12.345.678-9'))
    assert(!validation.isValidRut('KKKKKKKK-K'))
  })
  await test('Ofertas: precio positivo menor al oficial y fechas ordenadas', () => {
    assert.equal(validation.validateOffer(1000, 900, '2026-10-01', '2026-10-29'), '')
    assert(validation.validateOffer(1000, 1100, '2026-10-01', '2026-10-29'))
    assert(validation.validateOffer(1000, 900, '2026-10-29', '2026-10-01'))
  })
  await test('Neto, IVA y total concilian para múltiples cantidades y despacho', () => {
    const total = commerce.totals([{ price: 11900, qty: 2 }], 3570)
    assert.equal(total.total, 27370)
    assert.equal(total.net + total.iva, total.total)
  })
  await test('Los registros de eventos omiten contraseñas, tokens y hashes anidados', () => {
    const original = console.log
    let logged
    console.log = (...args) => { logged = JSON.stringify(args) }
    try { store.logEvent('test', { nombre: 'Prueba', password: 'secreto1', nested: { token: 'secreto2', passwordHash: 'secreto3' } }) } finally { console.log = original }
    assert(!logged.includes('secreto'))
    assert(logged.includes('Prueba'))
  })
  await test('Registro, duplicados, credenciales y cambio de contraseña sin texto plano persistido', async () => {
    store.writeCollection('accounts', [])
    const account = { rut: '12345678-5', nombre: 'Prueba Local', email: 'prueba@shopping.cl', telefono: '+56912345678', direccion: 'Osorno 123', rol: 'cliente', password: 'Prueba2026!', fechaNacimiento: '1990-01-01' }
    await auth.registerLocal(account)
    assert(!localStorage.getItem('shopping-demo-v2:accounts').includes('Prueba2026!'))
    assert(store.readCollection('users', []).some(row => row.rut === account.rut && row.email === account.email))
    assert.equal((await auth.loginLocal(account.rut, account.password)).nombre, account.nombre)
    await assert.rejects(auth.loginLocal(account.rut, 'incorrecta'))
    await assert.rejects(auth.registerLocal(account), /ya está registrado/)
    await assert.rejects(auth.changePassword(account.rut, 'incorrecta', 'Nueva2026!'))
    await auth.changePassword(account.rut, account.password, 'Nueva2026!')
    await assert.rejects(auth.loginLocal(account.rut, account.password))
    assert.equal((await auth.loginLocal(account.rut, 'Nueva2026!')).rut, account.rut)
  })
  await test('Categorías relacionales: ID numérico, subniveles y categoría vacía', () => {
    const tree = { Productos: [{ id: 1, name: 'Tecnología', children: [{ id: 11, name: 'Computación', children: [{ id: 21, name: 'Accesorios', children: [] }] }] }, { id: 6, name: 'Categoría vacía A', children: [] }], Servicios: [] }
    assert.deepEqual(categories.categoryNamesUnder(tree, 'Tecnología'), ['Tecnología', 'Computación', 'Accesorios'])
    assert.deepEqual(categories.categoryNamesUnder(tree, 'Categoría vacía A'), ['Categoría vacía A'])
  })
  const user = { rut: '12345678-5', nombre: 'Prueba', fechaNacimiento: '1990-01-01', email: 'prueba@shopping.cl', telefono: '+56912345678' }
  const address = { street: 'Calle', number: '123', commune: 'Osorno', region: 'Los Lagos' }
  await test('Carrito: variante real, acumulación y límite de stock', () => {
    store.writeCollection('catalog', structuredClone(catalog.catalogSeed))
    store.writeCollection('cart', [])
    catalog.addToCart(catalog.asItem(catalog.getCatalog().find(product => product.id === 4)), 2)
    const cart = store.readCollection('cart')
    assert.equal(cart[0].sku, 'ADI-38-BL')
    assert.equal(cart[0].qty, 2)
    catalog.addToCart(catalog.asItem(catalog.getCatalog().find(product => product.id === 4)), 1)
    assert.equal(store.readCollection('cart')[0].qty, 3)
    store.writeCollection('cart', cart)
    assert.throws(() => catalog.addToCart(catalog.asItem(catalog.getCatalog().find(product => product.id === 4)), 5), /máximo/)
  })
  await test('Compra: un vendedor, validación de pago, descuento de stock y conservación de otros vendedores', () => {
    store.writeCollection('orders', [])
    const items = store.readCollection('cart')
    store.writeCollection('cart', [...items, { ...items[0], seller: 'Otro vendedor', key: 'otro', qty: 1 }])
    const options = { user, address, items, vendor: 'Tienda Sur', shipping: 3570, payment: 'Tarjeta', cardLast4: '4242', deliveryMode: 'Despacho' }
    assert.throws(() => commerce.checkout({ ...options, cardLast4: '123x' }))
    assert.throws(() => commerce.checkout({ ...options, items: [...items, { ...items[0], seller: 'Otro vendedor' }] }))
    const order = commerce.checkout(options)
    assert.equal(order.net + order.iva, order.total)
    assert.equal(order.products[0].qty, 2)
    assert.equal(catalog.getCatalog().find(product => product.id === 4).stock, 9)
    assert.equal(catalog.getCatalog().find(product => product.id === 4).variantes[0].stock, 4)
    assert.equal(store.readCollection('cart').length, 1)
    assert.equal(store.readCollection('cart')[0].seller, 'Otro vendedor')
    assert.equal(store.readCollection('orders')[0].id, order.id)
    assert.throws(() => commerce.checkout({ ...options, items: [{ ...items[0], qty: 5 }] }), /stock/)
  })
  await test('No se permite comprar con precios anteriores ni incumplir la restricción de edad', () => {
    const item = catalog.asItem(catalog.getCatalog().find(product => product.id === 102))
    const options = { user, address, items: [item], vendor: item.seller, payment: 'Tarjeta', cardLast4: '4242', deliveryMode: 'Despacho' }
    assert.throws(() => commerce.checkout({ ...options, items: [{ ...item, price: 1 }] }), /precio/)
    assert.throws(() => commerce.checkout({ ...options, user: { ...user, fechaNacimiento: '2020-01-01' } }), /edad mínima/)
  })
  await test('Una escritura fallida revierte catálogo, pedidos y carrito', () => {
    const before = structuredClone(catalog.getCatalog())
    const orderCount = store.readCollection('orders').length
    const item = catalog.asItem(before[0])
    store.writeCollection('cart', [{ ...item, key: 'test', qty: 1 }])
    const realSet = localStorage.setItem
    let failed = false
    localStorage.setItem = (key, value) => { if (key.endsWith(':orders') && !failed) { failed = true; throw new Error('QuotaExceededError') } realSet(key, value) }
    try { assert.throws(() => commerce.checkout({ user, address, items: store.readCollection('cart'), vendor: item.seller, payment: 'Tarjeta', cardLast4: '4242', deliveryMode: 'Despacho' }), /Quota/) } finally { localStorage.setItem = realSet }
    assert.deepEqual(catalog.getCatalog(), before)
    assert.equal(store.readCollection('orders').length, orderCount)
    assert.equal(store.readCollection('cart').length, 1)
  })
  await test('Cotizaciones: 15 días fijos, actualización semanal, eliminación a los 45 días', () => {
    const quote = { id: 'Q1', createdAt: '2026-10-01T00:00:00Z', status: 'Solicitada', total: 100, items: [{ id: 1, unitPrice: 100, qty: 1 }], history: [] }
    const products = [{ id: 1, precio: 200 }]
    assert.equal(commerce.refreshQuotes([quote], products, new Date('2026-10-15T00:00:00Z'))[0].total, 100)
    const expired = commerce.refreshQuotes([quote], products, new Date('2026-10-17T00:00:00Z'))[0]
    assert.equal(expired.status, 'Expirada'); assert.equal(expired.total, 200)
    assert.equal(commerce.refreshQuotes([expired], [{ id: 1, precio: 300 }], new Date('2026-10-18T00:00:00Z'))[0].total, 200)
    assert.equal(commerce.refreshQuotes([expired], [{ id: 1, precio: 300 }], new Date('2026-10-25T00:00:00Z'))[0].total, 300)
    assert.equal(commerce.refreshQuotes([quote], products, new Date('2026-11-15T00:00:00Z')).length, 0)
  })
  await test('Una cotización aceptada conserva su precio durante los 15 días de vigencia', () => {
    const product = catalog.getCatalog().find(product => product.id === 1)
    const item = { ...catalog.asItem(product), quoteId: 'FIJA', price: 100000, qty: 1 }
    store.writeCollection('quotes', [{ id: 'FIJA', status: 'Aceptada por el cliente', createdAt: new Date().toISOString(), items: [{ id: item.id, unitPrice: 100000, qty: 1 }] }])
    store.writeCollection('cart', [item])
    const order = commerce.checkout({ user, address, items: [item], vendor: item.seller, payment: 'Tarjeta', cardLast4: '4242', deliveryMode: 'Despacho' })
    assert.equal(order.total, 100000)
    assert.equal(order.products[0].price, 100000)
  })
  await test('El árbol de categorías conserva todos los niveles y permite editar una hoja', () => {
    const nodes = categories.flattenCategories(CATEGORY_TREE)
    assert(nodes.some(node => node.name === 'Kinesiología'))
    const next = categories.mapCategoryTree(CATEGORY_TREE, '2.1.1', node => ({ ...node, name: 'Computación de prueba' }))
    assert(categories.flattenCategories(next).some(node => node.name === 'Computación de prueba'))
    assert(categories.flattenCategories(CATEGORY_TREE).some(node => node.name === 'Computación'))
  })
} finally { await server.close() }
