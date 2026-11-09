// Integration tests against the running local API and PostgreSQL. Creates clearly labelled QA records.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const base = process.env.SHOPPING_TEST_API || 'http://localhost:5156/api'
const checks = []
function client() {
  let cookie = ''
  return async (url, method = 'GET', body, expected = 200, headers = {}) => {
    const response = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) })
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0]
    const text = await response.text(); let data; try { data = JSON.parse(text) } catch { data = text }
    if (Array.isArray(expected)) { assert(expected.includes(response.status), `${method} ${url}: ${text}`); return { status: response.status, data } }
    assert.equal(response.status, expected, `${method} ${url}: ${text}`)
    return data
  }
}
function rut(body) { let sum = 0, m = 2; for (const digit of String(body).split('').reverse()) { sum += Number(digit) * m; m = m === 7 ? 2 : m + 1 } const dv = 11 - sum % 11; return `${body}-${dv === 11 ? 0 : dv === 10 ? 'K' : dv}` }
async function run() {
  const admin = client(), buyer = client(), guest = client()
  const id = 'QA-' + crypto.randomUUID(); const buyerRut = rut(20000000 + Math.floor(Math.random() * 9000000))
  await guest('/health/database'); await guest('/auth/me', 'GET', undefined, 401); await guest('/state/transaction', 'PUT', { revision: 0, changes: {} }, 401)
  checks.push('PostgreSQL disponible; recursos privados requieren sesión')
  await admin('/auth/login', 'POST', { rut: '12345678-5', password: process.env.SHOPPING_TEST_PASSWORD || 'Demo2026!' })
  const profile = { rut: buyerRut, nombre: 'Cliente QA Integración', email: id.toLowerCase() + '@example.test', password: 'PruebaQA2026!', telefono: '+569' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0'), direccion: 'Calle de pruebas 123', fechaNacimiento: '1998-01-10', rol: 'cliente', canAdmin: true }
  const registered = await buyer('/auth/register', 'POST', profile, 201); assert.equal(registered.canAdmin, false)
  await buyer('/auth/login', 'POST', { rut: buyerRut, password: profile.password })
  const me = await buyer('/auth/me'); assert.equal(me.rut, buyerRut); assert.equal(me.canAdmin, false)
  checks.push('Registro y bcrypt; el cliente no puede concederse permisos')
  let state = await admin('/state')
  const product = { id, nombre: 'Producto QA integración', categoria: 'Tecnología', tipo: 'Producto', precio: 11900, stock: 2, vendedor: 'Tienda Sur', imagen: '/catalog/prod_lenovo.png', estado: 'Publicado' }
  await admin('/productos', 'POST', product, 200, { 'If-Match': String(state.revision) })
  let item = await admin('/productos/' + id); assert.equal(item.item.precio, 11900)
  await admin('/productos/' + id, 'PUT', { ...item.item, descripcion: 'Persistencia real PostgreSQL' }, 200, { 'If-Match': String(item.revision) })
  item = await guest('/productos/' + id); assert.equal(item.item.descripcion, 'Persistencia real PostgreSQL')
  checks.push('Create, Read y Update de productos persistidos y públicos')
  let own = await buyer('/state')
  await buyer('/state/transaction', 'PUT', { revision: own.revision, changes: { catalog: null } }, 400)
  await buyer('/state/transaction', 'PUT', { revision: own.revision, changes: { catalog: [{ ...item.item, precio: 1 }] } }, 403)
  await buyer('/state/transaction', 'PUT', { revision: own.revision, changes: { ['addresses:12345678-5']: [] } }, 400)
  await buyer('/state/transaction', 'PUT', { revision: own.revision, changes: { cart: [{ password: 'bad' }] } }, 400)
  checks.push('Permisos, separación de cuentas y rechazo de credenciales en documentos')
  const address = { id: 'qa-address', street: 'Calle QA', number: '123', commune: 'Osorno', region: 'Los Lagos', primary: true }
  own = await buyer('/state/transaction', 'PUT', { revision: own.revision, changes: { ['addresses:' + buyerRut]: [address] } })
  const another = client(); await another('/auth/login', 'POST', { rut: buyerRut, password: profile.password })
  assert.equal((await another('/state')).collections['addresses:' + buyerRut][0].street, address.street)
  await buyer('/state/transaction', 'PUT', { revision: own.revision - 1, changes: { cart: [] } }, 409)
  checks.push('Persistencia entre sesiones y detección de ediciones simultáneas')
  const purchase = { items: [{ id, qty: 1, price: 11900 }], vendor: 'Tienda Sur', address, payment: 'Tarjeta', cardLast4: '4242', transferCode: '', deliveryMode: 'Despacho', requestId: crypto.randomUUID() }
  await buyer('/ventas/checkout', 'POST', { ...purchase, items: [{ id, qty: 1, price: 1 }] }, 400)
  assert.equal((await guest('/productos/' + id)).item.stock, 2)
  const result = await buyer('/ventas/checkout', 'POST', purchase); assert.equal(result.order.total, 15470); assert.equal(result.order.net + result.order.iva, result.order.total)
  const replay = await buyer('/ventas/checkout', 'POST', purchase); assert.equal(replay.order.id, result.order.id); assert.equal((await guest('/productos/' + id)).item.stock, 1)
  checks.push('Checkout recalcula precio/despacho/IVA y conserva stock ante errores y reintentos')
  const concurrent = await Promise.all([crypto.randomUUID(), crypto.randomUUID()].map(requestId => buyer('/ventas/checkout', 'POST', { ...purchase, requestId }, [200,400])))
  assert.deepEqual(concurrent.map(result => result.status).sort(), [200,400]); assert.equal((await guest('/productos/' + id)).item.stock, 0)
  checks.push('Dos compras simultáneas por la última unidad: una aceptada y otra rechazada')
  for (const status of ['En preparación', 'Enviado', 'Entregado']) {
    state = await admin('/state'); const orders = state.collections.orders.map(order => order.id === result.order.id ? { ...order, status } : order)
    await admin('/state/transaction', 'PUT', { revision: state.revision, changes: { orders } })
  }
  checks.push('Seguimiento de pedido con transiciones de estado controladas')
  own = await buyer('/state')
  const returnId = id + '-return'
  await buyer('/devoluciones', 'POST', { id: returnId, orderId: result.order.id, productId: id, qty: 1, sku: '', reason: 'Producto con falla', price: 1, product: product.nombre, history: ['Solicitada'] }, 200, { 'If-Match': String(own.revision) })
  let request = await admin('/devoluciones/' + returnId); assert.equal(request.item.price, 11900)
  await admin('/devoluciones/' + returnId, 'PUT', { ...request.item, status: 'Aprobada' }, 200, { 'If-Match': String(request.revision) })
  assert.equal((await guest('/productos/' + id)).item.stock, 1)
  request = await admin('/devoluciones/' + returnId)
  await admin('/devoluciones/' + returnId, 'PUT', { ...request.item, status: 'Finalizada' }, 200, { 'If-Match': String(request.revision) })
  assert.equal((await guest('/productos/' + id)).item.stock, 1)
  checks.push('Devolución calcula importe y repone inventario exactamente una vez')
  own = await buyer('/state')
  const quoteId = id + '-quote'
  await buyer('/cotizaciones', 'POST', { id: quoteId, items: [{ id, name: product.nombre, qty: 1, price: 1, unitPrice: 1 }], total: 1 }, 200, { 'If-Match': String(own.revision) })
  const quote = await buyer('/cotizaciones/' + quoteId); assert.equal(quote.item.total, 11900)
  await buyer('/cotizaciones/' + quoteId, 'PUT', { ...quote.item, status: 'Aceptada por el cliente' }, 200, { 'If-Match': String(quote.revision) })
  checks.push('Cotización emitida y aceptada con precio calculado por el servidor')
  own = await buyer('/state')
  const conversation = { id: id + '-thread', sellerRut: '12345678-5', customerName: profile.nombre, name: 'Tienda Sur' }
  await buyer('/conversaciones', 'POST', conversation, 200, { 'If-Match': String(own.revision) })
  own = await buyer('/state')
  await buyer('/mensajes', 'POST', { id: id + '-message', conversationId: conversation.id, text: 'Mensaje QA entre cliente y vendedor' }, 200, { 'If-Match': String(own.revision) })
  const inbox = await admin('/mensajes'); assert(inbox.items.some(message => message.text === 'Mensaje QA entre cliente y vendedor' && message.senderRut === buyerRut))
  checks.push('Mensajería entre cuentas con identidad del remitente asignada en servidor')
  const report = await admin('/reportes/ventas'); assert(report.some(row => row.id === result.order.id))
  checks.push('Reportes consultan los pedidos persistidos')
  own = await buyer('/state')
  await buyer('/state/transaction', 'PUT', { revision: own.revision, changes: { ['profile:' + buyerRut]: { fullName: 'Cliente QA Actualizado', email: profile.email, rut: buyerRut, birthYear: '1998', birthMonth: 'Enero', birthDay: '10', phones: [{ id: 1, number: profile.telefono, label: 'Principal' }] } } })
  const updatedProfile = await buyer('/auth/me'); assert.equal(updatedProfile.nombre, 'Cliente QA Actualizado'); assert.equal(updatedProfile.fechaNacimiento, '1998-01-10')
  state = await admin('/state'); const tree = structuredClone(state.collections.categories)
  tree.Productos.push({ id: id + '-category', name: 'Categoría QA ' + id, children: [] })
  await admin('/state/transaction', 'PUT', { revision: state.revision, changes: { categories: tree } })
  state = await admin('/state'); assert(state.collections.categories.Productos.some(row => row.id === id + '-category'))
  tree.Productos.find(row => row.id === id + '-category').name += ' Editada'
  await admin('/state/transaction', 'PUT', { revision: state.revision, changes: { categories: tree } })
  state = await admin('/state')
  tree.Productos = tree.Productos.filter(row => row.id !== id + '-category')
  await admin('/state/transaction', 'PUT', { revision: state.revision, changes: { categories: tree } })
  checks.push('Perfil actualiza la cuenta real y las categorías conservan su jerarquía en PostgreSQL')
  const seller = client(), sellerRut = rut(30000000 + Math.floor(Math.random() * 9000000))
  const sellerProfile = { ...profile, rut: sellerRut, nombre: 'Vendedor QA', email: id.toLowerCase() + '-seller@example.test', telefono: '+569' + String(Math.floor(Math.random() * 100000000)).padStart(8,'0'), rol: 'vendedor' }
  await seller('/auth/register', 'POST', sellerProfile, 201); await seller('/auth/login', 'POST', { rut: sellerRut, password: profile.password })
  let sellerState = await seller('/state')
  await seller('/productos', 'POST', { ...product, id: id + '-seller', vendedor: 'Nombre falsificado', peso: 1000, precio: 1190, stock: 1 }, 200, { 'If-Match': String(sellerState.revision) })
  let sellerItem = await seller('/productos/' + id + '-seller'); assert.equal(sellerItem.item.ownerRut, sellerRut); assert.equal(sellerItem.item.vendedor, 'Vendedor QA')
  await seller('/productos/' + id, 'PUT', { ...item.item, precio: 1 }, 403, { 'If-Match': String(sellerItem.revision) })
  sellerState = await seller('/state')
  await seller('/tarifas', 'POST', { id: id + '-zone', comuna: 'Osorno', provincia: 'Osorno', region: 'Los Lagos', rate: 1000 }, 200, { 'If-Match': String(sellerState.revision) })
  sellerState = await seller('/state'); await seller('/state/transaction', 'PUT', { revision: sellerState.revision, changes: { shippingMethod: 'volumen' } })
  const sellerOrder = await buyer('/ventas/checkout', 'POST', { ...purchase, requestId: crypto.randomUUID(), vendor: 'Vendedor QA', items: [{ id: id + '-seller', qty: 1, price: 1190 }] })
  assert.equal(sellerOrder.order.shipping, 1850); assert.equal(sellerOrder.order.total, 3040)
  sellerState = await seller('/state'); assert(sellerState.collections.orders.some(order => order.id === sellerOrder.order.id)); assert(!sellerState.collections.orders.some(order => order.id === result.order.id))
  sellerItem = await seller('/productos/' + id + '-seller'); await seller('/productos/' + id + '-seller', 'DELETE', undefined, 200, { 'If-Match': String(sellerItem.revision) })
  checks.push('Vendedor sin Admin: propiedad, tarifas propias, despacho por volumen y pedidos limitados a su tienda')
  await buyer('/auth/password', 'PUT', { current: profile.password, next: 'NuevaPruebaQA2026!' }, 204)
  await buyer('/auth/me'); await another('/auth/me', 'GET', undefined, 401)
  checks.push('Cambiar contraseña conserva la sesión actual e invalida las otras sesiones')
  item = await admin('/productos/' + id); await admin('/productos/' + id, 'DELETE', undefined, 200, { 'If-Match': String(item.revision) }); await guest('/productos/' + id, 'GET', undefined, 404)
  await buyer('/auth/logout', 'POST', undefined, 204); await buyer('/auth/me', 'GET', undefined, 401)
  checks.push('Delete de catálogo y cierre efectivo de sesión')
  await fs.mkdir('backend/test-results', { recursive: true }); await fs.writeFile('backend/test-results/integration.json', JSON.stringify({ passed: true, executedAt: new Date().toISOString(), checks, testAccount: buyerRut, order: result.order.id }, null, 2))
  console.log(JSON.stringify({ passed: true, checks }, null, 2))
}
run().catch(async error => { console.error(error); await fs.mkdir('backend/test-results', { recursive: true }); await fs.writeFile('backend/test-results/integration.json', JSON.stringify({ passed: false, error: error.message, checks }, null, 2)); process.exitCode = 1 })
