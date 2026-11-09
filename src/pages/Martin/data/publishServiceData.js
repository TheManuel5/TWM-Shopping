// Datos de demostración basados en la pantalla "Publicar servicio" del Figma.
// No realizan consultas a un servidor.
export const servicioInicial = {
  nombre: 'Mantenimiento de computadores',
  tipo: 'Servicios',
  categoria: 'Computación y Tecnología',
  duracion: '90 minutos',
  edadMinima: '18 años',
  modalidad: 'En local',
  region: 'Los Lagos',
  comunas: ['Osorno', 'San Pablo', 'Puerto Octay', 'Purranque'],
  descripcion: 'Revisión, limpieza y optimización de computadores de escritorio y notebooks. Incluye limpieza interna, cambio de pasta térmica, revisión de hardware y software, y recomendaciones de uso.',
  precio: 35700,
  ofertaActiva: true,
  precioOferta: 29750,
  fechaInicio: '2026-10-18',
  fechaFin: '2026-10-31',
}

export const categoriasServicio = [
  'Computación y Tecnología',
  'Hogar y mantenimiento',
  'Salud y bienestar',
  'Educación y clases',
  'Belleza y cuidado personal',
  'Transporte y logística',
  'Otros servicios',
]

export const comunasPorRegion = {
  'Los Lagos': [
    'Osorno', 'San Pablo', 'Puerto Octay', 'Purranque', 'Río Negro',
    'Puerto Montt', 'Puerto Varas', 'Frutillar', 'Llanquihue', 'Castro',
    'Ancud', 'Quellón', 'Calbuco', 'Fresia',
  ],
  'Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Paillaco', 'Panguipulli', 'Los Lagos'],
  'La Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol'],
  Metropolitana: ['Santiago', 'Providencia', 'Las Condes', 'Maipú', 'Puente Alto'],
}

// Fotografías públicas de demostración. Requieren conexión a internet.
// El usuario puede eliminarlas y subir imágenes propias desde el formulario.
export const fotosIniciales = [
  {
    id: 'demo-1',
    nombre: 'Placa y componentes',
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'demo-2',
    nombre: 'Equipo de trabajo',
    src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'demo-3',
    nombre: 'Tecnología',
    src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'demo-4',
    nombre: 'Circuitos',
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
]
