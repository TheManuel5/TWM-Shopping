# TWM Shopping — entrega local

Aplicación React + Material UI, API .NET 10 y PostgreSQL. La configuración local utiliza **shopping_twm_local**, cargada desde los cuatro SQL de `database`, correspondientes a `entrega_mejorada`. La base anterior `proyectobd` se conserva y no se usa para la entrega actual.

## Ejecutar en este PC

```powershell
.\Start-Local.ps1
```

Abrir http://localhost:5173. API en http://localhost:5156/api/health; conexión en `/api/health/database`. Usar siempre localhost para conservar la cookie. `Stop-Local.ps1` detiene los procesos registrados por el iniciador. Si otra API ocupa 5156, cerrar su ejecución en Visual Studio antes de iniciar esta versión.

Cuenta existente elegida por el equipo: **20.000.001-3**. Su contraseña de la carga original es `hash-demo-cliente-1`. Tiene permiso Admin y perfiles de comprador/vendedor. Cambiarla desde Perfil antes de compartir acceso. No es una cuenta nueva creada por la aplicación. Las 2000 credenciales importadas en la base local están almacenadas con bcrypt. No se registran contraseñas en consola.

## Instalar en otro PC

Requisitos: PostgreSQL 15 o posterior y sus herramientas psql, SDK .NET 10, Node 22.12 o superior. Crear `backend/TWM.API/.env` copiando `.env.example`; configurar host, puerto, usuario y contraseña de PostgreSQL. Crear `frontend/.env` desde `.env.example`. No compartir estos archivos privados.

```powershell
npm --prefix frontend ci
.\Install-LocalDatabase.ps1 -Database shopping_twm_local -AdministratorRut '20.000.001-3'
.\Start-Local.ps1
```

El instalador crea una **base nueva**, importa create_tables, funciones, triggers e inserts en UTF-8 con detención al primer error y convierte a bcrypt los hashes reconocidos de la carga. La importación y conversión pueden tardar varios minutos. No reemplaza bases existentes. Si la base ya está importada, configurar su nombre en `.env` y usar los scripts de contraseña/administrador según corresponda.

```powershell
.\Set-Administrator.ps1 -Rut RUT_EXISTENTE
.\Set-Password.ps1 -Rut RUT_EXISTENTE
```

El segundo script solicita la contraseña de forma privada. La inicialización de .NET valida el modelo mejorado y crea `shopping_ui`, con permisos, carrito, preferencias y metadatos web. Aplica `backend/TWM.API/src/Config/web_compatibility.sql`, construido a partir de las funciones mejoradas: conserva la protección de facturas pagadas y añade cotizaciones de servicios, precio de cotización aceptada y visibilidad por vendedor. No restaura funciones de la antigua entrega ni ejecuta los inserts al arrancar.

## Funcionalidad y diseño

Login/registro por RUT, roles comprador/vendedor/Admin, perfil y múltiples direcciones, catálogo jerárquico paginado, publicaciones de productos y servicios, variantes, stock, ofertas, relacionados, favoritos, carrito, cotizaciones, compra idempotente, estados de pedidos, seguimiento, devoluciones parciales, preguntas/respuestas, reseñas de compras entregadas y mensajería. Reportes comerciales y funciones SQL con parámetros y filtros JSON, exportación PDF y administración de las tablas public.

Referencia visual: `Tarea Grupa N°02.pdf`. Se conserva la paleta violeta, cabecera oscura, tarjetas claras, jerarquía de textos y composición de las pantallas. La interfaz se adapta a móvil; las tablas pueden desplazarse dentro de su contenedor. Skeleton en carga y mensajes visibles para errores y conflictos.

Los registros “Producto N”, “Cliente N”, fotografías ausentes y reseñas de la carga provienen de los SQL del equipo. La app no agrega catálogo ficticio. Una imagen ausente muestra “Sin imagen registrada”; puede cargarse desde los formularios. Los cobros y reembolsos se **registran**, sin pasarela bancaria. Los comprobantes PDF son documentos internos, no documentos tributarios emitidos.

## Verificación y evidencias

```powershell
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
dotnet build backend/TWM.API/TWM.API.csproj -c Release -p:UseSharedCompilation=false
```

Los tests unitarios utilizan memoria. Las pruebas de escritura se ejecutan únicamente en `shopping_verificacion_v2`, API 5157. No ejecutarlas sobre la base de entrega. Scripts: relational-integration.cjs, roles-crud-check.cjs y service-verification.cjs en backend/scripts. El navegador `npm --prefix frontend run test:connected` recorre pantallas y verifica reportes contra la API aislada; requiere Chrome/Playwright.

Evidencias en backend/test-results y frontend/test-results. Las capturas `pantalla-*.png` permiten revisar el diseño por ruta. `backend/API.md` documenta rutas y `Shopping.postman_collection.json` permite probarlas. La cookie HttpOnly se conserva automáticamente en Postman.

El mantenimiento de cotizaciones se ejecuta cada minuto mientras la API está activa: precio fijo 15 días, ajustes semanales posteriores y purga a los 45 días conforme a las reglas SQL. Los logs de eventos de formularios omiten contraseñas, hashes, tokens y otros campos sensibles.

## Entrega académica

Incluye código frontend/backend, cuatro SQL de BDA, extensión de conexión web, scripts locales, contratos HTTP y evidencias. Minutas y participación Git deben reflejar el trabajo real del equipo; no se generan reuniones ni commits ficticios. Raspberry se prepara en la siguiente etapa por indicación del equipo.

El PDF original de Figma permanece en la carpeta de trabajo. El ZIP incluye una lámina de sus 34 vistas y capturas de la implementación; el PDF original de aproximadamente 131 MB se entrega por separado si lo solicitan.

## Modos de uso y fotografías

Una cuenta puede tener permiso de comprador y vendedor. Administrador es un permiso adicional asignado expresamente; la cuenta local 20.000.001-3 tiene los tres permisos por elección del equipo. «Modo de uso» selecciona una sola vista y sus acciones disponibles, sin crear otras cuentas ni otorgar permisos.

Para agregar fotos: selecciona Vendedor → Catálogo (CRUD) → lápiz de edición de la publicación → Fotos de la publicación → Seleccionar fotos (o arrastrar archivos) → Guardar cambios. La primera imagen es la principal; puedes cambiarla. Admite hasta cinco JPG, PNG o WEBP de hasta 5 MB cada una. La vista previa no se guarda hasta confirmar el formulario. Los SQL importados no incluyen fotografías: «Sin imagen registrada» señala esa ausencia, no un error de conexión. La app conserva las fotos en los metadatos de la publicación al guardar mediante la API.

## Uso del ZIP de entrega

`entrega/TWM-Shopping-local.zip` es una copia transportable de las fuentes del frontend y backend, SQL, scripts de instalación/arranque, documentación y evidencias. No incluye contraseñas locales `.env`, claves, respaldos privados ni dependencias instaladas. No necesitas extraerlo sobre esta carpeta para continuar trabajando. Puedes entregarlo si solicitan un archivo o extraerlo en una carpeta nueva de otro PC y seguir este README para configurar PostgreSQL y las dependencias. No reemplaza el enlace GitHub ni las minutas reales solicitadas por el profesor. Los datos actuales de PostgreSQL no son un respaldo del ZIP: contiene los scripts SQL de carga del equipo.

## Fotos referenciales incluidas

El catálogo muestra fotografías locales de `frontend/public/catalog/referenciales/` para las siete categorías importadas que no tienen fotos propias. La asociación automática se define en `frontend/src/utils/catalogImages.js`. Las fotografías referenciales llevan esa etiqueta y pueden repetirse por categoría; no representan el artículo exacto ni al prestador real. Las fotos propias siempre tienen prioridad. No es necesario importar IDs o modificar PostgreSQL.

Fuentes y licencia en `frontend/public/catalog/referenciales/fuentes.json`. El paquete `entrega/TWM-fotos-referenciales.zip` contiene las siete fotos, fuentes e instrucciones; ya están incluidas en el proyecto y no hace falta extraer el ZIP para usarlas. Vite las copia al compilar para que se sirvan localmente también al trasladar el sistema.
