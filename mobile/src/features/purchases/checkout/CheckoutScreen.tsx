import { MaterialIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import OrdersReturnsHeader from '../OrdersReturnsHeader';
import type {
  CartItem,
  DeliveryMode,
  PaymentMethod,
  PurchaseAddress,
} from '../purchaseTypes';
import {
  AppText,
  PriceRow,
  PrimaryButton,
  purchaseTextScale,
  SectionTitle,
} from '../components/PurchaseUi';

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';

function money(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function CheckoutScreen({
  items,
  vendor,
  accountName,
  selectedAddress,
  deliveryMode,
  paymentMethod,
  cardLast4,
  transferCode,
  acceptedTerms,
  error,
  shippingCost,
  onBack,
  onManageAddresses,
  onDeliveryModeChange,
  onPaymentMethodChange,
  onCardLast4Change,
  onTransferCodeChange,
  onToggleTerms,
  onConfirm,
}: {
  items: CartItem[];
  vendor: string;
  accountName: string;
  selectedAddress?: PurchaseAddress;
  deliveryMode: DeliveryMode;
  paymentMethod: PaymentMethod;
  cardLast4: string;
  transferCode: string;
  acceptedTerms: boolean;
  error: string | null;
  shippingCost: number;
  onBack: () => void;
  onManageAddresses: () => void;
  onDeliveryModeChange: (mode: DeliveryMode) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCardLast4Change: (value: string) => void;
  onTransferCodeChange: (value: string) => void;
  onToggleTerms: () => void;
  onConfirm: () => void;
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;
  const net = Math.round(total / 1.19);
  const deliveryComplete = deliveryMode === 'Retiro' || Boolean(selectedAddress);
  const paymentComplete = paymentMethod === 'Tarjeta'
    ? /^\d{4}$/.test(cardLast4)
    : transferCode.trim().length >= 5;
  const currentStep = !deliveryComplete ? 1 : !paymentComplete ? 2 : 3;

  return (
    <>
      <OrdersReturnsHeader title="Finalizar compra" accountName={accountName} onBack={onBack} />
      <ScrollView style={styles.scrollViewport} contentContainerStyle={styles.content}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeading}>
            <View style={styles.progressIcon}>
              <MaterialIcons name="shopping-bag" size={18} color={purple} />
            </View>
            <View style={styles.progressCopy}>
              <AppText style={styles.progressTitle}>Completa tu compra</AppText>
              <AppText style={styles.intro}>
                Revisa la entrega y el pago antes de confirmar.
              </AppText>
            </View>
          </View>
          <View style={styles.stepRow}>
            <CheckoutStep number={1} label="Entrega" currentStep={currentStep} />
            <View style={styles.stepLine} />
            <CheckoutStep number={2} label="Pago" currentStep={currentStep} />
            <View style={styles.stepLine} />
            <CheckoutStep number={3} label="Confirmar" currentStep={currentStep} />
          </View>
        </View>
        {error ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={18} color="#B23B36" />
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        ) : null}

        <View style={styles.card}>
          <AppText style={styles.cardTitle}>1. Entrega</AppText>
          {(['Despacho', 'Retiro'] as const).map((option) => {
            const selected = deliveryMode === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onDeliveryModeChange(option)}
                style={[styles.option, selected && styles.optionSelected]}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <MaterialIcons
                  name={option === 'Despacho' ? 'local-shipping' : 'storefront'}
                  size={20}
                  color={purple}
                />
                <View style={styles.optionCopy}>
                  <AppText style={styles.optionTitle}>
                    {option === 'Despacho' ? 'Despacho a domicilio' : 'Retiro con el vendedor'}
                  </AppText>
                  <AppText style={styles.secondaryText}>
                    {option === 'Despacho' ? 'Según la comuna de entrega' : 'Sin costo de despacho'}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
          {deliveryMode === 'Despacho' ? (
            <View style={styles.addressBox}>
              <SectionTitle
                title="Dirección de despacho"
                action={selectedAddress ? 'Cambiar' : 'Agregar'}
                onAction={onManageAddresses}
              />
              {selectedAddress ? (
                <View style={styles.addressCopy}>
                  <View style={styles.addressTitle}>
                    <MaterialIcons name="place" size={18} color={purple} />
                    <AppText style={styles.addressName}>{selectedAddress.label}</AppText>
                  </View>
                  <AppText style={styles.secondaryText}>
                    {[
                      selectedAddress.street,
                      selectedAddress.number,
                      selectedAddress.department,
                      selectedAddress.commune,
                      selectedAddress.region,
                    ].filter(Boolean).join(', ')}
                  </AppText>
                </View>
              ) : (
                <AppText style={styles.secondaryText}>
                  Agrega una dirección para recibir tu compra.
                </AppText>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <AppText style={styles.cardTitle}>2. Medio de pago</AppText>
          {(['Tarjeta', 'Transferencia'] as const).map((option) => {
            const selected = paymentMethod === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onPaymentMethodChange(option)}
                style={[styles.option, selected && styles.optionSelected]}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <MaterialIcons
                  name={option === 'Tarjeta' ? 'credit-card' : 'account-balance'}
                  size={20}
                  color={purple}
                />
                <View style={styles.optionCopy}>
                  <AppText style={styles.optionTitle}>
                    {option === 'Tarjeta' ? 'Tarjeta de crédito o débito' : 'Transferencia'}
                  </AppText>
                  <AppText style={styles.secondaryText}>
                    {option === 'Tarjeta' ? 'Solo se guardan los últimos 4 dígitos' : 'Con código de comprobante'}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
          {paymentMethod === 'Tarjeta' ? (
            <View style={styles.inputBlock}>
              <AppText style={styles.inputLabel}>Últimos 4 dígitos de la tarjeta</AppText>
              <TextInput
                accessibilityLabel="Últimos 4 dígitos de la tarjeta"
                value={cardLast4}
                onChangeText={onCardLast4Change}
                placeholder="0000"
                placeholderTextColor="#9696A5"
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={4}
                style={styles.input}
              />
              <AppText style={styles.helperText}>
                No guardamos el número completo de tu tarjeta.
              </AppText>
              {!paymentComplete ? (
                <AppText style={styles.validationHint}>
                  Falta ingresar los 4 dígitos para continuar.
                </AppText>
              ) : null}
            </View>
          ) : (
            <View style={styles.inputBlock}>
              <AppText style={styles.inputLabel}>Código del comprobante de transferencia</AppText>
              <TextInput
                accessibilityLabel="Código del comprobante de transferencia"
                value={transferCode}
                onChangeText={onTransferCodeChange}
                placeholder="Ingresa el código del comprobante"
                placeholderTextColor="#9696A5"
                autoCapitalize="characters"
                style={styles.input}
              />
              <AppText style={styles.helperText}>
                Transfiere al vendedor y registra aquí el código de tu comprobante.
              </AppText>
              {!paymentComplete ? (
                <AppText style={styles.validationHint}>
                  Falta un código de comprobante válido (mínimo 5 caracteres).
                </AppText>
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <AppText style={styles.cardTitle}>3. Resumen de compra</AppText>
          <View style={styles.vendorRow}>
            <MaterialIcons name="storefront" size={18} color={purple} />
            <AppText style={styles.vendorName}>{vendor || 'Vendedor'}</AppText>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <AppText style={styles.itemName} numberOfLines={1}>
                {item.quantity} × {item.name}
              </AppText>
              <AppText style={styles.itemAmount}>{money(item.price * item.quantity)}</AppText>
            </View>
          ))}
          <View style={styles.divider} />
          <PriceRow label="Subtotal" value={money(subtotal)} />
          <PriceRow
            label={deliveryMode === 'Despacho' ? 'Despacho' : 'Retiro con el vendedor'}
            value={shippingCost ? money(shippingCost) : 'Sin costo'}
          />
          <View style={styles.divider} />
          <PriceRow label="Valor neto" value={money(net)} />
          <PriceRow label="IVA (19 %)" value={money(total - net)} />
          <View style={styles.totalSummary}>
            <AppText style={styles.totalLabel}>Total a pagar</AppText>
            <AppText style={styles.totalAmount}>{money(total)}</AppText>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          onPress={onToggleTerms}
          style={styles.termsRow}>
          <View style={[styles.termsCheckbox, acceptedTerms && styles.termsCheckboxSelected]}>
            {acceptedTerms ? <MaterialIcons name="check" size={15} color="#FFFFFF" /> : null}
          </View>
          <AppText style={styles.termsText}>
            Confirmo que los datos de entrega y pago son correctos.
          </AppText>
        </Pressable>
        <PrimaryButton
          label={`Confirmar y pagar ${money(total)}`}
          disabled={
            !acceptedTerms ||
            !items.length ||
            !deliveryComplete ||
            !paymentComplete
          }
          onPress={onConfirm}
        />
      </ScrollView>
    </>
  );
}

function CheckoutStep({
  number,
  label,
  currentStep,
}: {
  number: number;
  label: string;
  currentStep: number;
}) {
  const completed = number < currentStep;
  const active = number === currentStep;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${label}, ${completed ? 'completado' : active ? 'actual' : 'pendiente'}`}
      style={styles.step}>
      <View
        style={[
            styles.stepCircle,
            completed && styles.stepCircleCompleted,
            active && styles.stepCircleActive,
        ]}>
        {completed ? (
            <MaterialIcons name="check" size={13} color="#FFFFFF" />
        ) : (
            <AppText style={[styles.stepNumber, active && styles.stepNumberActive]}>
              {number}
            </AppText>
        )}
      </View>
      <AppText style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollViewport: { flex: 1, backgroundColor: '#FAF9FD' },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  progressCard: { padding: 13, gap: 13, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF5' },
  progressHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#F1EEFF' },
  progressCopy: { flex: 1, gap: 2 },
  progressTitle: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '800' },
  intro: { color: muted, fontSize: purchaseTextScale.body, lineHeight: 17 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { alignItems: 'center', gap: 5 },
  stepCircle: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D7D5E0', borderRadius: 13, backgroundColor: '#FFFFFF' },
  stepCircleCompleted: { borderColor: purple, backgroundColor: purple },
  stepCircleActive: { borderColor: purple, backgroundColor: '#F1EEFF' },
  stepNumber: { color: muted, fontSize: 11, fontWeight: '600' },
  stepNumberActive: { color: purple, fontWeight: '800' },
  stepLabel: { color: muted, fontSize: purchaseTextScale.caption },
  stepLabelActive: { color: purple, fontWeight: '700' },
  stepLine: { flex: 1, height: 1, marginHorizontal: 9, marginBottom: 16, backgroundColor: '#DAD8E3' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 11, backgroundColor: '#FDEDEC' },
  errorText: { flex: 1, color: '#9E302B', fontSize: 11, lineHeight: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#EEEAF5' },
  cardTitle: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '700', marginBottom: 10 },
  option: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E9E7F0', borderRadius: 12, backgroundColor: '#FFFFFF' },
  optionSelected: { borderColor: purple, backgroundColor: '#F6F3FF' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#C8C5D3', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: purple },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: purple },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '600' },
  secondaryText: { color: muted, fontSize: 10, lineHeight: 15 },
  addressBox: { marginTop: 7, padding: 12, borderRadius: 12, backgroundColor: '#F8F7FB' },
  addressCopy: { gap: 3 },
  addressTitle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressName: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '700' },
  inputBlock: { marginTop: 8, marginBottom: 5 },
  inputLabel: { color: muted, fontSize: 11, marginTop: 12, marginBottom: 6 },
  input: { height: 43, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 10, paddingHorizontal: 12, color: ink, fontSize: 13 },
  helperText: { color: muted, fontSize: 10, lineHeight: 15, marginTop: 5 },
  validationHint: { color: '#A52B2B', fontSize: 10, lineHeight: 15, marginTop: 5 },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  vendorName: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '800' },
  itemRow: { minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  itemName: { flex: 1, color: muted, fontSize: 11 },
  itemAmount: { color: ink, fontSize: 11, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EAE9F0', marginVertical: 8 },
  totalSummary: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10, paddingHorizontal: 13, borderRadius: 12, backgroundColor: '#F1EEFF' },
  totalLabel: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '700' },
  totalAmount: { color: purple, fontSize: 19, fontWeight: '900' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 3, paddingVertical: 5 },
  termsCheckbox: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#B9B6C5', borderRadius: 5, backgroundColor: '#FFFFFF' },
  termsCheckboxSelected: { borderColor: purple, backgroundColor: purple },
  termsText: { flex: 1, color: muted, fontSize: purchaseTextScale.body, lineHeight: 18 },
});
