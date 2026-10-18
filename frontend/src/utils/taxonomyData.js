// Taxonomía oficial de categorías jerárquicas (Sección 1.2 del PDF y Pantalla P02)
export const CATEGORY_TREE = {
  Productos: [
    {
      id: '2.1',
      name: 'Tecnología',
      icon: 'LaptopMac',
      children: [
        { id: '2.1.1', name: 'Computación' },
        { id: '2.1.2', name: 'Audio y Música' },
        { id: '2.1.3', name: 'Juegos y consolas' },
        { id: '2.1.4', name: 'Electrónica y Televisión' },
        { id: '2.1.5', name: 'Otros' },
      ],
    },
    { id: '2.2', name: 'Celulares', icon: 'Smartphone', children: [] },
    { id: '2.3', name: 'Hogar y Cocina', icon: 'Kitchen', children: [] },
    { id: '2.4', name: 'Alimentación', icon: 'Restaurant', children: [] },
    { id: '2.5', name: 'Accesorios para vehículos', icon: 'DirectionsCar', children: [] },
    { id: '2.6', name: 'Libros e instrumentos musicales', icon: 'MenuBook', children: [] },
    {
      id: '2.7',
      name: 'Ropa, moda y calzado',
      icon: 'Checkroom',
      children: [
        { id: '2.7.1', name: 'Ropa' },
        { id: '2.7.2', name: 'Calzado' },
        { id: '2.7.3', name: 'Accesorios' },
      ],
    },
    { id: '2.8', name: 'Juguetes y Niños', icon: 'Toys', children: [] },
    { id: '2.9', name: 'Útiles y librería', icon: 'Edit', children: [] },
    { id: '2.10', name: 'Otros', icon: 'GridView', children: [] },
  ],
  Servicios: [
    {
      id: '1.1',
      name: 'Computación y Tecnología',
      children: [
        { id: '1.1.1', name: 'Soporte técnico y reparación' },
        { id: '1.1.2', name: 'Redes e instalaciones' },
      ],
    },
    {
      id: '1.2',
      name: 'Servicios domésticos',
      children: [
        { id: '1.2.1', name: 'Aseo' },
        { id: '1.2.2', name: 'Trabajo de jardín' },
        { id: '1.2.3', name: 'Limpieza de combustión y reparaciones menores' },
        { id: '1.2.4', name: 'Cuidado de adultos' },
        { id: '1.2.5', name: 'Cuidado de niños' },
        { id: '1.2.6', name: 'Otros servicios domésticos' },
      ],
    },
    {
      id: '1.3',
      name: 'Servicios profesionales',
      children: [
        { id: '1.3.1', name: 'Computación (página web, diseño, publicidad)' },
        { id: '1.3.2', name: 'Abogados' },
        { id: '1.3.3', name: 'Contadores y Auditores' },
        { id: '1.3.4', name: 'Arquitecto' },
        { id: '1.3.5', name: 'Psicólogos' },
        {
          id: '1.3.6',
          name: 'Servicio de salud',
          children: [
            { id: '1.3.6.1', name: 'Médico' },
            { id: '1.3.6.2', name: 'Dentista' },
            { id: '1.3.6.3', name: 'Enfermería' },
            { id: '1.3.6.4', name: 'Kinesiología' },
            { id: '1.3.6.5', name: 'Otros' },
          ],
        },
        {
          id: '1.3.7',
          name: 'Servicios educativos',
          children: [
            { id: '1.3.7.1', name: 'Clases particulares' },
            { id: '1.3.7.2', name: 'Fonoaudiología' },
            { id: '1.3.7.3', name: 'Terapeuta Ocupacional' },
            { id: '1.3.7.4', name: 'Otros' },
          ],
        },
        { id: '1.3.8', name: 'Veterinarios' },
        { id: '1.3.9', name: 'Otros' },
      ],
    },
    { id: '1.4', name: 'Vehículos (reparación, pintura, mecánica)', children: [] },
    { id: '1.5', name: 'Confección de ropa y vestuario', children: [] },
    { id: '1.6', name: 'Banquetería, repostería y alimentación', children: [] },
    { id: '1.7', name: 'Otros', children: [] },
  ],
}

export const CHILE_DPA = {
  'Los Lagos': {
    Osorno: ['Osorno', 'San Pablo', 'Puyehue', 'Puerto Octay', 'Purranque', 'Río Negro', 'San Juan de la Costa'],
    Llanquihue: ['Puerto Montt', 'Puerto Varas', 'Frutillar', 'Llanquihue', 'Calbuco', 'Maullín'],
    Chiloé: ['Castro', 'Ancud', 'Quellón', 'Dalcahue'],
  },
  'Los Ríos': {
    Valdivia: ['Valdivia', 'La Unión', 'Río Bueno', 'Paillaco', 'Los Lagos'],
  },
}

export const formatCLP = (value) => {
  const num = Number(value) || 0
  return '$' + num.toLocaleString('es-CL')
}