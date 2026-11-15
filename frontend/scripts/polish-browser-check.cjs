// Comprobación visual de detalles de interfaz (solo lectura: cancela los formularios y no escribe en PostgreSQL).
// Uso, desde la raíz del repositorio:  SHOPPING_TEST_PASSWORD=... node frontend/scripts/polish-browser-check.cjs
const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { loadPlaywright, testAccount, openCategories, API, WEB } = require('./browser-helpers.cjs')

const OUT = 'frontend/test-results'

async function run() {
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  const checks = []
  const errors = []
  page.setDefaultTimeout(60000)
  page.on('pageerror', error => errors.push(error.message))
  await fs.mkdir(OUT, { recursive: true })

  // Navega dentro de la aplicación sin recargar el estado completo.
  const visit = async route => {
    await page.evaluate(target => { history.pushState({}, '', target); dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0) }, route)
    await page.waitForTimeout(500)
  }
  const useMode = async mode => {
    await page.getByRole('combobox', { name: 'Modo de uso' }).first().click()
    await page.getByRole('option', { name: mode, exact: true }).click()
  }

  try {
    assert((await context.request.post(`${API}/auth/login`, { data: testAccount() })).ok(), 'No se pudo iniciar sesión con la cuenta de pruebas.')
    await page.goto(`${WEB}/perfil`)
    await page.getByRole('heading', { name: 'Mi perfil', exact: true }).waitFor()
    await useMode('Comprador')

    // 1. Cambio de contraseña: visibilidad por campo y validación de coincidencia. Se cancela sin guardar.
    await page.getByRole('button', { name: 'Cambiar contraseña', exact: true }).click()
    const dialog = page.getByRole('dialog')
    const current = dialog.getByLabel('Contraseña actual', { exact: true })
    await current.fill('solo-verificacion-visual')
    assert.equal(await current.getAttribute('type'), 'password')
    await dialog.getByRole('button', { name: 'Mostrar contraseña actual', exact: true }).click()
    assert.equal(await current.getAttribute('type'), 'text')
    await dialog.getByRole('button', { name: 'Ocultar contraseña actual', exact: true }).click()
    await dialog.getByLabel('Nueva contraseña', { exact: true }).fill('NuevaClave2026!')
    await dialog.getByLabel('Confirmar nueva contraseña', { exact: true }).fill('NoCoincide2026!')
    assert(await dialog.getByRole('button', { name: 'Actualizar contraseña' }).isDisabled())
    await dialog.getByLabel('Confirmar nueva contraseña', { exact: true }).fill('NuevaClave2026!')
    assert(await dialog.getByRole('button', { name: 'Actualizar contraseña' }).isEnabled())
    await page.screenshot({ path: path.join(OUT, 'pulido-password.png') })
    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
    checks.push('Tres campos con visibilidad individual y validación de coincidencia; ninguna contraseña modificada')

    // 2. Menú de categorías: panel lateral por niveles y categoría vacía sin pantalla en blanco.
    let panel = await openCategories(page)
    const box = await panel.boundingBox()
    assert(Math.abs(box.x) < 1 && box.width <= 366)
    await panel.getByRole('button', { name: 'Tecnología', exact: true }).click()
    await panel.getByRole('button', { name: 'Menú principal', exact: true }).waitFor()
    await page.screenshot({ path: path.join(OUT, 'pulido-categorias-desktop.png') })
    await panel.getByRole('button', { name: 'Menú principal', exact: true }).click()
    await panel.getByRole('button', { name: 'Categoria vacia A', exact: true }).click()
    const whole = panel.getByRole('button', { name: 'Todo en Categoria vacia A', exact: true })
    if (await whole.isVisible().catch(() => false)) await whole.click()
    await page.getByRole('heading', { name: 'No encontramos publicaciones' }).waitFor()
    await page.screenshot({ path: path.join(OUT, 'pulido-categoria-vacia.png') })
    checks.push('Categorías en panel lateral por niveles y categoría vacía sin pantalla en blanco')

    // 3. Subcategoría con ID numérico: navega al catálogo y muestra publicaciones.
    panel = await openCategories(page)
    await panel.getByRole('button', { name: 'Tecnología', exact: true }).click()
    await panel.getByRole('button', { name: 'Computacion', exact: true }).click()
    await panel.getByRole('button', { name: 'Accesorios informaticos', exact: true }).click()
    await page.getByRole('heading', { name: 'Accesorios informaticos', exact: true }).waitFor()
    await page.locator('main article').first().waitFor()
    assert(await page.locator('main article').count() > 1)
    checks.push('Subcategorías de ID numérico navegan al catálogo con publicaciones')

    // 4. Edición de publicación: vista previa de una foto real. Se cancela sin guardar.
    await visit('/perfil')
    await useMode('Administrador')
    await visit('/crud-2')
    await page.getByRole('button', { name: 'Editar Producto 1', exact: true }).first().click()
    const editor = page.getByRole('dialog')
    await editor.getByLabel('Seleccionar imágenes').setInputFiles(path.resolve('frontend/src/assets/home/prod_lenovo.png'))
    const preview = editor.getByAltText('Foto 1 de la publicación', { exact: true })
    await preview.waitFor()
    await preview.scrollIntoViewIfNeeded()
    await page.screenshot({ path: path.join(OUT, 'pulido-imagenes.png') })
    await editor.getByRole('button', { name: 'Cancelar', exact: true }).click()
    checks.push('Carga de foto real con vista previa principal; se canceló sin guardar datos')

    // 5. Móvil: menú con espacio para cerrar, cierre con Escape y ficha de producto sin desbordamiento.
    await page.setViewportSize({ width: 390, height: 844 })
    panel = await openCategories(page)
    assert((await panel.boundingBox()).width <= 390 - 48)
    await page.screenshot({ path: path.join(OUT, 'pulido-categorias-mobile.png') })
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })
    await visit('/producto/P-1-20000001-3')
    await page.getByRole('heading', { name: 'Producto 1', exact: true }).waitFor()
    assert(await page.evaluate(() => document.documentElement.scrollWidth) <= 392)
    await page.screenshot({ path: path.join(OUT, 'pulido-producto-mobile.png'), fullPage: true })
    checks.push('Menú móvil, cierre con Escape y ficha de producto sin desbordamiento')

    assert.deepEqual(errors, [])
    await fs.writeFile(path.join(OUT, 'frontend-polish.json'), JSON.stringify({ passed: true, checks, errors, readOnlyDatabase: true }, null, 2))
    console.log(checks)
  } catch (error) {
    await page.screenshot({ path: path.join(OUT, 'pulido-fallo.png'), fullPage: true })
    await fs.writeFile(path.join(OUT, 'frontend-polish.json'), JSON.stringify({ passed: false, checks, errors, error: error.message, url: page.url() }, null, 2))
    throw error
  } finally {
    await browser.close()
  }
}

run().catch(error => { console.error(error); process.exitCode = 1 })
