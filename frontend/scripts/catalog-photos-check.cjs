// Comprueba las fotografías del catálogo (solo lectura: no escribe en PostgreSQL).
// Uso, desde la raíz del repositorio:  SHOPPING_TEST_PASSWORD=... node frontend/scripts/catalog-photos-check.cjs
const fs = require('node:fs/promises')
const assert = require('node:assert/strict')
const { loadPlaywright, testAccount, API, WEB } = require('./browser-helpers.cjs')

const OUT = 'frontend/test-results'
const PHOTOS = ['tecnologia', 'vestuario', 'alimentos', 'libros', 'educacion', 'profesional', 'remoto']

async function run() {
  const { chromium } = loadPlaywright()
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.setDefaultTimeout(60000)
  await fs.mkdir(OUT, { recursive: true })

  // Las imágenes se cargan de forma diferida: solo se exige que estén listas las que se ven en pantalla.
  const visibleImagesReady = () => page.waitForFunction(() => {
    const visible = [...document.querySelectorAll('main img')].filter(image => { const box = image.getBoundingClientRect(); return box.bottom > 0 && box.top < innerHeight && box.width > 0 })
    return visible.length > 0 && visible.every(image => image.complete && image.naturalWidth > 0)
  })

  try {
    assert((await context.request.post(`${API}/auth/login`, { data: testAccount() })).ok(), 'No se pudo iniciar sesión con la cuenta de pruebas.')
    const snapshot = await (await context.request.get(`${API}/state`)).json()
    const catalog = snapshot.collections.catalog

    // Catálogo de escritorio.
    await page.goto(`${WEB}/catalogo`)
    await page.locator('main article').first().waitFor()
    await visibleImagesReady()
    assert(await page.locator('main img[src*="/referenciales/"]').count() > 0, 'El catálogo debe mostrar fotografías referenciales.')
    await page.screenshot({ path: `${OUT}/fotos-catalogo.png` })

    // Cobertura: cada publicación tiene foto propia o referencial.
    const coverage = await page.evaluate(async rows => {
      const { catalogImage } = await import('/src/utils/catalogImages.js')
      const referential = row => catalogImage(row).includes('/referenciales/')
      return {
        total: rows.length,
        covered: rows.filter(row => !catalogImage(row).includes('/catalog/placeholder.svg')).length,
        referential: rows.filter(referential).length,
        categories: [...new Set(rows.map(row => row.categoria))],
        referenceProduct: rows.find(row => row.tipo === 'Producto' && row.estado !== 'Borrador' && referential(row))?.id,
        referenceService: rows.find(row => row.tipo === 'Servicio' && row.estado !== 'Borrador' && referential(row))?.id,
      }
    }, catalog)
    assert.equal(coverage.covered, coverage.total, 'Hay publicaciones sin fotografía.')

    // Ficha de producto y de servicio con la etiqueta «Imagen referencial».
    for (const [id, route, file] of [[coverage.referenceProduct, 'producto', 'fotos-producto.png'], [coverage.referenceService, 'servicio', 'fotos-servicio.png']]) {
      const item = catalog.find(row => row.id === id)
      await page.goto(`${WEB}/${route}/${item.id}`)
      await page.getByRole('heading', { name: item.nombre, exact: true }).waitFor()
      await page.getByAltText(item.nombre, { exact: true }).first().waitFor()
      await visibleImagesReady()
      assert(await page.getByText('Imagen referencial', { exact: true }).count() > 0)
      await page.screenshot({ path: `${OUT}/${file}` })
    }

    // Catálogo móvil sin desbordamiento.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${WEB}/catalogo`)
    await page.locator('main article').first().waitFor()
    await visibleImagesReady()
    assert(await page.evaluate(() => document.documentElement.scrollWidth) <= 392)
    await page.screenshot({ path: `${OUT}/fotos-catalogo-mobile.png` })

    // Los siete archivos del paquete referencial se sirven localmente.
    await page.setContent('<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;font-family:Arial">' + PHOTOS.map(name => `<div><img src="${WEB}/catalog/referenciales/${name}.webp" style="width:100%;height:160px;object-fit:cover"><p>${name} — Imagen referencial</p></div>`).join('') + '</div>')
    await page.setViewportSize({ width: 900, height: 900 })
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0))
    await page.screenshot({ path: `${OUT}/fotos-paquete.png`, fullPage: true })

    assert.deepEqual(errors, [])
    const checks = ['Todas las publicaciones importadas tienen referencia o foto propia', 'Archivos locales cargan en catálogo, producto y servicio', 'Etiqueta referencial visible', 'Catálogo móvil sin desbordamiento']
    await fs.writeFile(`${OUT}/catalog-photos.json`, JSON.stringify({ passed: true, ...coverage, errors, databaseWrites: 0, checks }, null, 2))
    console.log(`${checks.length} comprobaciones aprobadas: ${coverage.covered} de ${coverage.total} publicaciones con fotografía`)
  } catch (error) {
    await page.screenshot({ path: `${OUT}/fotos-error.png` })
    throw error
  } finally {
    await browser.close()
  }
}

run().catch(error => { console.error(error); process.exitCode = 1 })
