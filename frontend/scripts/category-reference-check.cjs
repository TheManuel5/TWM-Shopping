// Comprueba el menú de categorías por niveles (solo lectura: no escribe en PostgreSQL).
// Uso, desde la raíz del repositorio:  SHOPPING_TEST_PASSWORD=... node frontend/scripts/category-reference-check.cjs
const fs = require('node:fs/promises')
const assert = require('node:assert/strict')
const { loadPlaywright, testAccount, openCategories, API, WEB } = require('./browser-helpers.cjs')

const OUT = 'frontend/test-results'

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

  try {
    assert((await context.request.post(`${API}/auth/login`, { data: testAccount() })).ok(), 'No se pudo iniciar sesión con la cuenta de pruebas.')
    await page.goto(`${WEB}/perfil`)
    await page.getByRole('heading', { name: 'Mi perfil', exact: true }).waitFor()
    assert.equal(await page.getByText('Permisos de tu cuenta', { exact: true }).count(), 0)
    checks.push('Perfil sin bloque de permisos')

    // Menú principal: un solo panel a la izquierda, con saludo y secciones.
    let panel = await openCategories(page)
    const root = await panel.boundingBox()
    assert(Math.abs(root.x) < 1 && root.width <= 366, 'El panel debe ocupar el borde izquierdo con 365 px como máximo.')
    await panel.getByText(/^Hola, /).waitFor()
    for (const section of ['Servicios', 'Productos', 'Tu cuenta']) await panel.getByRole('heading', { name: section, exact: true }).waitFor()
    checks.push('Menú principal con saludo y secciones Servicios, Productos y Tu cuenta')

    // Nivel de subcategorías: el mismo panel avanza y ofrece volver.
    await panel.getByRole('button', { name: 'Tecnología', exact: true }).click()
    await panel.getByRole('button', { name: 'Menú principal', exact: true }).waitFor()
    await panel.getByRole('button', { name: 'Todo en Tecnología', exact: true }).waitFor()
    const level = await panel.boundingBox()
    assert(Math.abs(level.width - root.width) < 1, 'Las subcategorías deben mostrarse en el mismo panel, sin un segundo cuadro.')
    await page.screenshot({ path: `${OUT}/categorias-modelo-desktop.png` })
    // Tercer nivel: el botón de volver muestra el nombre del nivel anterior.
    await panel.getByRole('button', { name: 'Computacion', exact: true }).click()
    await panel.getByRole('button', { name: 'Tecnología', exact: true }).waitFor()
    await panel.getByRole('button', { name: 'Accesorios informaticos', exact: true }).click()
    await page.getByRole('heading', { name: 'Accesorios informaticos', exact: true }).waitFor()
    await panel.waitFor({ state: 'hidden' })
    checks.push('Tres niveles en el mismo panel y navegación real al catálogo')

    // Categoría sin publicaciones: mensaje claro, sin pantalla en blanco.
    panel = await openCategories(page)
    await panel.getByRole('button', { name: 'Categoria vacia A', exact: true }).click()
    const whole = panel.getByRole('button', { name: 'Todo en Categoria vacia A', exact: true })
    if (await whole.isVisible().catch(() => false)) await whole.click()
    await page.getByRole('heading', { name: 'No encontramos publicaciones' }).waitFor()
    checks.push('Categoría vacía sin error')

    // Móvil: volver al menú principal, cerrar con Escape y sin desbordamiento horizontal.
    await page.setViewportSize({ width: 390, height: 844 })
    panel = await openCategories(page)
    assert((await panel.boundingBox()).width <= 390 - 48, 'En móvil debe quedar espacio para el botón de cierre.')
    await panel.getByRole('button', { name: 'Tecnología', exact: true }).click()
    await panel.getByRole('button', { name: 'Menú principal', exact: true }).waitFor()
    await page.screenshot({ path: `${OUT}/categorias-modelo-mobile.png` })
    assert(await page.evaluate(() => document.documentElement.scrollWidth) <= 392)
    await panel.getByRole('button', { name: 'Menú principal', exact: true }).click()
    await panel.getByRole('heading', { name: 'Servicios', exact: true }).waitFor()
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })
    checks.push('Móvil con volver, cierre con Escape y sin desbordamiento')

    assert.deepEqual(errors, [])
    await fs.writeFile(`${OUT}/category-reference.json`, JSON.stringify({ passed: true, checks, errors, readOnlyDatabase: true }, null, 2))
    console.log(`${checks.length} comprobaciones aprobadas, cero errores JavaScript`)
  } catch (error) {
    await page.screenshot({ path: `${OUT}/categorias-modelo-error.png` })
    throw error
  } finally {
    await browser.close()
  }
}

run().catch(error => { console.error(error); process.exitCode = 1 })
