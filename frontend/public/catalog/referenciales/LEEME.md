# Fotografías referenciales del catálogo

Siete fotografías descargadas de Pexels, optimizadas a WebP desde su CDN. Fuentes individuales y licencia en fuentes.json. Licencia: https://www.pexels.com/license/ . No se presenta a las personas fotografiadas como prestadores reales ni se implica su respaldo a la aplicación.

Uso: representación ilustrativa por categoría, identificada como «Imagen referencial». No son fotografías verificadas del artículo vendido ni del vendedor. Pueden repetirse en varias publicaciones de la misma categoría.

La asociación está en frontend/src/utils/catalogImages.js. Se aplica únicamente al mostrar la interfaz; no modifica los SQL ni almacena estas referencias en PostgreSQL. Las fotos propias tienen prioridad, incluso si la imagen principal anterior era el marcador sin imagen.

Este directorio se copia automáticamente a dist/catalog/referenciales al compilar. Para trasladar a otro PC o Raspberry se debe llevar la aplicación compilada completa. No depende de Internet para mostrar estas fotos.
