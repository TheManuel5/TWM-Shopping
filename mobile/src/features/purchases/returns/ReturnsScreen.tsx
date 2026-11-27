import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import OrdersReturnsHeader from '../OrdersReturnsHeader';
import type { PurchaseOrder, ReturnRequest } from '../purchaseTypes';
import { PurchaseListFilters, purchaseTextScale } from '../components/PurchaseUi';

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';
const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const reasons = ['Talla incorrecta', 'Producto con falla', 'No coincide con descripción'];
const returnStatuses = ['Todas', 'Solicitada', 'Aprobada', 'Rechazada', 'Finalizada'];
const deliveredStatuses = ['Entregado', 'Recibido'];

type ProductChoice = {
  key: string;
  order: PurchaseOrder;
  product: PurchaseOrder['products'][number];
  index: number;
};

function money(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

function statusColors(status: string) {
  if (status === 'Aprobada' || status === 'Finalizada') {
    return { backgroundColor: '#E5F6ED', color: '#18794E' };
  }
  if (status === 'Rechazada') return { backgroundColor: '#FDE9E9', color: '#A52B2B' };
  return { backgroundColor: '#EFEAFF', color: purple };
}

function ReturnStatusPill({ status }: { status: string }) {
  const colors = statusColors(status);
  return (
    <View style={[styles.statusPill, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.statusText, { color: colors.color }]}>{status}</Text>
    </View>
  );
}

function Selector({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.selector}>
      <View style={styles.selectorCopy}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.selectorValue}>{value}</Text>
      </View>
      <MaterialIcons name="keyboard-arrow-down" size={23} color={muted} />
    </Pressable>
  );
}

function ReturnCard({
  request,
  order,
  onPress,
}: {
  request: ReturnRequest;
  order?: PurchaseOrder;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Seguimiento de devolución ${request.id}, ${request.status}`}
      onPress={onPress}
      style={styles.returnCard}>
      <View style={styles.returnCardTop}>
        <Text style={styles.returnId}>Solicitud {request.id}</Text>
        <ReturnStatusPill status={request.status} />
      </View>
      <Text style={styles.returnProduct} numberOfLines={2}>{request.product}</Text>
      <Text style={styles.mutedText}>
        Pedido #{request.orderId} · {order?.store || 'Vendedor'} · {request.date}
      </Text>
      <View style={styles.returnCardFooter}>
        <Text style={styles.returnAmount}>{money(request.price)}</Text>
        <View style={styles.trackAction}>
          <Text style={styles.trackActionText}>Seguimiento</Text>
          <MaterialIcons name="chevron-right" size={19} color={purple} />
        </View>
      </View>
    </Pressable>
  );
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CL');
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ReturnTracking({
  request,
  order,
  accountName,
  onBack,
}: {
  request: ReturnRequest;
  order?: PurchaseOrder;
  accountName: string;
  onBack: () => void;
}) {
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const steps = ['Solicitada', 'Aprobada', 'Finalizada'];
  const currentStep = request.status === 'Rechazada'
    ? -1
    : steps.indexOf(request.status);
  const progress = currentStep < 0 ? 0 : (currentStep / (steps.length - 1)) * 100;
  const history = request.history.length
    ? request.history
    : [{ date: request.date, status: request.status }];

  return (
    <>
      <OrdersReturnsHeader title="Seguimiento de devolución" accountName={accountName} onBack={onBack} />
      <ScrollView style={styles.scrollViewport} contentContainerStyle={styles.detailContent}>
        <View style={styles.statusCard}>
          <View style={styles.returnCardTop}>
            <View style={styles.detailCopy}>
              <Text style={styles.returnId}>Solicitud {request.id}</Text>
              <Text style={styles.mutedText}>Creada el {request.date}</Text>
            </View>
            <ReturnStatusPill status={request.status} />
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.detailSectionHeading}>
            <MaterialIcons name="assignment-return" size={20} color={purple} />
            <Text style={styles.sectionTitle}>Estado de la devolución</Text>
          </View>
          {request.status === 'Rechazada' ? (
            <View style={styles.rejectedNotice}>
              <MaterialIcons name="cancel" size={18} color="#A52B2B" />
              <Text style={styles.rejectedText}>
                La solicitud fue rechazada. Revisa el historial o contacta al vendedor.
              </Text>
            </View>
          ) : (
            <View style={styles.progressSection}>
              <Text style={styles.progressCaption}>
                Etapa {currentStep + 1} de {steps.length}: {request.status}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.progressEndpoints}>
                <Text style={styles.progressEndpoint}>Solicitud recibida</Text>
                <Text style={styles.progressEndpoint}>Reembolso procesado</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.detailSectionHeading}>
            <MaterialIcons name="inventory-2" size={20} color={purple} />
            <Text style={styles.sectionTitle}>Producto devuelto</Text>
          </View>
          <Text style={styles.productName}>{request.product}</Text>
          <DetailRow label="Pedido" value={`#${request.orderId}`} />
          <DetailRow label="Vendedor" value={order?.store || 'Vendedor'} />
          <DetailRow label="Motivo" value={request.reason} />
          <DetailRow label="Cantidad" value={`${request.qty} unidad${request.qty === 1 ? '' : 'es'}`} />
        </View>

        <View style={styles.card}>
          <View style={styles.detailSectionHeading}>
            <MaterialIcons name="receipt-long" size={20} color={purple} />
            <Text style={styles.sectionTitle}>Resumen del reembolso</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Importe solicitado</Text>
            <Text style={styles.refundAmount}>{money(request.price)}</Text>
          </View>
          <DetailRow label="Medio de pago original" value={order?.payment || 'Pendiente de confirmación'} />
          <Text style={styles.mutedText}>
            {request.status === 'Finalizada'
              ? 'El reembolso fue procesado al medio de pago original.'
              : request.status === 'Rechazada'
                ? 'No se procesará un reembolso para esta solicitud.'
                : 'Te informaremos cuando avance la revisión de la solicitud.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: historyExpanded }}
            onPress={() => setHistoryExpanded((expanded) => !expanded)}
            style={styles.accordionHeader}>
            <View style={styles.detailCopy}>
              <Text style={styles.sectionTitle}>Historial de la solicitud</Text>
              <Text style={styles.mutedText}>{history.length} actualizaciones</Text>
            </View>
            <MaterialIcons
              name={historyExpanded ? 'expand-less' : 'expand-more'}
              size={23}
              color={muted}
            />
          </Pressable>
          {historyExpanded ? (
            <View style={styles.historyList}>
              {history.map((event, index) => (
                <View key={`${event.date}-${event.status}`} style={styles.historyRow}>
                  <View style={styles.historyMarkerColumn}>
                    <View
                      style={[
                        styles.historyMarker,
                        index === history.length - 1 && styles.historyMarkerActive,
                      ]}
                    />
                    {index < history.length - 1 ? <View style={styles.historyLine} /> : null}
                  </View>
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyStatus}>{event.status}</Text>
                    <Text style={styles.mutedText}>{formatHistoryDate(event.date)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {request.images.length ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Fotos de respaldo</Text>
            <View style={styles.imageRow}>
              {request.images.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.imagePreview} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>¿Qué sigue?</Text>
          <Text style={styles.mutedText}>
            Conserva el embalaje y coordina con el vendedor la entrega del producto. El reembolso se procesa una vez aprobada y recibida la devolución.
          </Text>
          <Pressable
            accessibilityRole="button"
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

export default function ReturnsScreen({
  orders,
  requests,
  accountName,
  initialOrderId,
  onRequestChange,
  onBack,
}: {
  orders: PurchaseOrder[];
  requests: ReturnRequest[];
  accountName: string;
  initialOrderId: string | null;
  onRequestChange: (requests: ReturnRequest[]) => void;
  onBack: () => void;
}) {
  const choices = useMemo<ProductChoice[]>(
    () => orders
      .filter((order) => deliveredStatuses.includes(order.status))
      .flatMap((order) => order.products.map((product, index) => ({
        key: `${order.id}:${index}`,
        order,
        product,
        index,
      }))),
    [orders],
  );
  const [selectedKey, setSelectedKey] = useState(() => {
    const initial = choices.find((choice) => choice.order.id === initialOrderId);
    return initial?.key || choices[0]?.key || '';
  });
  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const [quantity, setQuantity] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todas');
  const [query, setQuery] = useState('');
  const [selector, setSelector] = useState<'product' | 'reason' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(Boolean(initialOrderId));
  const selectedChoice = choices.find((choice) => choice.key === selectedKey) || choices[0];
  const alreadyRequested = selectedChoice
    ? requests
      .filter((request) => request.itemKey === selectedChoice.key && request.status !== 'Rechazada')
      .reduce((sum, request) => sum + request.qty, 0)
    : 0;
  const remaining = selectedChoice
    ? selectedChoice.product.qty - alreadyRequested
    : 0;
  const normalizedQuery = query.trim().toLocaleLowerCase('es-CL');
  const visibleRequests = requests.filter((request) => {
    const matchesStatus = filter === 'Todas' || request.status === filter;
    const order = orders.find((item) => item.id === request.orderId);
    const searchableText = [
      request.id,
      request.orderId,
      request.product,
      request.status,
      request.reason,
      order?.store ?? '',
    ].join(' ').toLocaleLowerCase('es-CL');
    return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
  const availableStatuses = returnStatuses.filter((status) =>
    status === 'Todas' || requests.some((request) => request.status === status),
  );
  const filterOptions = availableStatuses.map((status) => ({
    value: status,
    label: status,
    count: status === 'Todas'
      ? requests.length
      : requests.filter((request) => request.status === status).length,
  }));
  const trackingRequest = requests.find((request) => request.id === trackingId);

  if (trackingRequest) {
    return (
      <ReturnTracking
        request={trackingRequest}
        order={orders.find((order) => order.id === trackingRequest.orderId)}
        accountName={accountName}
        onBack={() => setTrackingId(null)}
      />
    );
  }

  const addImages = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Límite de fotos', `Puedes adjuntar hasta ${MAX_IMAGES} imágenes.`);
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso necesario', 'Permite el acceso a tus fotos para adjuntar evidencia.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES - images.length,
        quality: 0.8,
      });
      if (result.canceled) return;

      const nextImages: string[] = [];
      for (const asset of result.assets) {
        const extension = asset.fileName?.split('.').pop()?.toLowerCase();
        const validImage = asset.mimeType
          ? ['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType.toLowerCase())
          : ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
        if (!validImage) {
          Alert.alert('Formato no compatible', 'Adjunta imágenes JPG, PNG o WEBP.');
          continue;
        }
        if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_SIZE) {
          Alert.alert('Imagen demasiado grande', 'Cada foto debe pesar como máximo 5 MB.');
          continue;
        }
        nextImages.push(asset.uri);
      }
      setImages((current) => [...current, ...nextImages].slice(0, MAX_IMAGES));
    } catch {
      Alert.alert('No se pudieron cargar las fotos', 'Intenta seleccionar las imágenes nuevamente.');
    }
  };

  const submitReturn = () => {
    if (!selectedChoice) {
      Alert.alert('No hay productos disponibles', 'Solo puedes devolver productos de pedidos entregados o recibidos.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > remaining) {
      Alert.alert('Cantidad no válida', 'La cantidad debe ser un número entero positivo y no superar las unidades disponibles.');
      return;
    }
    if (!selectedReason.trim()) {
      Alert.alert('Selecciona un motivo', 'El motivo de devolución es obligatorio.');
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString('es-CL');
    const requestId = `DEV-${now.getTime().toString().slice(-6)}`;
    const request: ReturnRequest = {
      id: requestId,
      orderId: selectedChoice.order.id,
      itemKey: selectedChoice.key,
      productId: selectedChoice.product.id,
      product: selectedChoice.product.name,
      qty: quantity,
      price: selectedChoice.product.price * quantity,
      reason: selectedReason,
      date,
      status: 'Solicitada',
      images,
      history: [{ date: now.toISOString(), status: 'Solicitada' }],
    };
    onRequestChange([request, ...requests]);
    setFilter('Todas');
    setQuery('');
    setQuantity(1);
    setImages([]);
    setNotice(`Solicitud ${requestId} creada correctamente.`);
    setShowRequestForm(false);
  };

  const removeImage = (uri: string) => {
    setImages((current) => current.filter((image) => image !== uri));
  };

  const leaveRequestForm = () => {
    if (initialOrderId) {
      onBack();
      return;
    }
    setShowRequestForm(false);
  };

  const requestForm = (
    <View style={styles.formCard}>
      <View style={styles.formHeading}>
        <MaterialIcons name="assignment-return" size={21} color={purple} />
        <Text style={styles.sectionTitle}>Solicitar nueva devolución</Text>
      </View>
      {choices.length === 0 ? (
        <View style={styles.noChoices}>
          <MaterialIcons name="info-outline" size={19} color={purple} />
          <Text style={styles.mutedText}>Puedes solicitar devoluciones de productos pertenecientes a pedidos entregados o recibidos.</Text>
        </View>
      ) : (
        <>
          <Selector
            label="Producto entregado"
            value={selectedChoice
              ? `#${selectedChoice.order.id} · ${selectedChoice.product.name}`
              : 'Selecciona un producto'}
            onPress={() => setSelector('product')}
          />
          {selectedChoice ? (
            <Text style={styles.helperText}>
              {selectedChoice.order.store} · {remaining} unidad{remaining === 1 ? '' : 'es'} disponible{remaining === 1 ? '' : 's'} para devolver
            </Text>
          ) : null}

          <Selector
            label="Motivo de devolución"
            value={selectedReason}
            onPress={() => setSelector('reason')}
          />

          <View style={styles.quantityBox}>
            <View style={styles.selectorCopy}>
              <Text style={styles.fieldLabel}>Cantidad a devolver</Text>
              <Text style={styles.helperText}>Solo números enteros positivos · Máximo {remaining}</Text>
            </View>
            <View style={styles.quantityControl}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Disminuir cantidad"
                disabled={quantity <= 1}
                onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                style={styles.quantityButton}>
                <MaterialIcons name="remove" size={18} color={quantity <= 1 ? '#B9B6C5' : purple} />
              </Pressable>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Aumentar cantidad"
                disabled={quantity >= remaining}
                onPress={() => setQuantity((value) => Math.min(remaining, value + 1))}
                style={styles.quantityButton}>
                <MaterialIcons name="add" size={18} color={quantity >= remaining ? '#B9B6C5' : purple} />
              </Pressable>
            </View>
          </View>

          <View>
            <View style={styles.imageHeading}>
              <Text style={styles.fieldLabel}>Fotos de respaldo</Text>
              <Text style={styles.helperText}>{images.length}/{MAX_IMAGES} · JPG, PNG o WEBP, máx. 5 MB</Text>
            </View>
            <View style={styles.imageRow}>
              {images.map((uri) => (
                <View key={uri} style={styles.imagePreviewWrap}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar foto"
                    onPress={() => removeImage(uri)}
                    style={styles.removeImage}>
                    <MaterialIcons name="close" size={13} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
              {images.length < MAX_IMAGES ? (
                <Pressable accessibilityRole="button" onPress={addImages} style={styles.addImage}>
                  <MaterialIcons name="add-a-photo" size={21} color={purple} />
                  <Text style={styles.addImageText}>Añadir</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.formActions}>
            <Pressable
              accessibilityRole="button"
              onPress={leaveRequestForm}
              style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={remaining <= 0}
              onPress={submitReturn}
              style={[styles.submitButton, remaining <= 0 && styles.submitDisabled]}>
              <MaterialIcons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.submitText}>Solicitar devolución</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );

  return (
    <>
      <OrdersReturnsHeader
        title={showRequestForm ? 'Solicitar devolución' : 'Devoluciones'}
        accountName={accountName}
        onBack={showRequestForm ? leaveRequestForm : onBack}
      />
      {showRequestForm ? (
        <ScrollView style={styles.scrollViewport} contentContainerStyle={styles.formPageContent}>
          <View style={styles.intro}>
            <Text style={styles.pageTitle}>Nueva solicitud</Text>
            <Text style={styles.mutedText}>Selecciona el producto entregado, el motivo y la cantidad.</Text>
          </View>
          {requestForm}
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollViewport} contentContainerStyle={styles.content}>
          {notice ? (
            <View style={styles.successNotice}>
              <MaterialIcons name="check-circle" size={18} color="#18794E" />
              <Text style={styles.successText}>{notice}</Text>
              <Pressable accessibilityLabel="Cerrar aviso" onPress={() => setNotice(null)}>
                <MaterialIcons name="close" size={18} color="#18794E" />
              </Pressable>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowRequestForm(true)}
            style={styles.newRequestButton}>
            <MaterialIcons name="add" size={19} color="#FFFFFF" />
            <Text style={styles.newRequestText}>Solicitar devolución</Text>
          </Pressable>

          <PurchaseListFilters
            searchValue={query}
            searchPlaceholder="Buscar devoluciones o productos..."
            onSearchChange={setQuery}
            selectedFilter={filter}
            filters={filterOptions}
            onSelectFilter={setFilter}
          />

          <Text style={styles.requestCount}>
            {visibleRequests.length} {visibleRequests.length === 1 ? 'solicitud' : 'solicitudes'}
          </Text>
          {visibleRequests.length ? visibleRequests.map((request) => (
            <ReturnCard
              key={request.id}
              request={request}
              order={orders.find((order) => order.id === request.orderId)}
              onPress={() => setTrackingId(request.id)}
            />
          )) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="assignment-return" size={32} color={purple} />
              <Text style={styles.emptyTitle}>
                {query || filter !== 'Todas' ? 'No hay solicitudes con estos filtros' : 'Aún no tienes solicitudes'}
              </Text>
              <Text style={styles.mutedText}>
                {query || filter !== 'Todas'
                  ? 'Prueba con otro término de búsqueda o estado.'
                  : 'Toca “Solicitar devolución” para empezar con un pedido entregado.'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal
        visible={selector !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelector(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>
                {selector === 'product' ? 'Selecciona un producto' : 'Selecciona un motivo'}
              </Text>
              <Pressable accessibilityLabel="Cerrar selector" onPress={() => setSelector(null)}>
                <MaterialIcons name="close" size={21} color={muted} />
              </Pressable>
            </View>
            <ScrollView>
              {(selector === 'product' ? choices : reasons).map((item) => {
                const isProduct = typeof item !== 'string';
                const value = isProduct ? item.key : item;
                const label = isProduct
                  ? `#${item.order.id} · ${item.product.name}`
                  : item;
                const selected = selector === 'product'
                  ? selectedKey === value
                  : selectedReason === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      if (selector === 'product' && isProduct) {
                        setSelectedKey(item.key);
                        setQuantity(1);
                      } else if (selector === 'reason' && typeof item === 'string') {
                        setSelectedReason(item);
                      }
                      setSelector(null);
                    }}
                    style={styles.modalOption}>
                    <View style={styles.modalOptionCopy}>
                      <Text style={styles.selectorValue}>{label}</Text>
                      {isProduct ? (
                        <Text style={styles.mutedText}>{item.order.date} · {item.order.store} · {item.order.status}</Text>
                      ) : null}
                    </View>
                    {selected ? <MaterialIcons name="check-circle" size={20} color={purple} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewport: { flex: 1, backgroundColor: '#FAF9FD' },
  content: { padding: 18, paddingBottom: 24, gap: 15 },
  formPageContent: { padding: 18, paddingBottom: 24, gap: 16 },
  detailContent: { padding: 18, paddingBottom: 24, gap: 16 },
  intro: { gap: 6, marginBottom: 2, paddingHorizontal: 2 },
  pageTitle: { color: ink, fontSize: purchaseTextScale.pageTitle, fontWeight: '800' },
  mutedText: { color: muted, fontSize: purchaseTextScale.body, lineHeight: 16 },
  fieldLabel: { color: muted, fontSize: 10, fontWeight: '600' },
  helperText: { color: muted, fontSize: 10, lineHeight: 15 },
  newRequestButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, backgroundColor: purple },
  newRequestText: { color: '#FFFFFF', fontSize: purchaseTextScale.subtitle, fontWeight: '700' },
  requestCount: { color: muted, fontSize: 11, marginTop: -7 },
  returnCard: { padding: 16, gap: 7, backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: '#EEEAF5' },
  returnCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7 },
  returnCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 1 },
  trackAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trackActionText: { color: purple, fontSize: 11, fontWeight: '700' },
  returnId: { color: ink, fontSize: 12, fontWeight: '800' },
  statusPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 9, fontWeight: '700' },
  returnProduct: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '700' },
  returnAmount: { color: purple, fontSize: purchaseTextScale.subtitle, fontWeight: '900' },
  progressSection: { gap: 9 },
  progressCaption: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '700' },
  progressTrack: { height: 7, overflow: 'hidden', borderRadius: 5, backgroundColor: '#E9E6F2' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: purple },
  progressEndpoints: { flexDirection: 'row', justifyContent: 'space-between' },
  progressEndpoint: { color: muted, fontSize: 10 },
  rejectedNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, borderRadius: 10, backgroundColor: '#FDE9E9' },
  rejectedText: { flex: 1, color: '#A52B2B', fontSize: 10, lineHeight: 15 },
  emptyCard: { alignItems: 'center', gap: 7, padding: 22, borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 14, backgroundColor: '#FFFFFF' },
  emptyTitle: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '800', textAlign: 'center' },
  card: { padding: 18, gap: 14, borderRadius: 15, borderWidth: 1, borderColor: '#EEEAF5', backgroundColor: '#FFFFFF' },
  statusCard: { padding: 18, gap: 13, borderRadius: 16, borderWidth: 1, borderColor: '#EEEAF5', backgroundColor: '#FFFFFF' },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EAE9F0' },
  detailSectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailCopy: { flex: 1, gap: 3 },
  sectionTitle: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '800' },
  refundAmount: { color: purple, fontSize: 23, fontWeight: '900' },
  productName: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '700' },
  totalLabel: { color: ink, fontSize: purchaseTextScale.subtitle, fontWeight: '800' },
  totalLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EAE9F0' },
  detailRow: { gap: 4, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0EEF5' },
  detailLabel: { color: muted, fontSize: 10 },
  detailValue: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '600' },
  accordionHeader: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  historyList: { gap: 3, marginTop: 7 },
  historyRow: { minHeight: 55, flexDirection: 'row', gap: 12 },
  historyMarkerColumn: { width: 13, alignItems: 'center' },
  historyMarker: { width: 9, height: 9, marginTop: 4, borderRadius: 5, backgroundColor: '#C9C6D4' },
  historyMarkerActive: { backgroundColor: purple },
  historyLine: { flex: 1, width: 1, backgroundColor: '#DAD7E4', marginVertical: 3 },
  historyCopy: { flex: 1, gap: 3 },
  historyStatus: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '700' },
  outlineButton: { minHeight: 41, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#D8D1F6', borderRadius: 11 },
  outlineButtonText: { color: purple, fontSize: 11, fontWeight: '700' },
  formCard: { padding: 18, gap: 15, borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 16, backgroundColor: '#FFFFFF' },
  formHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 3 },
  noChoices: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, backgroundColor: '#F2EFFF' },
  selector: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderWidth: 1, borderColor: '#DEDCE7', borderRadius: 12, backgroundColor: '#FFFFFF' },
  selectorCopy: { flex: 1, gap: 4 },
  selectorValue: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '600' },
  quantityBox: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#DEDCE7', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 5 },
  quantityButton: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  quantityValue: { minWidth: 16, color: ink, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  imageHeading: { gap: 3, marginBottom: 7 },
  imageRow: { flexDirection: 'row', gap: 8 },
  imagePreviewWrap: { position: 'relative', width: 66, height: 66 },
  imagePreview: { width: 66, height: 66, borderRadius: 10, backgroundColor: '#F2EFFF' },
  removeImage: { position: 'absolute', top: -5, right: -5, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#555367' },
  addImage: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1, borderStyle: 'dashed', borderColor: '#B9B2D6', borderRadius: 10, backgroundColor: '#FCFBFF' },
  addImageText: { color: purple, fontSize: 9, fontWeight: '700' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 2 },
  cancelButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, borderRadius: 11, borderWidth: 1, borderColor: '#E1DFE8' },
  cancelText: { color: muted, fontSize: purchaseTextScale.body, fontWeight: '700' },
  submitButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 11, backgroundColor: purple },
  submitDisabled: { opacity: 0.45 },
  submitText: { color: '#FFFFFF', fontSize: purchaseTextScale.body, fontWeight: '700' },
  successNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 11, backgroundColor: '#E5F6ED' },
  successText: { flex: 1, color: '#18794E', fontSize: purchaseTextScale.body, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(24,22,38,0.42)' },
  modalCard: { maxHeight: '75%', paddingHorizontal: 17, paddingTop: 16, paddingBottom: 28, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  modalOption: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  modalOptionCopy: { flex: 1, gap: 3 },
});
