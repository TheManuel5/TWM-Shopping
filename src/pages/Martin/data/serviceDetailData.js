// Datos ficticios para la pantalla Detalle de servicio.
// No existe integración con un proveedor, chat ni sistema de reservas.
export const detalleServicio = {
  nombre: 'Reparación y mantenimiento de computadores',
  categoria: 'Computación y Tecnología',
  proveedor: 'Tecnología Austral',
  calificacion: 4.8,
  opiniones: 126,
  ubicacion: 'Osorno',
  verificada: true,
  descripcionCorta:
    'Servicio técnico especializado en notebooks y PC de escritorio. Diagnóstico, mantención y solución de fallas de hardware y software.',
  descripcion:
    'Realizamos diagnóstico, mantención y reparación de computadores, notebooks y all in one. Solucionamos fallas de hardware y software, con garantía de servicio.',
  edadMinima: '18 años',
  servicios: [
    { id: 'diagnostico', nombre: 'Diagnóstico y mantenimiento', duracion: '90 minutos', precio: 29750 },
    { id: 'limpieza', nombre: 'Limpieza preventiva', duracion: '60 minutos', precio: 19990 },
    { id: 'reparacion', nombre: 'Reparación de hardware', duracion: '120 minutos', precio: 45990 },
  ],
  incluye: [
    'Diagnóstico completo del equipo',
    'Limpieza interna y cambio de pasta térmica',
    'Revisión y testeo de componentes',
  ],
  pasos: [
    {
      titulo: '1. Contrata el servicio',
      descripcion: 'Selecciona la fecha y horario que mejor se adapte a tus necesidades.',
    },
    {
      titulo: '2. Diagnóstico y trabajo',
      descripcion: 'Nuestro equipo realiza el diagnóstico y ejecuta el mantenimiento en el horario acordado.',
    },
    {
      titulo: '3. Entrega y seguimiento',
      descripcion: 'Recibes tu equipo listo y un reporte del trabajo realizado para tu tranquilidad.',
    },
  ],
  resenas: [
    { id: 1, nombre: 'Camila Rojas', fecha: '14 sep. 2026', puntuacion: 5, comentario: 'Muy buena atención. Mi notebook quedó funcionando mucho mejor.' },
    { id: 2, nombre: 'Matías Torres', fecha: '8 sep. 2026', puntuacion: 5, comentario: 'El diagnóstico fue claro y entregaron el equipo a tiempo.' },
    { id: 3, nombre: 'Valentina Soto', fecha: '29 ago. 2026', puntuacion: 4, comentario: 'Buen servicio y explicaciones detalladas de la reparación.' },
  ],
}
