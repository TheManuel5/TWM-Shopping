# Verificación de la entrega local

## Evidencias funcionales

| Requisito | Implementación y evidencia |
|---|---|
| React/MUI, navegación y diseño | 21 rutas autenticadas, acceso/registro y capturas por ruta; referencia de 34 páginas en Tarea Grupa N°02.pdf. Paleta violeta, cabecera, tarjetas y distribución revisadas. |
| Responsive y Skeleton | 7 pantallas a 390 px sin desbordamiento horizontal; Skeleton durante la carga real. Etiquetas de servicio ajustadas para envolver en móvil. |
| Formularios y CRUD | Pruebas de registro con dirección, productos y servicios C/R/U/D, edición de empresa/contactos y edición/desactivación de usuarios en copia aislada. |
| Bcrypt | 2000 credenciales de la carga convertidas y ninguna credencial sin bcrypt en shopping_twm_local. Nuevos registros y cambios de contraseña usan bcrypt. |
| Eventos console.log | Registro, acceso, contraseña y transacciones API con redacción de secretos en localStore.logEvent. |
| Permisos | Bloqueo de administración y catálogo ajeno para comprador; cuentas inactivas no pueden acceder; estados de cotización admiten rol dual. |
| Compra y stock | Neto/IVA/envío SQL, stock descontado una sola vez, idempotencia y rechazo de precios manipulados. |
| Devoluciones | Solicitud parcial, aprobación y reposición exacta por triggers. |
| Cotizaciones | Productos y servicios, aceptación/compra y bloqueo de reutilización. Pruebas SQL de vigencia, ajuste semanal y purga. |
| Mensajería y preguntas | Persistencia en las tablas importadas y respuestas comprobadas por API. |
| Reportes | Parámetros JSON, fechas predeterminadas, listas de marcas y límite. Consulta y exportación PDF desde la interfaz. |
| Documentos | Cotización, comprobante y reporte descargados; contenido revisado. Importes netos por línea evitan diferencias de redondeo de precios unitarios con IVA. |
| SQL mejorado | pruebas.txt del equipo ejecutado con éxito en shopping_verificacion_v2 y ROLLBACK final. |
| Entrega reproducible | Install-LocalDatabase, Start/Stop-Local, .env.example, contrato API, Postman y ZIP de fuentes sin secretos. |

## Archivos de evidencia

- backend/test-results/relational-integration.json
- backend/test-results/roles-crud.json
- backend/test-results/final-contract.json
- backend/test-results/service-integration.json
- backend/test-results/pruebas-sql-mejoradas.log
- backend/test-results/local-delivery.json
- frontend/test-results/relational-browser.json
- frontend/test-results/documents-final.json
- frontend/test-results/pantalla-*.png y capturas locales finales

Los logs de pruebas utilizan la copia aislada. Los nombres generados y las imágenes ausentes de la carga no se sustituyen por datos inventados. Los comprobantes son internos y no implican cobros bancarios.

Las minutas y participación del equipo en GitHub se entregan con evidencia real. La versión local no acredita todavía la configuración Raspberry, pospuesta por el equipo. La valoración de fidelidad visual y la nota final corresponden al profesor; las capturas permiten revisarlas antes del despliegue.

## Verificación del pulido de interfaz

`frontend/test-results/frontend-polish.json`: cinco recorridos de comprobación aprobados y cero errores de JavaScript: mostrar/ocultar contraseñas y coincidencia, panel izquierdo y categoría vacía, subcategorías con IDs numéricos y búsqueda, foto con vista previa y cancelación, panel móvil y producto sin desbordamiento. Ejecución contra la API local y carga importada; no se enviaron formularios de modificación ni se cambiaron contraseñas o publicaciones. Capturas `pulido-*.png` (excluyendo la captura de diagnóstico `pulido-fallo.png`).

Lint, 13 pruebas unitarias y compilación de producción aprobados. Vite mantiene un aviso de tamaño del paquete JavaScript; no impide compilar ni navegar.

La revisión posterior según la nueva referencia de categorías está en `frontend/test-results/category-reference.json`: cinco comprobaciones aprobadas (perfil, menú bajo cabecera, panel contiguo, categoría vacía, móvil/Volver/Escape) y cero errores JavaScript. Capturas vigentes: `categorias-modelo-desktop.png` y `categorias-modelo-mobile.png`.

Carga y guardado: `frontend/test-results/loading-polish.json` registra cinco comprobaciones aprobadas y cero errores JavaScript. Se verificó carga por etapas, indicador de guardado fuera de la cabecera y su desaparición, botón principal violeta, omisión de escrituras sin cambios y ancho móvil. Las escrituras de esta prueba fueron interceptadas, sin alterar la base. Capturas: carga-inicial-progreso.png, guardado-discreto.png, favoritos-moderno.png.

## Fotografías referenciales

`frontend/test-results/catalog-photos.json`: 3004 publicaciones leídas de la API local, 3004 cubiertas con fotografías (3002 referencias y 2 imágenes propias conservadas), siete categorías. Navegador con la instantánea real de PostgreSQL, sin escrituras. Comprobados catálogo, ficha de producto, ficha de servicio, etiqueta referencial y vista móvil; cero errores JavaScript. Contacto visual de las siete fotos: fotos-paquete.png. Lint, 14 pruebas de dominio y compilación aprobados.
