# TWM Shopping

Marketplace de productos y servicios para compradores, vendedores y administradores. Proyecto del curso Tecnologías Web y Móviles (Universidad de Los Lagos).

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, Material UI, Vite |
| Backend | API .NET 10 con autenticación por cookie |
| Base de datos | PostgreSQL 15 o posterior |

## Contenido

- [Funcionalidad](#funcionalidad)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Cuentas y permisos](#cuentas-y-permisos)
- [Base de datos](#base-de-datos)
- [Fotografías del catálogo](#fotografías-del-catálogo)
- [Verificación](#verificación)
- [Rendimiento](#rendimiento)
- [Seguridad](#seguridad)
- [Alcance y limitaciones](#alcance-y-limitaciones)
- [Entrega académica](#entrega-académica)

## Funcionalidad

- **Cuentas:** registro e inicio de sesión por RUT, perfil y múltiples direcciones.
- **Roles:** comprador, vendedor y administrador, con un «Modo de uso» para alternar entre ellos.
- **Navegación:** menú lateral de categorías por niveles, con vuelta al menú principal y accesos a la cuenta.
- **Catálogo:** jerárquico y paginado, con productos, servicios, variantes, stock, ofertas y relacionados.
- **Compra:** favoritos, carrito, cotizaciones y compra idempotente.
- **Postventa:** estados de pedido, seguimiento, devoluciones parciales, reseñas de compras entregadas, preguntas y respuestas, y mensajería.
- **Paneles:** panel personal de compras y ventas por cuenta, y panel de administración general con directorio de usuarios.
- **Reportes:** reportes comerciales, funciones SQL con parámetros y filtros JSON, exportación a PDF y administración de las tablas `public`.

La interfaz se adapta a móvil, muestra Skeleton durante la carga y mensajes visibles ante errores y conflictos.

## Estructura del repositorio

| Ruta | Contenido |
| --- | --- |
| `frontend/` | Aplicación React |
| `backend/TWM.API/` | API .NET |
| `backend/scripts/` | Scripts de base de datos y de verificación |
| `backend/API.md` | Contrato de rutas HTTP |
| `backend/Shopping.postman_collection.json` | Colección Postman |
| `database/` | Los cuatro SQL del equipo: tablas, funciones, triggers e inserts |
| `minuta/` | Minutas semanales |
| `*.ps1` (raíz) | Instalación, arranque y administración local |

### Organización del backend

| Carpeta en `backend/TWM.API/src` | Contenido |
| --- | --- |
| `Config` | Lectura del archivo `.env` y SQL de compatibilidad web |
| `Controllers` | Endpoints HTTP; reciben y devuelven DTOs |
| `Dtos` | Contratos de entrada y salida de la API, con validaciones en español |
| `Middlewares` | Errores uniformes (`ErrorResponse`) y validación de DTOs |
| `Models` | Constantes del dominio, como los roles |
| `Routes` | Rutas mínimas de salud |
| `Services` | Lógica de negocio y acceso a PostgreSQL |
| `Utils` | Utilidades de sesión |

## Requisitos

- PostgreSQL 15 o posterior, con `psql` disponible
- SDK de .NET 10
- Node.js 22.12 o superior
- Windows PowerShell (los scripts de la raíz son `.ps1`)

## Instalación

1. Crear `backend/TWM.API/.env` a partir de `.env.example` y configurar host, puerto, usuario y contraseña de PostgreSQL.
2. Crear `frontend/.env` a partir de `frontend/.env.example`.
3. Instalar dependencias y crear la base:

```powershell
npm --prefix frontend ci
.\Install-LocalDatabase.ps1 -Database shopping_twm_local -AdministratorRut '20.000.001-3'
```

El instalador crea una base **nueva**, importa los cuatro SQL en UTF-8 deteniéndose al primer error y convierte a bcrypt los hashes reconocidos de la carga. Puede tardar varios minutos. No reemplaza bases existentes.

Los archivos `.env` son privados y no se versionan.

## Ejecución

```powershell
.\Start-Local.ps1
```

| Servicio | Dirección |
| --- | --- |
| Aplicación | http://localhost:5173 |
| Estado de la API | http://localhost:5156/api/health |
| Estado de la base | http://localhost:5156/api/health/database |

- Usar siempre `localhost` (no `127.0.0.1`) para conservar la cookie de sesión.
- `.\Stop-Local.ps1` detiene los procesos que registró el iniciador.
- Si otra API ocupa el puerto 5156, cerrarla antes de iniciar.

## Cuentas y permisos

Las cuentas provienen de los SQL del equipo; la aplicación no crea cuentas de demostración.

- Una cuenta puede tener permiso de comprador y de vendedor a la vez.
- Administrador es un permiso adicional que se asigna expresamente.
- «Modo de uso» elige una sola vista y sus acciones; no crea cuentas ni otorga permisos.

La cuenta de administración elegida por el equipo es **20.000.001-3**, con los tres permisos. Antes de usarla o compartir acceso, definir una contraseña propia:

```powershell
.\Set-Password.ps1 -Rut '20.000.001-3'
```

El script pide la contraseña de forma privada. Para asignar administración a otro RUT existente:

```powershell
.\Set-Administrator.ps1 -Rut RUT_EXISTENTE
```

### Paneles

- **Panel personal** («Mi panel personal» en Modo de uso): compras, importes, estados y devoluciones para compradores; ventas, publicaciones e inventario para vendedores. Filtra por el RUT de la sesión y la API limita la visibilidad.
- **Administración general** (`/admin/dashboard`): estadísticas globales y lista de usuarios en `/admin/usuarios`, con búsqueda y filtros por rol y estado.

## Base de datos

- La base que usa la API es la configurada en `backend/TWM.API/.env`. El nombre por defecto del instalador es `shopping_twm_local`.
- En el PC de desarrollo, sobre `proyectobd`, la migración de cuentas antiguas al formato canónico del navegador (`dotnet run --project backend/TWM.API -- --migrate-transport-hashes`, con `--dry-run` previo) convirtió 1998 cuentas con respaldo previo. Tres filas no pudieron verificarse con la carga original (RUT 20.000.001-3, 20.000.002-1 y 44.444.444-4); si no entran, el administrador les asigna una contraseña en Administración.
- Al arrancar, la API valida el modelo y crea el esquema `shopping_ui` (permisos, carrito, preferencias y metadatos web). Luego aplica `backend/TWM.API/src/Config/web_compatibility.sql`.
- El arranque no ejecuta los inserts ni modifica los cuatro SQL originales.
- Las cotizaciones se mantienen cada minuto mientras la API está activa: precio fijo 15 días, ajustes semanales posteriores y purga a los 45 días.

## Fotografías del catálogo

Los SQL importados no incluyen fotografías. Para las siete categorías sin fotos propias, el catálogo muestra imágenes referenciales de `frontend/public/catalog/referenciales/`, etiquetadas como tales. No representan el artículo exacto. Las fotos propias siempre tienen prioridad.

- Asociación por categoría: `frontend/src/utils/catalogImages.js`
- Fuentes y licencias: `frontend/public/catalog/referenciales/fuentes.json`

Para agregar fotos propias: Vendedor → Catálogo (CRUD) → editar la publicación → Fotos de la publicación → Seleccionar fotos → Guardar cambios. Se admiten hasta cinco imágenes JPG, PNG o WEBP de 5 MB cada una; la primera es la principal.

## Verificación

```powershell
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
dotnet build backend/TWM.API/TWM.API.csproj -c Release -p:UseSharedCompilation=false
```

- Las pruebas unitarias del frontend usan memoria y no tocan PostgreSQL.
- Las pruebas de escritura (`backend/scripts/relational-integration.cjs`, `roles-crud-check.cjs`, `service-verification.cjs`, `final-contract-check.cjs`) se ejecutan **solo** contra la base aislada `shopping_verificacion_v2`, con la API en el puerto 5157. No ejecutarlas sobre la base de entrega.
- `npm --prefix frontend run test:connected` recorre las pantallas en el navegador contra la API aislada; requiere Chrome y Playwright.
- Las evidencias quedan en `backend/test-results` y `frontend/test-results`.

### Pruebas de integración y de navegador

Ninguna contraseña está escrita en los scripts: se entregan por variables de entorno.

| Variable | Uso |
| --- | --- |
| `SHOPPING_TEST_PASSWORD` | Contraseña de la cuenta de administración de pruebas (obligatoria) |
| `SHOPPING_BUYER_PASSWORD`, `SHOPPING_SELLER_PASSWORD` | Cuentas solo comprador y solo vendedor, para `account-admin-check.cjs` |
| `PLAYWRIGHT_PATH` | Ruta de Playwright si no está instalado en el proyecto |

```powershell
# 1. API aislada en el puerto 5157 (base shopping_verificacion_v2)
dotnet build backend/TWM.API/TWM.API.csproj -c Release -o backend/build-check
.\backend\scripts\start-verification-current.ps1

# 2. En otra terminal
$env:SHOPPING_TEST_PASSWORD = 'la contraseña de la cuenta de pruebas'
node backend/scripts/relational-integration.cjs
node backend/scripts/roles-crud-check.cjs

# 3. Comprobaciones de navegador de solo lectura, contra la app en 5173
node frontend/scripts/category-reference-check.cjs
node frontend/scripts/polish-browser-check.cjs
```

`backend/Shopping.postman_collection.json` incluye las operaciones GET, POST, PUT y DELETE. La carpeta «CRUD con PUT y DELETE» crea, actualiza y retira un producto; úsala con `baseUrl` apuntando a la API aislada.

### Formato del código

El backend se formatea con CSharpier (herramienta local declarada en `backend/dotnet-tools.json`):

```powershell
dotnet tool restore --tool-manifest backend/dotnet-tools.json
dotnet csharpier format backend/TWM.API
```

## Rendimiento

- La API guarda en memoria el estado ya armado desde PostgreSQL y lo reutiliza mientras no cambien la revisión de la aplicación, la fecha ni el contador de filas modificadas de la base. Caduca a los dos minutos.
- Carrito, favoritos, vendedor y comuna elegidos se guardan por una vía rápida que no reconstruye el estado.
- Catálogo, pedidos, inventario, despachos, devoluciones, cotizaciones y mensajes se muestran por bloques con un botón «Ver más».
- La pantalla de carga y el inicio de sesión muestran el avance de 0 a 100 %: la descarga se mide en bytes reales y la espera del servidor se estima con la duración de la carga anterior.

Más detalle en [VERIFICACION-ENTREGA.md](VERIFICACION-ENTREGA.md) y [CAMBIOS-ENTREGA.md](CAMBIOS-ENTREGA.md).

## Seguridad

- Contraseñas almacenadas con bcrypt.
- Sesión en cookie HttpOnly con SameSite estricto.
- Límite de intentos en inicio de sesión y registro.
- Los logs omiten contraseñas, hashes, tokens y otros campos sensibles. El evento `[Shopping] Inicio de sesión` de la consola del navegador solo muestra el algoritmo, el costo y un formato enmascarado.

## Alcance y limitaciones

- Los cobros y reembolsos se **registran**; no hay pasarela bancaria.
- Los comprobantes PDF son documentos internos, no documentos tributarios.
- Los registros «Producto N» y «Cliente N» y las reseñas de la carga provienen de los SQL del equipo; la aplicación no agrega catálogo ficticio.
- El despliegue en Raspberry queda para la siguiente etapa.

## Entrega académica

- Referencia visual: `Tarea Grupa N°02.pdf` (Figma, 34 vistas). Se conserva la paleta violeta, la cabecera oscura y la composición de las pantallas. El PDF original pesa unos 131 MB y se entrega por separado si se solicita.
- `entrega/TWM-Shopping-local.zip` es una copia transportable de fuentes, SQL, scripts, documentación y evidencias. No incluye `.env`, claves, respaldos ni dependencias. Para usarla, extraerla en una carpeta nueva y seguir este README.
- Las minutas y la participación en Git reflejan el trabajo real del equipo.
