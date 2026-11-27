import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OrdersReturnsHeader from '../OrdersReturnsHeader';
import type { PurchaseOrder } from '../purchaseTypes';

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';
const deliveredStatuses = ['Entregado', 'Recibido'];
const orderStatuses = ['Recibido', 'En preparación', 'Enviado', 'En reparto', 'Entregado'];

function money(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function statusStyle(status: string) {
  if (status === 'Entregado' || status === 'Recibido') return styles.statusGreen;
  if (status === 'Rechazado' || status === 'Cancelado') return styles.statusRed;
  return styles.statusPurple;
}

function OrderStatus({ status }: { status: string }) {
  return (
    <View style={[styles.statusPill, statusStyle(status)]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
}

function ProductLine({
  name,
  detail,
  qty,
  price,
}: {
  name: string;
  detail: string;
  qty: number;
  price: number;
}) {
  return (
    <View style={styles.productLine}>
      <View style={styles.productImage}>
        <MaterialIcons name="inventory-2" size={24} color={purple} />
      </View>
      <View style={styles.productCopy}>
        <Text style={styles.productName} numberOfLines={2}>{name}</Text>
        <Text style={styles.mutedText}>{[detail, `Cantidad: ${qty}`].filter(Boolean).join(' · ')}</Text>
      </View>
      <Text style={styles.productPrice}>{money(price * qty)}</Text>
    </View>
  );
}

function OrderCard({
  order,
  onTrack,
  onReturn,
}: {
  order: PurchaseOrder;
  onTrack: (order: PurchaseOrder) => void;
  onReturn: (order: PurchaseOrder) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeading}>
          <Text style={styles.orderId}>Pedido #{order.id}</Text>
          <Text style={styles.mutedText}>{order.date} · {order.store}</Text>
        </View>
        <OrderStatus status={order.status} />
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.products}>
        {order.products.map((item, index) => (
          <ProductLine
            key={`${order.id}-${item.id}-${index}`}
            name={item.name}
            detail={item.detail}
            qty={item.qty}
            price={item.price}
          />
        ))}
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.mutedText}>Total pagado</Text>
          <Text style={styles.total}>{money(order.total)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onTrack(order)}
          style={styles.primarySmallButton}>
          <MaterialIcons name="local-shipping" size={17} color="#FFFFFF" />
          <Text style={styles.primarySmallText}>Seguimiento</Text>
        </Pressable>
      </View>
      {deliveredStatuses.includes(order.status) ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onReturn(order)}
          style={styles.returnButton}>
          <MaterialIcons name="undo" size={17} color={purple} />
          <Text style={styles.returnButtonText}>Solicitar devolución</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function TrackOrder({
  order,
  onBack,
}: {
  order: PurchaseOrder;
  onBack: () => void;
}) {
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [paymentExpanded, setPaymentExpanded] = useState(false);
  const currentStep = orderStatuses.indexOf(order.status);
  const progress = currentStep < 0
    ? 0
    : (currentStep / (orderStatuses.length - 1)) * 100;
  const history = order.history.length
    ? order.history
    : [{ date: order.createdAt, status: order.status }];

  const shareTracking = async () => {
    const tracking = order.dispatch.tracking;
    if (!tracking) {
      Alert.alert('Seguimiento pendiente', 'El número estará disponible cuando se despache el pedido.');
      return;
    }

    try {
      await Clipboard.setStringAsync(tracking);
      Alert.alert('Seguimiento copiado', tracking);
    } catch {
      try {
        await Share.share({ message: `Seguimiento del pedido #${order.id}: ${tracking}` });
      } catch {
        Alert.alert('No se pudo compartir', 'Inténtalo nuevamente más tarde.');
      }
    }
  };

  const downloadReceipt = async () => {
    const rows = order.products
      .map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.qty}</td><td>${money(item.price * item.qty)}</td></tr>`)
      .join('');
    const html = `
      <html><body style="font-family:Arial,sans-serif;color:#25243A;padding:24px">
        <h1>Comprobante de compra</h1>
        <p>Pedido #${escapeHtml(order.id)} · ${escapeHtml(order.date)}</p>
        <p>Vendedor: ${escapeHtml(order.store)}</p>
        <table style="width:100%;border-collapse:collapse" border="1" cellpadding="10">
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p>Despacho: ${money(order.shipping)}</p>
        <h2>Total: ${money(order.total)}</h2>
        <p>Medio de pago: ${escapeHtml(order.payment)}</p>
      </body></html>`;

    try {
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Comprobante creado', 'No está disponible compartir archivos en este dispositivo.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Comprobante pedido ${order.id}`,
        UTI: 'com.adobe.pdf',
      });
    } catch {
      Alert.alert('No se pudo generar el comprobante', 'Inténtalo nuevamente más tarde.');
    }
  };

  return (
    <>
      <OrdersReturnsHeader title="Seguimiento del pedido" onBack={onBack} />
      <ScrollView style={styles.scrollViewport} contentContainerStyle={styles.detailContent}>
        <View style={styles.statusCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeading}>
              <Text style={styles.orderId}>Pedido #{order.id}</Text>
              <Text style={styles.mutedText}>Comprado el {order.date}</Text>
            </View>
            <OrderStatus status={order.status} />
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.statusHeading}>
            <MaterialIcons name="local-shipping" size={20} color={purple} />
            <Text style={styles.sectionTitle}>Estado del pedido</Text>
          </View>
          {currentStep < 0 ? (
            <Text style={styles.mutedText}>Este pedido está en estado «{order.status}».</Text>
          ) : (
            <View style={styles.progressSection}>
              <Text style={styles.progressCaption}>
                Etapa {currentStep + 1} de {orderStatuses.length}: {order.status}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.progressEndpoints}>
                <Text style={styles.progressEndpoint}>Pedido recibido</Text>
                <Text style={styles.progressEndpoint}>Entregado</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Artículos</Text>
          <Text style={styles.mutedText}>Vendido por {order.store}</Text>
          <View style={styles.products}>
            {order.products.map((item, index) => (
              <ProductLine
                key={`${order.id}-detail-${item.id}-${index}`}
                name={item.name}
                detail={item.detail}
                qty={item.qty}
                price={item.price}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.iconHeading}>
            <MaterialIcons name="local-shipping" size={20} color={purple} />
            <Text style={styles.sectionTitle}>Despacho</Text>
          </View>
          <DetailRow label="Dirección" value={order.address || 'Retiro con el vendedor'} />
          <DetailRow label="Transportista" value={order.dispatch.carrier || 'Pendiente de asignación'} />
          <DetailRow label="N.º de seguimiento" value={order.dispatch.tracking || 'Disponible al despachar'} />
          {order.dispatch.tracking ? (
            <Pressable onPress={shareTracking} style={styles.outlineButton}>
              <MaterialIcons name="content-copy" size={17} color={purple} />
              <Text style={styles.outlineButtonText}>Copiar número de seguimiento</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: historyExpanded }}
            onPress={() => setHistoryExpanded((expanded) => !expanded)}
            style={styles.accordionHeader}>
            <View style={styles.accordionCopy}>
              <Text style={styles.sectionTitle}>Historial del pedido</Text>
              <Text style={styles.mutedText}>{history.length} actualizaciones</Text>
            </View>
            <MaterialIcons name={historyExpanded ? 'expand-less' : 'expand-more'} size={23} color={muted} />
          </Pressable>
          {historyExpanded ? (
            <View style={styles.historyList}>
              {history.map((event, index) => (
                <View key={`${event.date}-${event.status}`} style={styles.historyRow}>
                  <View style={styles.historyMarkerColumn}>
                    <View style={[styles.historyMarker, index === history.length - 1 && styles.historyMarkerActive]} />
                    {index < history.length - 1 ? <View style={styles.historyLine} /> : null}
                  </View>
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyStatus}>{event.status}</Text>
                    <Text style={styles.mutedText}>
                      {new Date(event.date).toLocaleString('es-CL')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.iconHeading}>
            <MaterialIcons name="receipt-long" size={20} color={purple} />
            <View style={styles.paymentHeading}>
              <Text style={styles.sectionTitle}>Resumen de pago</Text>
              <Text style={styles.mutedText}>{order.payment}</Text>
            </View>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>{money(order.total)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: paymentExpanded }}
            onPress={() => setPaymentExpanded((expanded) => !expanded)}
            style={styles.paymentDetailsButton}>
            <Text style={styles.linkText}>{paymentExpanded ? 'Ocultar detalle' : 'Ver detalle del pago'}</Text>
            <MaterialIcons name={paymentExpanded ? 'expand-less' : 'expand-more'} size={19} color={purple} />
          </Pressable>
          {paymentExpanded ? (
            <View style={styles.paymentDetails}>
              <DetailRow label="Productos" value={money(order.total - order.shipping)} />
              <DetailRow label="Despacho" value={money(order.shipping)} />
              <DetailRow label="Valor neto" value={money(Math.round(order.total / 1.19))} />
              <DetailRow label="IVA (19 %)" value={money(order.total - Math.round(order.total / 1.19))} />
              {order.cardLast4 ? <DetailRow label="Tarjeta" value={`•••• ${order.cardLast4}`} /> : null}
              {order.transferCode ? <DetailRow label="Código de transferencia" value={order.transferCode} /> : null}
            </View>
          ) : null}
          <Pressable onPress={downloadReceipt} style={styles.primaryButton}>
            <MaterialIcons name="description" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Descargar comprobante</Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('Mensajes', 'La mensajería del vendedor todavía no está conectada en esta versión móvil.')}
            style={styles.outlineButton}>
            <MaterialIcons name="chat" size={18} color={purple} />
            <Text style={styles.outlineButtonText}>Contactar vendedor</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function PurchaseHistoryScreen({
  orders,
  onBack,
  onRequestReturn,
}: {
  orders: PurchaseOrder[];
  onBack: () => void;
  onRequestReturn: (order: PurchaseOrder) => void;
}) {
  const [filter, setFilter] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(10);
  const [trackingOrder, setTrackingOrder] = useState<PurchaseOrder | null>(null);
  const filters = ['Todas', 'En curso', 'Entregadas'];
  const visibleOrders = useMemo(() => {
    const matching = orders.filter((order) => {
      if (filter === 'En curso') return !deliveredStatuses.includes(order.status);
      if (filter === 'Entregadas') return deliveredStatuses.includes(order.status);
      return true;
    });
    return matching.slice(0, visibleCount);
  }, [filter, orders, visibleCount]);
  const filteredCount = orders.filter((order) => {
    if (filter === 'En curso') return !deliveredStatuses.includes(order.status);
    if (filter === 'Entregadas') return deliveredStatuses.includes(order.status);
    return true;
  }).length;

  if (trackingOrder) {
    return (
      <TrackOrder order={trackingOrder} onBack={() => setTrackingOrder(null)} />
    );
  }

  return (
    <>
      <OrdersReturnsHeader title="Historial de compras" onBack={onBack} />
      <ScrollView style={styles.scrollViewport} contentContainerStyle={styles.listContent}>
        <View style={styles.filterRow}>
          {filters.map((item) => {
            const selected = item === filter;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  setFilter(item);
                  setVisibleCount(10);
                }}
                style={[styles.filterChip, selected && styles.filterChipSelected]}>
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
        {visibleOrders.length ? visibleOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onTrack={setTrackingOrder}
            onReturn={onRequestReturn}
          />
        )) : (
          <View style={styles.emptyCard}>
            <MaterialIcons name="receipt-long" size={36} color={purple} />
            <Text style={styles.emptyTitle}>Aún no hay compras</Text>
            <Text style={styles.mutedText}>Cuando realices una compra, tus pedidos aparecerán aquí.</Text>
          </View>
        )}
        {filteredCount > visibleOrders.length ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setVisibleCount((count) => count + 10)}
            style={styles.moreButton}>
            <Text style={styles.returnButtonText}>Ver {Math.min(10, filteredCount - visibleOrders.length)} más</Text>
            <MaterialIcons name="expand-more" size={19} color={purple} />
          </Pressable>
        ) : null}
        <Text style={styles.listCount}>Mostrando {visibleOrders.length} de {filteredCount} pedidos</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewport: { flex: 1, marginBottom: 66 },
  listContent: { padding: 18, paddingBottom: 24, gap: 15 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 2 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, backgroundColor: '#F0EEF6' },
  filterChipSelected: { backgroundColor: purple },
  filterText: { color: muted, fontSize: 12, fontWeight: '600' },
  filterTextSelected: { color: '#FFFFFF' },
  card: { padding: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 16, gap: 13 },
  statusCard: { padding: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 16, gap: 13 },
  orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  orderHeading: { flex: 1, gap: 5 },
  orderId: { color: ink, fontSize: 15, fontWeight: '800' },
  mutedText: { color: muted, fontSize: 11, lineHeight: 16 },
  statusPill: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5, maxWidth: 120 },
  statusGreen: { backgroundColor: '#E5F6ED' },
  statusRed: { backgroundColor: '#FDE9E9' },
  statusPurple: { backgroundColor: '#EFEAFF' },
  statusText: { color: purple, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EAE9F0' },
  products: { gap: 9 },
  productLine: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  productImage: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2EFFF', borderRadius: 12 },
  productCopy: { flex: 1, gap: 5 },
  productName: { color: ink, fontSize: 13, fontWeight: '700' },
  productPrice: { color: ink, fontSize: 12, fontWeight: '700' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { color: purple, fontSize: 16, fontWeight: '900' },
  primarySmallButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: purple, borderRadius: 11, paddingHorizontal: 11 },
  primarySmallText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  returnButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 11, borderWidth: 1, borderColor: '#D8D1F6', backgroundColor: '#FFFFFF' },
  returnButtonText: { color: purple, fontSize: 12, fontWeight: '700' },
  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: 36, paddingHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EEEAF5' },
  emptyTitle: { color: ink, fontSize: 16, fontWeight: '800' },
  moreButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, borderWidth: 1, borderColor: '#D8D1F6', backgroundColor: '#FFFFFF' },
  listCount: { color: muted, fontSize: 11, textAlign: 'center', marginTop: 3 },
  detailContent: { padding: 18, paddingBottom: 24, gap: 16 },
  sectionTitle: { color: ink, fontSize: 15, fontWeight: '800' },
  statusHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressSection: { gap: 9 },
  progressCaption: { color: ink, fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 7, overflow: 'hidden', borderRadius: 5, backgroundColor: '#E9E6F2' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: purple },
  progressEndpoints: { flexDirection: 'row', justifyContent: 'space-between' },
  progressEndpoint: { color: muted, fontSize: 10 },
  iconHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentHeading: { flex: 1, gap: 3 },
  detailRow: { gap: 4, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0EEF5' },
  detailLabel: { color: muted, fontSize: 10 },
  detailValue: { color: ink, fontSize: 12, fontWeight: '600' },
  linkText: { color: purple, fontSize: 11, fontWeight: '700' },
  accordionHeader: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  accordionCopy: { gap: 4 },
  historyList: { gap: 3, marginTop: 7 },
  historyRow: { minHeight: 55, flexDirection: 'row', gap: 12 },
  historyMarkerColumn: { width: 13, alignItems: 'center' },
  historyMarker: { width: 9, height: 9, marginTop: 4, borderRadius: 5, backgroundColor: '#C9C6D4' },
  historyMarkerActive: { backgroundColor: purple },
  historyLine: { flex: 1, width: 1, backgroundColor: '#DAD7E4', marginVertical: 3 },
  historyCopy: { flex: 1, gap: 3 },
  historyStatus: { color: ink, fontSize: 12, fontWeight: '700' },
  paymentDetailsButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EAE9F0' },
  paymentDetails: { paddingBottom: 5 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 2, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EAE9F0' },
  totalLabel: { color: ink, fontSize: 14, fontWeight: '800' },
  primaryButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 3, backgroundColor: purple, borderRadius: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  outlineButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#D8D1F6', borderRadius: 12 },
  outlineButtonText: { color: purple, fontSize: 12, fontWeight: '700' },
});
