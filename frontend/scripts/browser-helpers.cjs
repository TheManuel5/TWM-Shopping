// Utilidades compartidas por las comprobaciones de navegador.
const os = require('node:os')
const path = require('node:path')

/** Carga Playwright desde PLAYWRIGHT_PATH, desde las dependencias del proyecto o desde la instalación local conocida. */
function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    'playwright',
    path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),
  ].filter(Boolean)
  for (const candidate of candidates) {
    try { return require(candidate) } catch { /* probar el siguiente */ }
  }
  throw new Error('No se encontró Playwright. Instálalo (npm i -D playwright) o define PLAYWRIGHT_PATH.')
}

/** Lee un secreto de pruebas desde una variable de entorno; nunca se escribe en el código. */
function secret(name) {
  const value = process.env[name]
  if (!value) throw new Error('Define ' + name + ' antes de ejecutar esta comprobación (consulta README.md, sección Verificación).')
  return value
}

/** Cuenta de pruebas: el RUT y la contraseña se entregan por variables de entorno, no se escriben en el código. */
function testAccount() {
  const rut = process.env.SHOPPING_TEST_RUT || '20000001-3'
  return { rut, password: secret('SHOPPING_TEST_PASSWORD') }
}

const API = process.env.SHOPPING_API || 'http://localhost:5156/api'
const WEB = process.env.SHOPPING_WEB || 'http://localhost:5173'

/** Abre el menú de categorías y devuelve el panel lateral. */
async function openCategories(page) {
  await page.getByRole('button', { name: 'Abrir categorías', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Categorías del catálogo' })
  await panel.waitFor()
  // Espera a que termine la animación de entrada: el panel queda pegado al borde izquierdo.
  await page.waitForFunction(() => {
    const box = document.querySelector('[role="dialog"][aria-label="Categorías del catálogo"]')?.getBoundingClientRect()
    return box && Math.abs(box.x) < 1
  })
  return panel
}

module.exports = { loadPlaywright, secret, testAccount, openCategories, API, WEB }
