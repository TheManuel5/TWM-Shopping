import { jsPDF } from 'jspdf'
import { formatCLP } from './taxonomyData'
import { money } from '../data/commerce'
import { logEvent } from '../data/localStore'

export function exportDocument(title, lines, filename) {
  const doc = new jsPDF()
  let y = 22
  doc.setFontSize(17); doc.setTextColor('#602ff7')
  doc.text(title, 16, y); y += 12
  doc.setFontSize(10); doc.setTextColor('#030c2e')
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(String(line), 178)
    for (const part of wrapped) {
      if (y > 275) { doc.addPage(); y = 22 }
      doc.text(part, 16, y); y += 6
    }
    y += 2
  }
  doc.save(filename)
  logEvent('Exportar documento', { filename })
}
export function exportReceipt(order) {
  const total = money(order.total)
  const net = order.net ?? Math.round(total / 1.19)
  exportDocument('SHOPPING - COMPROBANTE DE VENTA', [
    `Pedido: ${order.id} | Fecha: ${order.date.replace('\n', ' ')}`,
    `Cliente: ${order.customer} | Vendedor: ${order.store}`,
    `Entrega: ${order.address}`,
    ...order.products.map(item => { const unitNet = item.netPrice ?? Math.round(money(item.price) / 1.19); return `${item.qty || 1} x ${item.name} | Neto unitario: ${formatCLP(unitNet)} | Neto línea: ${formatCLP(unitNet * (item.qty || 1))}` }),
    `Subtotal neto: ${formatCLP(net + (order.discount || 0))}`,
    `Descuento neto aplicado: ${formatCLP(order.discount || 0)}`,
    `Despacho: ${formatCLP(order.shipping || 0)}`,
    `Neto: ${formatCLP(net)} | IVA (19%): ${formatCLP(order.iva ?? total - net)} | Total: ${formatCLP(total)}`,
    `Medio de pago: ${order.payment || 'No registrado'} ${order.cardLast4 ? '**** ' + order.cardLast4 : order.transferCode || ''}`,
    `Estado: ${order.status}`,
    'Comprobante del registro en la plataforma. No reemplaza el documento tributario ni acredita cobro bancario.',
  ], `comprobante-${order.id}.pdf`)
}
