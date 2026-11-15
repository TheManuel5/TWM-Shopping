// Comprueba la pantalla de carga con porcentaje y el aviso de guardado.
// No escribe en PostgreSQL: las transacciones se interceptan en el navegador.
// Uso, desde la raíz del repositorio:  SHOPPING_TEST_PASSWORD=... node frontend/scripts/loading-polish-check.cjs
const fs = require('node:fs/promises')
const assert = require('node:assert/strict')
const { loadPlaywright, testAccount, API, WEB } = require('./browser-helpers.cjs')

const OUT = 'frontend/test-results'
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

async function run() {
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  const checks = []
  page.on('pageerror', error => errors.push(error.message))
  page.setDefaultTimeout(30000)
  await fs.mkdir(OUT, { recursive: true })

  // Importa el almacén de datos que ya cargó la página, para simular acciones sin pasar por formularios.
  const withStore = action => page.evaluate(async source => {
    const store = await import(performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/data/localStore.js')).name)
    return new Function('store', 'API', `return (${source})(store, API)`)(store, window.__api)
  }, action.toString())

  try {
    assert((await context.request.post(`${API}/auth/login`, { data: testAccount() })).ok(), 'No se pudo iniciar sesión con la cuenta de pruebas.')
    await page.addInitScript(api => { window.__api = api }, API)

    // 1. Carga inicial: etapas visibles y porcentaje que solo avanza hasta llegar a 100.
    await page.route('**/api/auth/me', async route => { await delay(700); await route.continue() })
    await page.route('**/api/state', async route => { await delay(1500); await route.continue() })
    await page.goto(`${WEB}/favoritos`)
    const bar = page.getByRole('progressbar', { name: 'Progreso de carga inicial' })
    await bar.waitFor()
    for (const stage of ['Sesión', 'Base de datos', 'Descarga', 'Listo']) await page.getByText(stage, { exact: true }).first().waitFor()
    const samples = []
    while (await bar.isVisible().catch(() => false)) {
      const value = Number(await bar.getAttribute('aria-valuenow').catch(() => null))
      if (Number.isFinite(value)) samples.push(value)
      if (samples.length === 12) await page.screenshot({ path: `${OUT}/carga-inicial-progreso.png` })
      await delay(60)
    }
    assert(samples.length > 5, 'La pantalla de carga debe mostrar el avance.')
    assert(samples.every((value, index) => index === 0 || value >= samples[index - 1]), 'El porcentaje nunca debe retroceder.')
    assert(Math.max(...samples) >= 90, 'El porcentaje debe acercarse a 100 antes de mostrar la tienda.')
    await page.getByRole('heading', { name: 'Mis favoritos', exact: true }).waitFor()
    checks.push(`Carga inicial con cuatro etapas y porcentaje creciente (${samples[0]} % → ${Math.max(...samples)} %)`)

    // 2. Aviso de guardado: aparece abajo, muestra el porcentaje y termina en «Cambios guardados».
    const snapshot = await (await context.request.get(`${API}/state`)).json()
    await page.route('**/api/state/transaction', async route => { await delay(1800); await route.fulfill({ json: snapshot }) })
    await withStore(store => store.writeCollection('comuna', store.readCollection('comuna') === 'Osorno' ? 'Valdivia' : 'Osorno'))
    const saving = page.getByRole('status').filter({ hasText: 'Guardando en la base de datos' })
    await saving.waitFor()
    assert((await saving.boundingBox()).y > 700, 'El aviso de guardado debe quedar en la parte inferior.')
    await page.getByRole('progressbar', { name: 'Progreso de guardado' }).waitFor()
    await page.screenshot({ path: `${OUT}/guardado-discreto.png` })
    await page.getByRole('status').filter({ hasText: 'Cambios guardados' }).waitFor()
    await page.getByRole('status').filter({ hasText: 'Cambios guardados' }).waitFor({ state: 'hidden' })
    checks.push('Guardado con porcentaje, confirmación «Cambios guardados» y aviso oculto al terminar')

    // 3. Favoritos vacío: botón principal con el violeta de la marca.
    await withStore(async (store, api) => {
      const fresh = await (await fetch(api + '/state', { credentials: 'include' })).json()
      store.hydrateState({ ...fresh, collections: { ...Object.fromEntries(store.collectionEntries()), wishlist: [] } })
    })
    const explore = page.getByRole('button', { name: 'Explorar catálogo', exact: true })
    await explore.waitFor()
    assert.equal(await explore.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(96, 47, 247)')
    await page.screenshot({ path: `${OUT}/favoritos-moderno.png` })
    checks.push('Botón principal de favoritos con el violeta de la marca')

    // 4. Sin transacción cuando el valor no cambia.
    let commits = 0
    await page.unroute('**/api/state/transaction')
    await page.route('**/api/state/transaction', async route => { commits += 1; await route.fulfill({ json: snapshot }) })
    await withStore(store => store.writeCollection('comuna', store.readCollection('comuna')))
    await page.waitForTimeout(600)
    assert.equal(commits, 0)
    checks.push('Sin transacciones cuando el valor no cambia')

    // 5. Móvil sin desbordamiento ni errores.
    await page.setViewportSize({ width: 390, height: 844 })
    assert(await page.evaluate(() => document.documentElement.scrollWidth) <= 392)
    assert.deepEqual(errors, [])
    checks.push('Sin desbordamiento móvil ni errores JavaScript')

    await fs.writeFile(`${OUT}/loading-polish.json`, JSON.stringify({ passed: true, checks, databaseWrites: 0, transactionsIntercepted: true, errors }, null, 2))
    console.log(`${checks.length} comprobaciones aprobadas; 0 escrituras reales`)
    console.log(checks)
  } catch (error) {
    await page.screenshot({ path: `${OUT}/carga-error.png` }).catch(() => {})
    throw error
  } finally {
    await browser.close()
  }
}

run().catch(error => { console.error(error); process.exitCode = 1 })
