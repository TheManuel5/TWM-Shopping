const { createRequire } = require('node:module')
const { pathToFileURL } = require('node:url')
const path = require('node:path'), os = require('node:os'), fs = require('node:fs/promises'), assert = require('node:assert/strict')
const root = path.resolve(__dirname, '..'), localRequire = createRequire(path.join(root, 'package.json'))
let playwright; try { playwright = localRequire('playwright') } catch { playwright = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')) }
async function run() {
 const { build, preview } = await import(pathToFileURL(localRequire.resolve('vite')).href)
 await build({ root, logLevel: 'error', define: { 'import.meta.env.VITE_DATA_MODE': JSON.stringify('api') } })
 const server = await preview({ root, preview: { host: 'localhost', port: 5174, strictPort: true } })
 const base = 'http://localhost:5174', browser = await playwright.chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' })
 const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, acceptDownloads: true }), page = await context.newPage()
 const errors = [], failed = [], checks = [], artifacts = path.join(root, 'test-results')
 await fs.mkdir(artifacts, { recursive: true })
 page.on('pageerror', error => errors.push(error.stack || error.message))
 page.on('response', response => { if (response.url().includes(':5156/api/') && response.status() >= 400 && !response.url().endsWith('/auth/me')) failed.push(`${response.status()} ${response.url()}`) })
 const goto = async route => { console.log('Visita', route); await page.goto(base + route, { waitUntil: 'networkidle' }); if (route !== '/login' && route !== '/register') { await page.locator('main').waitFor(); assert((await page.locator('main').innerText()).length > 20, route) } assert(!await page.getByRole('alert').filter({ hasText: /no se guardaron|No se pudo conectar/ }).count(), route) }
 const saved = async () => { await page.getByRole('status', { name: 'Guardando en PostgreSQL' }).waitFor({ state: 'hidden' }); await page.waitForLoadState('networkidle') }
 try {
  // Slow API boot must show Skeleton instead of spinner.
  await page.route('**/api/state', async route => { await new Promise(resolve => setTimeout(resolve, 400)); await route.continue() })
  await page.goto(base + '/inicio', { waitUntil: 'domcontentloaded' }); await page.getByLabel('Cargando Shopping').waitFor(); assert(await page.locator('.MuiSkeleton-root').count() > 0)
  await page.locator('main').waitFor(); await page.unroute('**/api/state'); checks.push('Skeleton visible durante la carga real de la API')
  await page.screenshot({ path: path.join(artifacts, 'api-inicio.png'), fullPage: true })
  await goto('/login'); await page.locator('#login-rut').fill('123456785'); await page.locator('#login-password').fill(process.env.SHOPPING_TEST_PASSWORD || 'Demo2026!'); await page.getByRole('button', { name: 'Ingresar', exact: true }).click(); await page.waitForURL('**/inicio')
  await goto('/perfil'); assert((await page.getByLabel('Nombre completo', { exact: false }).inputValue()).includes('Ana')); checks.push('Login por formulario y cookie HttpOnly; sesión restaurada al recargar')
  const routes = ['/configuracion','/catalogo','/producto/4','/servicio/102','/carrito','/favoritos','/cotizaciones','/mis-compras','/mensajes','/vendedor/dashboard','/vendedor/publicar-producto','/vendedor/publicar-servicio','/vendedor/inventario','/vendedor/despachos','/crud-1','/crud-2']
  for (const route of routes) await goto(route)
  checks.push(`${routes.length} vistas conectadas recorridas sin errores de React`)
  await goto('/producto/4'); await page.getByRole('button', { name: 'Agregar al carrito', exact: true }).click(); await page.waitForURL('**/carrito'); await saved()
  await page.reload({ waitUntil: 'networkidle' }); await page.getByText('Zapatillas Adidas Grand Court', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Continuar compra', exact: true }).click(); await page.waitForURL('**/checkout'); await page.getByRole('button', { name: /^Pagar / }).waitFor(); await page.getByRole('checkbox', { name: /^Acepto / }).check(); await page.getByRole('button', { name: /^Pagar / }).click(); await page.waitForURL('**/pedido/PED-*')
  const orderUrl = page.url(); await page.getByRole('heading', { name: /Seguimiento de pedido/ }).waitFor(); await page.reload({ waitUntil: 'networkidle' }); await page.getByRole('heading', { name: /Seguimiento de pedido/ }).waitFor()
  const downloadEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Descargar comprobante' }).click(); const download = await downloadEvent; await download.saveAs(path.join(artifacts, 'api-comprobante.pdf'))
  checks.push('Producto → carrito persistente → checkout .NET → pedido PostgreSQL → PDF')
  await page.screenshot({ path: path.join(artifacts, 'api-pedido.png'), fullPage: true })
  await goto('/perfil'); await page.getByRole('button', { name: 'Admin', exact: true }).click(); await page.waitForURL('**/admin/usuarios')
  for (const route of ['/admin/usuarios','/admin/empresas','/admin/reportes']) { await goto(route); assert(!(await page.locator('main').innerText()).includes('Acceso no disponible')) }
  await page.getByRole('button', { name: 'Ejecutar reporte', exact: true }).click(); await page.getByText('Selecciona un reporte y presiona Ejecutar.', { exact: true }).waitFor({ state: 'hidden' }); checks.push('Modo Admin conservado al recargar y reportes consultados a .NET')
  await goto('/admin/usuarios'); await page.getByRole('button', { name: 'Nuevo usuario', exact: true }).click(); let dialog = page.getByRole('dialog')
  const name = 'QA Navegador ' + Date.now()
  await dialog.getByLabel('Nombre completo').fill(name); await dialog.getByLabel('RUN / RUT').fill('22.222.222-2'); await dialog.getByLabel('Correo electrónico').fill('qa-ui@example.test'); await dialog.getByLabel('Fecha de nacimiento').fill('1995-01-01'); await dialog.getByLabel('Teléfono 1', { exact: true }).fill('+56955556666'); await dialog.getByLabel('Dirección de despacho').fill('Calle QA 123'); await dialog.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await dialog.waitFor({ state: 'hidden' }); await saved()
  await page.reload({ waitUntil: 'networkidle' }); await page.getByPlaceholder('Buscar por nombre, RUT, correo o teléfono').fill(name); await page.getByRole('button', { name: 'Editar ' + name, exact: true }).click(); await page.getByRole('dialog').getByLabel('Nombre completo').fill(name + ' Editado'); await page.getByRole('dialog').getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await saved()
  await page.getByRole('button', { name: 'Eliminar ' + name + ' Editado', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Confirmar', exact: true }).click(); await saved(); await page.getByText('No se encontraron registros.', { exact: true }).waitFor(); checks.push('CRUD de usuarios desde interfaz con recarga y persistencia real')
  await goto('/mensajes'); await page.getByRole('button', { name: 'Nueva conversación', exact: true }).click(); await saved(); const message = 'Mensaje UI ' + Date.now(); await page.getByLabel('Escribe tu mensaje').fill(message); await page.getByRole('button', { name: 'Enviar', exact: true }).click(); await saved(); await page.reload({ waitUntil: 'networkidle' }); await page.getByText(message, { exact: true }).waitFor(); checks.push('Mensaje enviado desde interfaz y recuperado de PostgreSQL')
  await page.setViewportSize({ width: 390, height: 844 }); for (const route of ['/inicio','/catalogo','/mensajes']) { await goto(route); const size = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth })); assert(size.width <= size.viewport + 2, `Desbordamiento ${route}`); const header = await page.locator('header').first().boundingBox(); const heading = await page.locator('main').getByRole('heading').first().boundingBox(); assert(heading.y >= header.y + header.height, `Cabecera tapa el título en ${route}`) }
  await page.screenshot({ path: path.join(artifacts, 'api-mobile.png'), fullPage: true }); checks.push('Interfaz móvil de 390 px sin desbordamientos')
  assert.deepEqual(errors, []); assert.deepEqual(failed, [])
  await fs.writeFile(path.join(artifacts, 'connected-check.json'), JSON.stringify({ passed: true, executedAt: new Date().toISOString(), checks, errors, failed, orderUrl }, null, 2)); console.log(JSON.stringify({ passed: true, checks }, null, 2))
 } catch(error) { await page.screenshot({ path: path.join(artifacts, 'api-failure.png'), fullPage: true }); await fs.writeFile(path.join(artifacts, 'connected-check.json'), JSON.stringify({ passed: false, checks, errors, failed, url: page.url(), error: error.message }, null, 2)); throw error }
 finally { await browser.close(); await new Promise(resolve => server.httpServer.close(resolve)) }
}
run().catch(error => { console.error(error); process.exitCode = 1 })
