import { money } from '../data/commerce'

export function dashboardSummary({ orders = [], catalog = [], users = [], companies = [], rut, seller = false, global = false }) {
  const visibleOrders = global ? orders : orders.filter(order => (seller ? order.sellerRut : order.customerRut) === rut)
  const publications = global ? catalog : catalog.filter(item => item.ownerRut === rut)
  const states = visibleOrders.reduce((result, order) => { result[order.status || 'Sin estado'] = (result[order.status || 'Sin estado'] || 0) + 1; return result }, {})
  return {
    orders: visibleOrders,
    publications,
    amount: visibleOrders.filter(order => !['Cancelado', 'Anulada', 'Anulado'].includes(order.status)).reduce((sum, order) => sum + money(order.total), 0),
    pending: visibleOrders.filter(order => !['Entregado', 'Recibido', 'Cancelado', 'Anulada'].includes(order.status)).length,
    states: Object.entries(states).sort((a, b) => b[1] - a[1]),
    users: global ? users.length : 0,
    companies: global ? companies.length : 0,
  }
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const CANCELLED = ['Cancelado', 'Anulada', 'Anulado']
const STATUS_ORDER = ['Recibido', 'En preparación', 'Enviado', 'En reparto', 'Entregado', 'Cancelado']
const count = (rows, key) => rows.reduce((result, row) => { const name = key(row); if (name) result.set(name, (result.get(name) || 0) + 1); return result }, new Map())
const toRows = (map, limit) => [...map].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'es', { numeric: true })).slice(0, limit)

/**
 * Indicadores del panel de administración, agrupados como pide el enunciado:
 * análisis comercial, operativo y de calidad. Todo se calcula con los datos recibidos.
 */
export function adminAnalytics({ orders = [], returns = [], reviews = [], questions = [] }) {
  const valid = orders.filter(order => !CANCELLED.includes(order.status))

  // Comercial: ingresos por mes (últimos 12 con datos) y vendedores con más ingresos.
  const monthly = new Map()
  const sellers = new Map()
  for (const order of valid) {
    const month = String(order.createdAt || '').slice(0, 7)
    if (/^\d{4}-\d{2}$/.test(month)) { const entry = monthly.get(month) || { amount: 0, orders: 0 }; entry.amount += money(order.total); entry.orders += 1; monthly.set(month, entry) }
    if (order.store) sellers.set(order.store, (sellers.get(order.store) || 0) + money(order.total))
  }
  const revenueByMonth = [...monthly].sort((a, b) => a[0].localeCompare(b[0])).slice(-12).map(([month, entry]) => ({ label: `${MONTHS[Number(month.slice(5)) - 1]} ${month.slice(2, 4)}`, value: entry.amount, detail: `${entry.orders.toLocaleString('es-CL')} pedidos` }))

  // Operativo: estado de los pedidos en el orden del ciclo y forma de entrega.
  const states = count(orders, order => order.status || 'Sin estado')
  const ordersByStatus = [...states].map(([label, value]) => ({ label, value })).sort((a, b) => (STATUS_ORDER.indexOf(a.label) + 1 || 99) - (STATUS_ORDER.indexOf(b.label) + 1 || 99))
  const delivery = count(orders, order => order.dispatch?.carrier || (order.shipping > 0 ? 'Despacho sin transportista' : 'Retiro con el vendedor'))
  const delivered = orders.filter(order => ['Entregado', 'Recibido'].includes(order.status)).length

  // Calidad: calificaciones, devoluciones por motivo y preguntas sin responder.
  const ratings = reviews.map(review => Math.round(Number(review.rating))).filter(rating => rating >= 1 && rating <= 5)
  const ratingRows = [5, 4, 3, 2, 1].map(stars => ({ label: `${stars} ${stars === 1 ? 'estrella' : 'estrellas'}`, value: ratings.filter(rating => rating === stars).length }))
  const unanswered = questions.filter(question => !String(question.answer || '').trim()).length

  return {
    commercial: { revenueByMonth, topSellers: toRows(sellers, 5), averageTicket: valid.length ? Math.round(valid.reduce((sum, order) => sum + money(order.total), 0) / valid.length) : 0 },
    operations: { ordersByStatus, delivery: toRows(delivery, 6), deliveredRate: orders.length ? Math.round(delivered / orders.length * 100) : 0, cancelled: orders.length - valid.length },
    quality: {
      ratingRows, reviews: ratings.length, average: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
      returnsByReason: toRows(count(returns, item => item.reason || 'Sin motivo'), 5), returns: returns.length,
      returnRate: orders.length ? returns.length / orders.length * 100 : 0, questions: questions.length, unanswered,
    },
  }
}
