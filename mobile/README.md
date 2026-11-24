# Shopping móvil

Aplicación React Native con Expo SDK 58 y Expo Router, a partir de la plantilla compartida en main. Esta rama implementa la navegación y el catálogo de Jheferson. Reutiliza la API .NET y PostgreSQL; no modifica el backend ni los módulos web.

## Ejecutar en Expo Go

Requisitos: Node.js 22.13 o posterior (verificado con Node 24), .NET 10, PostgreSQL con los datos del proyecto y Expo Go compatible con SDK 58.

Desde mobile:

```powershell
npm ci
```

En una terminal, detener cualquier API anterior que ocupe el mismo puerto e iniciar la API para la red local:

```powershell
.\scripts\start-backend.ps1
```

En otra terminal, desde mobile:

```powershell
npx expo start --go
```

Escanear el QR en Expo Go para Android. El teléfono y la computadora deben compartir red. La app deduce la dirección del servidor Expo y utiliza el puerto API 5156. Si Expo usa un túnel o la API está en otra computadora, crear .env.local con la IP real de la computadora del backend:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5156/api
```

Reiniciar Expo después de cambiarla. localhost en el teléfono se refiere al teléfono, no al PC. La red debe permitir acceder a 5156. Nunca incluir contraseñas ni conexiones PostgreSQL en variables EXPO_PUBLIC.

El script inicia la API con 0.0.0.0:5156 y permite el origen web http://localhost:8081 únicamente en su proceso. No edita Program.cs, appsettings ni el .env privado; restaura las variables al salir. Para otro puerto usar -Port 5158 y configurar ese puerto también en la app. La vista web se abre con npm run web; si Expo elige otro puerto, indicarlo al script con -WebPort.

## Alcance de Jheferson

- Cinco accesos inferiores: Inicio, Categorías, Publicar, Mis productos y Mi cuenta.
- Inicio con búsqueda, categorías, publicaciones reales y acceso a servicios.
- Categorías y subcategorías a partir de IDs y children reales. Se conserva el grupo Productos o Servicios, incluso si comparten una categoría.
- Catálogo con búsqueda sin acentos, tipo, disponibilidad, rango de precios y orden. Se muestran bloques de 20 elementos. La API actual entrega el estado completo; la paginación de pantalla es local.
- Detalles de producto y servicio, galería, variantes, stock, cantidad, precio, vendedor y relacionados.
- Reseñas y preguntas, resumen de valoraciones y formularios validados. Los envíos necesitan la sesión que integrará Samuel. El servidor comprueba permisos y compra entregada. Un conflicto 409 recupera el estado y permite reintentar sin duplicar automáticamente el envío.
- Estados de carga, error, reintento, catálogo vacío y publicación inexistente.

Las imágenes de categoría reutilizadas de la web se identifican como referenciales; nombres, precios, stock y opiniones provienen del servidor. No se inventan ventas ni valoraciones.

## Rutas e integración

| Ruta                                          | Responsable o contrato                                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| / y /categorias                               | Jheferson                                                                                                                  |
| /categoria/[id]                               | Jheferson; recibe id y group                                                                                               |
| /catalogo                                     | Jheferson; recibe q, category (ID), group, type (Producto o Servicio)                                                      |
| /producto/[id], /servicio/[id], /resenas/[id] | Jheferson; ID completo como P-1-20000001-3                                                                                 |
| /cuenta                                       | Entrada para autenticación y perfil de Samuel y Gaby                                                                       |
| /carrito                                      | Entrada de Gaby; recibe productId, sku, quantity. El receptor valida contra servidor; navegar todavía no guarda una compra |
| /mensajes                                     | Entrada de Rolando; recibe productId y sellerRut                                                                           |
| /publicar y /mis-productos                    | Entradas de Manuel                                                                                                         |

Las entradas de otros módulos indican que están pendientes; no simulan operaciones guardadas. Se reemplazan al integrar sus PR. Esta rama no implementa login, carrito ni administración.

src/app contiene rutas y layouts. Los detalles viven en el Stack raíz para mantener historial de navegación; las cinco pantallas principales están en (tabs). El contenido del catálogo está en src/features/catalog. Los componentes y colores comunes están en src/components/shopping y src/theme/shopping.ts.

Samuel mantiene src/services/api. Para conectar su cliente sin reescribir pantallas, registrar configureCatalogTransport desde src/features/catalog/gateway.ts antes de montar CatalogProvider. Recibe una función genérica de ruta relativa y RequestInit, y devuelve JSON; debe conservar cookies y propagar errores con status y cancelación. El adaptador actual usa fetch con credenciales y timeout; no implementa autenticación. Tras iniciar o cerrar sesión, llamar useCatalog().refresh(). La persistencia de cookies debe verificarse en Android con el módulo de Samuel.

Jheferson mantiene layouts y nombres de rutas. Los demás añaden implementaciones en sus carpetas de features y sustituyen su ruta de entrada. Coordinar dependencias y archivos compartidos antes de modificarlos.

## Comprobaciones

```powershell
npm run lint
npm run typecheck
npm test
npx expo-doctor
npx expo export --platform android --output-dir dist-android
```

Las pruebas verifican jerarquía por IDs, filtros combinados, disponibilidad de productos frente a servicios, orden sin mutar datos y descuentos. El bundle Android no sustituye una prueba en teléfono. Antes del PR, comprobar en Expo Go: inicio, categorías, subcategoría, catálogo, detalle y reseñas; búsqueda sin resultados; filtros; volver; variantes agotadas; sin conexión y reintento. Los formularios autenticados se validan al integrar la sesión de Samuel.
