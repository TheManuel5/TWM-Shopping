import { type ReactNode, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type QuoteStatus =
  | 'Solicitada'
  | 'Respondida'
  | 'Aceptada por el cliente'
  | 'Expirada';

export type QuoteItem = {
  id: number;
  name: string;
  detail: string;
  unitPrice: number;
  qty: number;
};

export type QuoteHistory = {
  date: string;
  total: number;
  reason: string;
};

export type Quote = {
  id: string;
  vendor: string;
  emittedDate: string;
  validUntil: string;
  status: QuoteStatus;
  total: number;
  items: QuoteItem[];
  history: QuoteHistory[];
};

export const initialQuotes: Quote[] = [
  {
    id: 'COT-024',
    vendor: 'Tienda Sur',
    emittedDate: '20 sep 2026',
    validUntil: '5 oct 2026',
    status: 'Respondida',
    total: 77350,
    items: [
      {
        id: 2,
        name: 'Zapatillas deportivas',
        detail: 'Color negro/blanco · Talla 42',
        unitPrice: 29750,
        qty: 2,
      },
      {
        id: 1,
        name: 'Mochila urbana',
        detail: 'Color negro',
        unitPrice: 17850,
        qty: 1,
      },
    ],
    history: [
      {
        date: '21 sep 2026',
        total: 77350,
        reason: 'Cotización respondida con descuento por volumen',
      },
      {
        date: '20 sep 2026',
        total: 78900,
        reason: 'Precio inicial al emitir la solicitud',
      },
    ],
  },
  {
    id: 'COT-023',
    vendor: 'Electrohogar SpA',
    emittedDate: '15 sep 2026',
    validUntil: '30 sep 2026',
    status: 'Solicitada',
    total: 124990,
    items: [
      {
        id: 3,
        name: 'Cafetera espresso',
        detail: 'Color acero',
        unitPrice: 124990,
        qty: 1,
      },
    ],
    history: [
      {
        date: '15 sep 2026',
        total: 124990,
        reason: 'Solicitud emitida por el cliente',
      },
    ],
  },
  {
    id: 'COT-019',
    vendor: 'Mundo Outdoor',
    emittedDate: '1 ago 2026',
    validUntil: '16 ago 2026',
    status: 'Expirada',
    total: 52900,
    items: [
      {
        id: 4,
        name: 'Botella térmica',
        detail: 'Color verde · 1,2 L',
        unitPrice: 52900,
        qty: 1,
      },
    ],
    history: [
      {
        date: '23 ago 2026',
        total: 52900,
        reason: 'Ajuste automático semanal tras 15 días',
      },
      {
        date: '1 ago 2026',
        total: 49900,
        reason: 'Precio inicial emitido',
      },
    ],
  },
];

type Props = {
  quotes: Quote[];
  onBack: () => void;
  onGoToCart: () => void;
  onAcceptQuote: (quote: Quote) => void;
};

type QuoteFilter =
  | 'Todas'
  | 'Solicitada'
  | 'Respondida'
  | 'Aceptada'
  | 'Expirada';

const filters: QuoteFilter[] = [
  'Todas',
  'Solicitada',
  'Respondida',
  'Aceptada',
  'Expirada',
];

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';

function formatCLP(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

function statusColors(status: QuoteStatus) {
  if (status === 'Respondida') {
    return { backgroundColor: '#EEE9FF', color: purple };
  }
  if (status === 'Aceptada por el cliente') {
    return { backgroundColor: '#E7F7EF', color: '#178757' };
  }
  if (status === 'Expirada') {
    return { backgroundColor: '#F1F0F4', color: '#77768A' };
  }
  return { backgroundColor: '#EEF2FF', color: '#5364B8' };
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  const colors = statusColors(status);
  return (
    <View style={[styles.statusBadge, { backgroundColor: colors.backgroundColor }]}>
      <AppText style={[styles.statusText, { color: colors.color }]}>{status}</AppText>
    </View>
  );
}

function AppText({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.text, style]}>{children}</Text>;
}

function Header({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          style={styles.backButton}>
          <AppText style={styles.backArrow}>‹</AppText>
        </Pressable>
        <View>
          <View style={styles.headerIdentity}>
            <MaterialIcons name="shopping-bag" size={14} color="#E5DEFF" />
            <AppText style={styles.headerEyebrow}>Mi cuenta · Gaby</AppText>
          </View>
          <AppText style={styles.headerTitle}>{title}</AppText>
        </View>
      </View>
    </View>
  );
}

export default function QuotationsScreen({
  quotes,
  onBack,
  onGoToCart,
  onAcceptQuote,
}: Props) {
  const [filter, setFilter] = useState<QuoteFilter>('Todas');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedQuote = quotes.find((quote) => quote.id === selectedId);

  const visibleQuotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es-CL');
    return quotes.filter((quote) => {
      const matchesStatus =
        filter === 'Todas' ||
        (filter === 'Aceptada'
          ? quote.status.startsWith('Aceptada')
          : quote.status === filter);
      const searchableText = `${quote.id} ${quote.vendor} ${quote.items
        .map((item) => item.name)
        .join(' ')}`.toLocaleLowerCase('es-CL');
      return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [filter, query, quotes]);

  const listScreen = () => (
    <>
      <Header
        title="Mis cotizaciones"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PrimaryButton label="＋　Nueva cotización" onPress={onGoToCart} />
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={19} color={muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar cotizaciones..."
            placeholderTextColor="#9696A5"
            style={styles.searchInput}
            accessibilityLabel="Buscar cotizaciones"
            returnKeyType="search"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {filters.map((option) => {
            const count = option === 'Todas'
              ? quotes.length
              : quotes.filter((quote) =>
                  option === 'Aceptada'
                    ? quote.status.startsWith('Aceptada')
                    : quote.status === option,
                ).length;
            const active = filter === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(option)}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <AppText style={[styles.filterText, active && styles.filterTextActive]}>
                  {option === 'Todas' ? `Todas (${count})` : `${option}${count ? ` (${count})` : ''}`}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {visibleQuotes.length ? (
          visibleQuotes.map((quote) => (
            <Pressable
              key={quote.id}
              accessibilityRole="button"
              accessibilityLabel={`${quote.id}, ${quote.vendor}, ${quote.status}`}
              onPress={() => setSelectedId(quote.id)}
              style={({ pressed }) => [styles.quoteCard, pressed && styles.pressed]}>
              <View style={styles.quoteCardTop}>
                <AppText style={styles.quoteId}>{quote.id}</AppText>
                <StatusBadge status={quote.status} />
              </View>
              <View style={styles.vendorRow}>
                <AppText style={styles.vendorName}>{quote.vendor}</AppText>
                <MaterialIcons name="chevron-right" size={20} color={purple} />
              </View>
              <AppText style={styles.metaText}>
                {quote.items.length} {quote.items.length === 1 ? 'producto' : 'productos'} · {quote.emittedDate}
              </AppText>
              {quote.status === 'Respondida' ||
              quote.status === 'Aceptada por el cliente' ? (
                <View style={styles.quoteResponse}>
                  <AppText style={styles.quoteTotal}>{formatCLP(quote.total)}</AppText>
                  <AppText style={styles.responseAction}>Ver respuesta</AppText>
                </View>
              ) : null}
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <MaterialIcons name="description" size={32} color={purple} />
            <AppText style={styles.emptyTitle}>No hay cotizaciones en esta vista</AppText>
            <AppText style={styles.emptyCopy}>
              Cambia el filtro o solicita una cotización desde tu carrito.
            </AppText>
          </View>
        )}

        <View style={styles.infoCard}>
          <MaterialIcons name="schedule" size={19} color={purple} />
          <AppText style={styles.infoText}>
            Los precios se mantienen por 15 días y luego se actualizan semanalmente.
          </AppText>
        </View>
      </ScrollView>
    </>
  );

  const detailScreen = () => {
    if (!selectedQuote) return listScreen();
    return (
      <>
        <Header
          title="Detalle de cotización"
          onBack={() => setSelectedId(null)}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.detailCard}>
            <View style={styles.quoteCardTop}>
              <AppText style={styles.detailTitle}>{selectedQuote.id}</AppText>
              <StatusBadge status={selectedQuote.status} />
            </View>
            <AppText style={styles.vendorName}>{selectedQuote.vendor}</AppText>
            <AppText style={styles.metaText}>Emitida el {selectedQuote.emittedDate}</AppText>
            <View style={styles.divider} />
            <AppText style={styles.detailLabel}>Válida hasta el</AppText>
            <AppText style={styles.validUntil}>{selectedQuote.validUntil}</AppText>
            <AppText style={styles.validityNote}>Precios fijos por 15 días</AppText>
          </View>

          <View style={styles.detailCard}>
            <AppText style={styles.sectionTitle}>Productos cotizados</AppText>
            {selectedQuote.items.map((item) => (
              <View key={`${selectedQuote.id}-${item.id}`} style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <MaterialIcons name="inventory-2" size={18} color={purple} />
                </View>
                <View style={styles.itemCopy}>
                  <AppText style={styles.itemName}>{item.name}</AppText>
                  <AppText style={styles.metaText}>{item.detail}</AppText>
                  <AppText style={styles.metaText}>
                    {item.qty} × {formatCLP(item.unitPrice)}
                  </AppText>
                </View>
                <AppText style={styles.itemSubtotal}>
                  {formatCLP(item.qty * item.unitPrice)}
                </AppText>
              </View>
            ))}
            <View style={styles.totalRow}>
              <AppText style={styles.totalLabel}>Total de la cotización</AppText>
              <AppText style={styles.totalAmount}>{formatCLP(selectedQuote.total)}</AppText>
            </View>
          </View>

          <View style={styles.detailCard}>
            <AppText style={styles.sectionTitle}>Historial de precios</AppText>
            {selectedQuote.history.map((item, index) => (
              <View key={`${item.date}-${index}`} style={styles.historyRow}>
                <View style={styles.historyDot} />
                <View style={styles.historyCopy}>
                  <AppText style={styles.historyDate}>{item.date}</AppText>
                  <AppText style={styles.metaText}>{item.reason}</AppText>
                </View>
                <AppText style={styles.historyTotal}>{formatCLP(item.total)}</AppText>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={19} color={purple} />
            <AppText style={styles.infoText}>
              Después de 15 días, los precios pueden actualizarse semanalmente. La cotización se elimina a los 45 días.
            </AppText>
          </View>
          {selectedQuote.status !== 'Expirada' &&
          selectedQuote.status !== 'Aceptada por el cliente' ? (
            <PrimaryButton
              label="Aceptar y comprar"
              onPress={() => onAcceptQuote(selectedQuote)}
            />
          ) : null}
          <OutlineButton label="Volver a mis cotizaciones" onPress={() => setSelectedId(null)} />
        </ScrollView>
      </>
    );
  };

  return <View style={styles.screen}>{selectedId ? detailScreen() : listScreen()}</View>;
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      <AppText style={styles.primaryButtonText}>{label}</AppText>
    </Pressable>
  );
}

function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
      <AppText style={styles.outlineButtonText}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF9FD', width: '100%', maxWidth: 390, alignSelf: 'center' },
  text: { color: ink, fontSize: 13, fontFamily: 'System' },
  header: { height: 92, justifyContent: 'center', backgroundColor: purple, paddingHorizontal: 16, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: '#FFFFFF', fontSize: 30, lineHeight: 34, marginTop: -3 },
  headerIdentity: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  headerEyebrow: { color: '#D9D0FF', fontSize: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  content: { padding: 16, gap: 14, paddingBottom: 96 },
  searchBox: { minHeight: 42, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 12, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF' },
  searchInput: { flex: 1, minHeight: 40, fontSize: 12, color: ink, paddingVertical: 0 },
  filterRow: { gap: 8, paddingRight: 4 },
  filterChip: { minHeight: 31, borderRadius: 18, borderWidth: 1, borderColor: '#E9E7F0', backgroundColor: '#FFFFFF', paddingHorizontal: 12, justifyContent: 'center' },
  filterChipActive: { backgroundColor: '#EEE9FF', borderColor: '#E0D8FF' },
  filterText: { color: muted, fontSize: 10, fontWeight: '600' },
  filterTextActive: { color: purple },
  quoteCard: { borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 15, backgroundColor: '#FFFFFF', padding: 16, gap: 7 },
  quoteCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  quoteId: { fontSize: 13, color: ink, fontWeight: '900' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 9, fontWeight: '700' },
  vendorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vendorName: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: '700', color: ink },
  metaText: { fontSize: 10, lineHeight: 15, color: muted },
  quoteResponse: { marginTop: 5, padding: 8, borderRadius: 9, backgroundColor: '#F2EEFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quoteTotal: { color: ink, fontSize: 14, fontWeight: '900' },
  responseAction: { color: purple, fontSize: 10, fontWeight: '700' },
  emptyCard: { minHeight: 180, borderRadius: 14, borderWidth: 1, borderColor: '#EEEAF5', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 22, gap: 8 },
  emptyTitle: { color: ink, fontSize: 14, textAlign: 'center', fontWeight: '700' },
  emptyCopy: { color: muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: 12, backgroundColor: '#F1EEFF' },
  infoText: { flex: 1, color: '#5E5973', fontSize: 11, lineHeight: 16 },
  detailCard: { borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 15, backgroundColor: '#FFFFFF', padding: 16, gap: 7 },
  detailTitle: { fontSize: 16, fontWeight: '900', color: ink },
  detailLabel: { color: muted, fontSize: 10 },
  validUntil: { color: ink, fontSize: 14, fontWeight: '800' },
  validityNote: { color: purple, fontSize: 10, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EAE9F0', marginVertical: 7 },
  sectionTitle: { color: ink, fontSize: 13, fontWeight: '800', marginBottom: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  itemIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F1EEFF', alignItems: 'center', justifyContent: 'center' },
  itemCopy: { flex: 1, gap: 2 },
  itemName: { color: ink, fontSize: 11, fontWeight: '700' },
  itemSubtotal: { color: ink, fontSize: 11, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9, paddingVertical: 8, paddingHorizontal: 9, borderRadius: 9, backgroundColor: '#EEE9FF' },
  totalLabel: { color: ink, fontSize: 11, fontWeight: '700' },
  totalAmount: { color: purple, fontSize: 16, fontWeight: '900' },
  historyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  historyDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: purple, marginTop: 4 },
  historyCopy: { flex: 1, gap: 2 },
  historyDate: { color: ink, fontSize: 10, fontWeight: '700' },
  historyTotal: { color: ink, fontSize: 10, fontWeight: '800' },
  primaryButton: { minHeight: 46, borderRadius: 12, backgroundColor: purple, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  outlineButton: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: '#D8D1F6', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  outlineButtonText: { color: purple, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
