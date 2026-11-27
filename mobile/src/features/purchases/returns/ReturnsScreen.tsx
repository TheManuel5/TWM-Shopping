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
import type { PurchaseOrder, ReturnRequest, ReturnStatus } from '../purchaseTypes';

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

function Progress({
  status,
  date,
}: {
  status: ReturnStatus;
  date: string;
}) {
  if (status === 'Rechazada') {
    return (
      <View style={styles.rejectedNotice}>
        <MaterialIcons name="cancel" size={18} color="#A52B2B" />
        <Text style={styles.rejectedText}>La solicitud fue rechazada. Revisa el motivo y contacta al vendedor.</Text>
      </View>
    );
  }

  const currentStep = status === 'Finalizada' ? 2 : status === 'Aprobada' ? 1 : 0;
  const labels = ['Solicitada', 'Aprobada', 'Reembolso procesado'];
  return (
    <View style={styles.progressRow}>
      {labels.map((label, index) => {
        const complete = index <= currentStep;
        const stepDate = index === 0 ? date : '';
        return (
          <View key={label} style={styles.progressStep}>
            <View style={[styles.progressDot, complete && styles.progressDotComplete]}>
              {complete ? <MaterialIcons name="check" size={13} color="#FFFFFF" /> : null}
            </View>
            <Text style={[styles.progressLabel, complete && styles.progressLabelComplete]}>{label}</Text>
            {stepDate ? <Text style={styles.progressDate}>{stepDate}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

function ReturnCard({
  request,
  order,
  selected,
  onPress,
}: {
  request: ReturnRequest;
  order?: PurchaseOrder;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.returnCard, selected && styles.returnCardSelected]}>
      <View style={styles.returnCardTop}>
        <Text style={styles.returnId}>Solicitud {request.id}</Text>
        <ReturnStatusPill status={request.status} />
      </View>
      <Text style={styles.returnProduct} numberOfLines={2}>{request.product}</Text>
      <Text style={styles.mutedText}>
        Pedido #{request.orderId} · {order?.store || 'Vendedor'} · {request.date}
      </Text>
      <Text style={styles.returnAmount}>{money(request.price)}</Text>
    </Pressable>
  );
}

export default function ReturnsScreen({
  orders,
  requests,
  initialOrderId,
  onRequestChange,
  onBack,
}: {
  orders: PurchaseOrder[];
  requests: ReturnRequest[];
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
  const [activeId, setActiveId] = useState(requests[0]?.id || '');
  const [filter, setFilter] = useState('Todas');
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
  const visibleRequests = requests.filter((request) =>
    filter === 'Todas' || request.status === filter,
  );
  const activeRequest = visibleRequests.find((request) => request.id === activeId)
    || visibleRequests[0];

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
    setActiveId(requestId);
    setFilter('Todas');
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
        onBack={showRequestForm ? leaveRequestForm : onBack}
      />
      {showRequestForm ? (
        <ScrollView contentContainerStyle={styles.formPageContent}>
          <View style={styles.intro}>
            <Text style={styles.pageTitle}>Nueva solicitud</Text>
            <Text style={styles.mutedText}>Selecciona el producto entregado, el motivo y la cantidad.</Text>
          </View>
          {requestForm}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {notice ? (
            <View style={styles.successNotice}>
              <MaterialIcons name="check-circle" size={18} color="#18794E" />
              <Text style={styles.successText}>{notice}</Text>
              <Pressable accessibilityLabel="Cerrar aviso" onPress={() => setNotice(null)}>
                <MaterialIcons name="close" size={18} color="#18794E" />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.intro}>
            <Text style={styles.pageTitle}>Mis solicitudes</Text>
            <Text style={styles.mutedText}>Revisa el estado y el importe de tus devoluciones.</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowRequestForm(true)}
            style={styles.newRequestButton}>
            <MaterialIcons name="add" size={19} color="#FFFFFF" />
            <Text style={styles.newRequestText}>Solicitar devolución</Text>
          </Pressable>

          <View style={styles.filterRow}>
            <Text style={styles.fieldLabel}>Filtrar por estado</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {returnStatuses.map((status) => {
                const selected = filter === status;
                return (
                  <Pressable
                    key={status}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setFilter(status);
                      setActiveId('');
                    }}
                    style={[styles.filterChip, selected && styles.filterChipSelected]}>
                    <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{status}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Text style={styles.requestCount}>{visibleRequests.length} solicitudes</Text>
          {visibleRequests.length ? visibleRequests.map((request) => (
            <ReturnCard
              key={request.id}
              request={request}
              order={orders.find((order) => order.id === request.orderId)}
              selected={activeRequest?.id === request.id}
              onPress={() => setActiveId(request.id)}
            />
          )) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="assignment-return" size={32} color={purple} />
              <Text style={styles.emptyTitle}>Aún no tienes solicitudes</Text>
              <Text style={styles.mutedText}>Toca “Solicitar devolución” para empezar con un pedido entregado.</Text>
            </View>
          )}

          {activeRequest ? (
            <View style={styles.card}>
              <View style={styles.detailHeader}>
                <View style={styles.detailCopy}>
                  <Text style={styles.sectionTitle}>Solicitud {activeRequest.id}</Text>
                  <Text style={styles.mutedText}>{activeRequest.reason} · {activeRequest.qty} unidad{activeRequest.qty === 1 ? '' : 'es'}</Text>
                </View>
                <ReturnStatusPill status={activeRequest.status} />
              </View>
              <Progress status={activeRequest.status} date={activeRequest.date} />
              <View style={styles.refundBox}>
                <Text style={styles.mutedText}>Importe solicitado</Text>
                <Text style={styles.refundAmount}>{money(activeRequest.price)}</Text>
                <Text style={styles.mutedText}>
                  {activeRequest.status === 'Finalizada'
                    ? 'Reembolso procesado al medio de pago original.'
                    : 'Te informaremos cuando avance la revisión de la solicitud.'}
                </Text>
              </View>
              {activeRequest.images.length ? (
                <View>
                  <Text style={styles.sectionTitle}>Fotos de respaldo</Text>
                  <View style={styles.imageRow}>
                    {activeRequest.images.map((uri) => (
                      <Image key={uri} source={{ uri }} style={styles.imagePreview} />
                    ))}
                  </View>
                </View>
              ) : null}
              <Text style={styles.sectionTitle}>¿Qué sigue?</Text>
              <Text style={styles.mutedText}>Conserva el embalaje y coordina con el vendedor la entrega del producto. El reembolso se procesa una vez aprobada y recibida la devolución.</Text>
              <Pressable
                onPress={() => Alert.alert('Mensajes', 'La mensajería del vendedor todavía no está conectada en esta versión móvil.')}
                style={styles.outlineButton}>
                <MaterialIcons name="chat" size={18} color={purple} />
                <Text style={styles.outlineButtonText}>Contactar vendedor</Text>
              </Pressable>
            </View>
          ) : null}
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
  content: { padding: 18, paddingBottom: 36, gap: 16 },
  formPageContent: { padding: 18, paddingBottom: 36, gap: 16 },
  intro: { gap: 6, marginBottom: 2, paddingHorizontal: 2 },
  pageTitle: { color: ink, fontSize: 17, fontWeight: '800' },
  mutedText: { color: muted, fontSize: 11, lineHeight: 16 },
  fieldLabel: { color: muted, fontSize: 10, fontWeight: '600' },
  helperText: { color: muted, fontSize: 10, lineHeight: 15 },
  filterRow: { gap: 8 },
  filterScroll: { gap: 7, paddingVertical: 2 },
  filterChip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 15, backgroundColor: '#F0EEF6' },
  filterChipSelected: { backgroundColor: purple },
  filterText: { color: muted, fontSize: 10, fontWeight: '600' },
  filterTextSelected: { color: '#FFFFFF' },
  newRequestButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, backgroundColor: purple },
  newRequestText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  requestCount: { color: muted, fontSize: 11, marginTop: -7 },
  returnCard: { padding: 16, gap: 9, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#EEEAF5' },
  returnCardSelected: { borderColor: purple, backgroundColor: '#FCFBFF' },
  returnCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7 },
  returnId: { color: ink, fontSize: 12, fontWeight: '800' },
  statusPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 9, fontWeight: '700' },
  returnProduct: { color: ink, fontSize: 12, fontWeight: '700' },
  returnAmount: { color: purple, fontSize: 13, fontWeight: '900' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  progressStep: { flex: 1, alignItems: 'center', gap: 4 },
  progressDot: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: '#D9D6E3', backgroundColor: '#FFFFFF' },
  progressDotComplete: { backgroundColor: purple, borderColor: purple },
  progressLabel: { color: muted, fontSize: 8, textAlign: 'center' },
  progressLabelComplete: { color: purple, fontWeight: '700' },
  progressDate: { color: muted, fontSize: 8, textAlign: 'center' },
  rejectedNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, borderRadius: 10, backgroundColor: '#FDE9E9' },
  rejectedText: { flex: 1, color: '#A52B2B', fontSize: 10, lineHeight: 15 },
  emptyCard: { alignItems: 'center', gap: 7, padding: 22, borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 14, backgroundColor: '#FFFFFF' },
  emptyTitle: { color: ink, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  card: { padding: 18, gap: 14, borderRadius: 15, borderWidth: 1, borderColor: '#EEEAF5', backgroundColor: '#FFFFFF' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7 },
  detailCopy: { flex: 1, gap: 3 },
  sectionTitle: { color: ink, fontSize: 13, fontWeight: '800' },
  refundBox: { padding: 13, gap: 4, borderRadius: 12, backgroundColor: '#F2EFFF' },
  refundAmount: { color: purple, fontSize: 23, fontWeight: '900' },
  outlineButton: { minHeight: 41, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#D8D1F6', borderRadius: 11 },
  outlineButtonText: { color: purple, fontSize: 11, fontWeight: '700' },
  formCard: { padding: 18, gap: 15, borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 16, backgroundColor: '#FFFFFF' },
  formHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 3 },
  noChoices: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, backgroundColor: '#F2EFFF' },
  selector: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderWidth: 1, borderColor: '#DEDCE7', borderRadius: 12, backgroundColor: '#FFFFFF' },
  selectorCopy: { flex: 1, gap: 4 },
  selectorValue: { color: ink, fontSize: 12, fontWeight: '600' },
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
  cancelText: { color: muted, fontSize: 11, fontWeight: '700' },
  submitButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 11, backgroundColor: purple },
  submitDisabled: { opacity: 0.45 },
  submitText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  successNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 11, backgroundColor: '#E5F6ED' },
  successText: { flex: 1, color: '#18794E', fontSize: 11, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(24,22,38,0.42)' },
  modalCard: { maxHeight: '75%', paddingHorizontal: 17, paddingTop: 16, paddingBottom: 28, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  modalOption: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  modalOptionCopy: { flex: 1, gap: 3 },
});
