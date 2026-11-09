# API relacional local

Base `http://localhost:5156/api`. JSON UTF-8, cookie HttpOnly `shopping.session`, SameSite Strict; frontend con `credentials: include`. CORS localhost/127.0.0.1 en 5173 y 5174. OpenAPI en Development: `/openapi/v1.json`.

| Método | Ruta | Contrato |
|---|---|---|
| GET | `/health`, `/health/database` | Salud del proceso y conexión PostgreSQL |
| POST | `/auth/register` | rut, nombre, email, password, telefono, direccion, fechaNacimiento, rol y address con street/number/communeId. 201, sin Admin |
| POST | `/auth/login` | rut, password, remember; perfil y cookie |
| GET | `/auth/me` | Perfil público, sin hash |
| POST | `/auth/logout` | 204 |
| PUT | `/auth/password` | current, next; bcrypt y revocación de otras sesiones |
| GET | `/state` | revision, source=`public`, dataMode=`relational`, collections filtradas por identidad |
| PUT | `/state/transaction` | revision, changes, delta opcional y deleted opcional; validación y transacción |
| GET | `/{recurso}` o `/{recurso}/{id}` | revision e items/item |
| POST | `/{recurso}` | Objeto de creación; If-Match con revision |
| PUT | `/{recurso}/{id}` | Objeto actualizado completo; If-Match |
| DELETE | `/{recurso}/{id}` | If-Match; restricciones del dominio y SQL |
| POST | `/ventas/preview` | items, vendor, address, deliveryMode, payment; cálculo servidor |
| POST | `/ventas/checkout` | Mismo cuerpo más requestId único; stock/venta/líneas/envío/pago en una transacción |
| GET | `/reportes/ventas`, `/reportes/clientes`, `/reportes/logistica` | from, to, q, carrier; Admin o vendedor con datos propios |
| GET | `/admin/database/tables` | Tablas permitidas, solo Admin |
| GET/POST/PUT/DELETE | `/admin/database/tables/{tabla}` | Lectura hasta 100 filas; mutaciones con fields y key JSON; nunca devuelve passwd |
| GET | `/admin/database/queries` | Firmas de funciones analíticas verificadas |
| POST | `/admin/database/queries/{id}` | Array de parámetros, tipos validados; resultado SQL |
| PUT | `/admin/database/accounts/{rut}/password` | next; solo Admin |

Recursos: `catalogo`, `productos`, `servicios`, `usuarios`, `empresas`, `pedidos`, `cotizaciones`, `devoluciones`, `tarifas`, `categorias`, `mensajes`, `conversaciones`. Categorías jerárquicas se modifican mediante `/state/transaction`. Los IDs de catálogo tienen formato `P-ID-RUT` o `S-ID-RUT`: distinguen tipo y vendedor.

El cuerpo de checkout utiliza `items:[{id,dbId,sku,qty,price}]`, `vendor`, `address` perteneciente a la sesión, `deliveryMode` (Despacho/Retiro), `payment` y, cuando corresponde, cardLast4/transferCode. No enviar números completos de tarjeta. Los precios, IVA, descuentos, edad, stock y cotización se verifican en servidor. Un requestId repetido devuelve la misma compra.

401 sin sesión, 403 sin permisos, 400 al violar reglas, 409 ante revisión obsoleta, 429 por límite de autenticación. Los errores no devuelven conexiones ni contraseñas. La cuenta importada se consulta en Cliente/Emprendedor; shopping_ui guarda permisos y versiones de sesión. No hay semilla de cuentas de aplicación.

## Actualización para entrega_mejorada

API v4. La base de entrega local es shopping_twm_local; las pruebas usan shopping_verificacion_v2. GET /admin/database/queries devuelve parameters con name, type y optional. POST recibe un array posicional: los filtros jsonb se envían como objetos, el límite como entero o null. Por ejemplo fn_catalogo_unificado: [null,{},10]. Un parámetro opcional null/vacío omite el argumento y utiliza DEFAULT de PostgreSQL. Las listas como p_marcas se envían como arrays JSON, por ejemplo ["Visa","MasterCard"]. Las funciones conservan las reglas de negocio del SQL mejorado. Los errores de concurrencia 409 requieren recuperar revision antes de reintentar.
