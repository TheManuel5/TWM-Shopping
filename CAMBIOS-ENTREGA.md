# Cambios de la entrega local actual

- Integración de los cuatro SQL de entrega_mejorada, sin restaurar funciones antiguas encima del modelo nuevo.
- Corrección de las referencias a 00_repair_encoding.sql y 05_web_compatibility.sql que impedían compilar. Extensión web en backend/TWM.API/src/Config/web_compatibility.sql basada en las funciones nuevas; mantiene la protección de facturas pagadas.
- Creación de shopping_twm_local con los datos suministrados y shopping_verificacion_v2 para todas las operaciones de prueba. proyectobd se conserva. No se insertaron cuentas ni pedidos de pruebas en shopping_twm_local.
- Migración de 2000 credenciales importadas a bcrypt, conservando contraseñas. RUT existente 20.000.001-3 asignado como administrador local por elección del equipo.
- Reportes compatibles con las nuevas firmas: filtros jsonb, parámetros tipados, límite opcional y PDF. Contrato HTTP y Postman actualizados.
- Servicios respetan inactividad y disponibilidad. Árbol de categorías diferencia ramas con productos y servicios; metadatos de relacionados conservados en JSON del artículo.
- Ajustes visuales: cabecera de 64 px, menú lateral de 232 px, tamaños de títulos, proporciones del acceso, tabla de publicaciones con imagen/SKU/estado y métricas calculadas, cinco destacados y ficha de servicio con imagen principal y panel de compra/vendedor.
- Carrito corregido para acumular unidades y rechazar solo las que superan el stock. Prueba específica de acumulación agregada.
- Captura de eventos también en autenticación y transacciones API con redacción de secretos. Eliminada la creación automática de la antigua cuenta demo incluso en el módulo de simulación.
- Desactivación de usuarios conserva historial. La dirección personal del propietario se edita en Perfil y direcciones. No se permite crear una empresa con un propietario emprendedor inexistente.
- Restricciones adicionales en API: stock entero por variante, precio válido y atributos compartidos protegidos entre vendedores. Contraseñas limitadas por bytes UTF-8 para bcrypt.
- Instalador local reproducible, README, contrato de endpoints, ZIP de fuentes y evidencia de pruebas.

Las evidencias exactas de cada ejecución se encuentran en backend/test-results y frontend/test-results. Los datos generados de los TXT son la carga del equipo. La aplicación no conecta con un banco y no fabrica minutas o commits. Raspberry fuera del alcance actual.

## Pulido del frontend: categorías, seguridad y fotos

- Categorías abre un panel lateral izquierdo, con árbol expandible, búsqueda, pestañas de productos/servicios y filtros de servicios. Se corrigió la navegación con IDs numéricos que causaba una pantalla vacía; una categoría sin publicaciones muestra una explicación y permite volver al catálogo.
- Campos de cambio/restablecimiento de contraseña con controles individuales para mostrar u ocultar su contenido y límite de 72 bytes UTF-8.
- Selector único «Modo de uso» y permisos separados en el perfil. Cambiar la vista no concede permisos; Administrador requiere asignación explícita.
- Fotos con vista previa, elección de imagen principal, eliminación, arrastre, formatos y límites visibles. El marcador «Sin imagen registrada» no cuenta como fotografía.
- Acciones de compra adaptadas al móvil, colores con ajuste de línea y diálogos con espaciado uniforme. Protección visual para errores inesperados de las vistas.
- Estos ajustes no modifican los nombres ni los registros importados de la base de entrega.

## Ajuste al modelo de categorías solicitado

- Menú bajo la cabecera: Servicios y Productos en la columna izquierda, selección resaltada y subcategorías en panel contiguo. Selección por puntero, teclado o clic; en móvil se abre el detalle con botón Volver. Usa las categorías reales de PostgreSQL.
- Eliminado el bloque «Permisos de tu cuenta» del perfil; se conserva el selector funcional de modo.
- Consulta de solo lectura: un administrador (20.000.001-3), 1000 clientes, 1000 emprendedores y 100 RUT presentes en ambos conjuntos. No se cambiaron permisos.
- Evidencia actual del menú: frontend/test-results/category-reference.json y categorias-modelo-desktop/mobile.png. Sustituye las capturas anteriores del panel de categorías.

## Carga y acciones de la interfaz

- El aviso superior «Guardando» se sustituyó por una tarjeta discreta abajo, después de 450 ms; desaparece al confirmar la operación. Porcentaje de guardado solo para varias operaciones conocidas, calculado con operaciones terminadas/total; una petición única usa barra indeterminada.
- Carga inicial con Skeleton y porcentaje por dos etapas reales (sesión, datos), sin temporizadores que simulen descarga. Errores permiten reintentar.
- No se envía una transacción si los datos son idénticos a la caché actual.
- Botones principales con el violeta #602ff7; colores antiguos de pedidos unificados. Estado vacío de favoritos con icono, explicación y acción principal visible.
- Comprobaciones: frontend/test-results/loading-polish.json. Transacciones interceptadas en el navegador, cero escrituras de prueba en PostgreSQL.

## Fotografías referenciales autorizadas

Siete fotografías Pexels WebP guardadas dentro del frontend, con fuentes y licencia. Correspondencia por categorías reales, sin reemplazar fotografías propias ni escribir referencias en PostgreSQL. Etiqueta «Imagen referencial» en catálogo, destacados, favoritos y fichas cuando aplica. Miniaturas administrativas y carrito usan el mismo selector de imagen. Corregido además el texto alternativo fijo de la ficha de producto para usar el nombre real de la publicación.

Prueba unitaria específica de prioridad de fotos propias, deduplicación de galería, categorías y ausencia de mutaciones. Total: 14 pruebas de dominio.
