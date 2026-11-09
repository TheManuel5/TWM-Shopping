
// DATOS SIMULADOS DEL DASHBOARD

// 1. Tarjetas de estadísticas
export const metricas = [
  {
    id: 1,
    titulo: 'Ventas del mes',
    valor: 1428000,
    tipo: 'moneda',
    cambio: '↑ 12%',
    descripcion: 'vs. mes anterior',
    color: 'success',
  },
  {
    id: 2,
    titulo: 'Pedidos',
    valor: 48,
    tipo: 'numero',
    cambio: '↑ 9%',
    descripcion: 'vs. mes anterior',
    color: 'success',
  },
  {
    id: 3,
    titulo: 'Stock bajo',
    valor: 5,
    tipo: 'numero',
    cambio: '↑ 2',
    descripcion: 'productos en riesgo',
    color: 'warning',
  },
  {
    id: 4,
    titulo: 'Cotizaciones pendientes',
    valor: 4,
    tipo: 'numero',
    cambio: '↑ 1',
    descripcion: 'requieren respuesta',
    color: 'warning',
  },
]

// 2. Ventas diarias de septiembre
export const ventasDiarias = [
  36000, 21000, 42000, 52000, 66000,
  29000, 47000, 59000, 26000, 41000,
  20000, 45000, 57000, 71000, 49000,
  41000, 46000, 58000, 60000, 49000,
  43000, 35000, 38000, 55000, 58000,
  69000, 44000, 52000, 57000, 62000,
].map((ventas, index) => ({
  dia: index + 1,
  ventas,
}))

// 3. Acciones pendientes
export const accionesPendientes = [
  {
    id: 1,
    titulo: 'Responder preguntas',
    descripcion: 'Consultas de productos',
    cantidad: 3,
  },
  {
    id: 2,
    titulo: 'Preparar pedidos',
    descripcion: 'Listos para despacho',
    cantidad: 6,
  },
  {
    id: 3,
    titulo: 'Revisar devoluciones',
    descripcion: 'Solicitudes pendientes',
    cantidad: 2,
  },
]

// 4. Transacciones recientes
export const transaccionesRecientes = [
  {
    id: '102844',
    fecha: '28 sep. 2026',
    cliente: 'Camila Rojas',
    producto: 'Audífonos Bluetooth JBL',
    total: 59990,
    estado: 'Pendiente',
    pago: 'Webpay',
  },
  {
    id: '102843',
    fecha: '27 sep. 2026',
    cliente: 'Matías Torres',
    producto: 'Cafetera Oster 12 tazas',
    total: 34990,
    estado: 'Completado',
    pago: 'VISA',
  },
  {
    id: '102842',
    fecha: '27 sep. 2026',
    cliente: 'Valentina Soto',
    producto: 'Zapatillas Nike Air Max',
    total: 89990,
    estado: 'Completado',
    pago: 'Webpay',
  },
  {
    id: '102841',
    fecha: '26 sep. 2026',
    cliente: 'Diego Mendoza',
    producto: 'Polera deportiva',
    total: 29990,
    estado: 'Cancelado',
    pago: 'VISA',
  },
]

// 5. Productos más vendidos
export const productosMasVendidos = [
  {
    id: 1,
    nombre: 'Zapatillas Nike Air Max',
    unidades: 120,
    precio: 89990,
  },
  {
    id: 2,
    nombre: 'Audífonos Bluetooth JBL',
    unidades: 98,
    precio: 59990,
  },
  {
    id: 3,
    nombre: 'Cafetera Oster 12 tazas',
    unidades: 76,
    precio: 34990,
  },
]
