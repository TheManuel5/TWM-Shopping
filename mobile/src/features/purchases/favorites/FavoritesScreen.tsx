import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import OrdersReturnsHeader from '../OrdersReturnsHeader';
import type { CartItem } from '../purchaseTypes';
import {
  AppText,
  EmptyState,
  PrimaryButton,
  purchaseTextScale,
} from '../components/PurchaseUi';

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';
type FavoriteKind = 'Todos' | 'Producto' | 'Servicio';
type FilterPicker = 'category' | 'vendor' | 'sort';

const sortOptions = [
  { label: 'Más recientes', value: 'recent' },
  { label: 'Nombre (A–Z)', value: 'name' },
  { label: 'Menor precio', value: 'lowest' },
  { label: 'Mayor precio', value: 'highest' },
];

function money(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function FavoritesScreen({
  favorites,
  accountName,
  quoteError,
  onAddToCart,
  onRemove,
  onBack,
  onExplore,
  onRequestQuote,
  onClearQuoteError,
}: {
  favorites: CartItem[];
  accountName: string;
  quoteError: string | null;
  onAddToCart: (item: CartItem) => void;
  onRemove: (id: number) => void;
  onBack: () => void;
  onExplore: () => void;
  onRequestQuote: (items: CartItem[]) => void;
  onClearQuoteError: () => void;
}) {
  const [kind, setKind] = useState<FavoriteKind>('Todos');
  const [category, setCategory] = useState('Todas las categorías');
  const [vendor, setVendor] = useState('Todos los vendedores');
  const [sort, setSort] = useState('recent');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [picker, setPicker] = useState<FilterPicker | null>(null);

  const products = useMemo(
    () => favorites.filter((item) => (item.type ?? 'Producto') === 'Producto'),
    [favorites],
  );
  const services = useMemo(
    () => favorites.filter((item) => item.type === 'Servicio'),
    [favorites],
  );
  const source = kind === 'Todos'
    ? favorites
    : kind === 'Producto'
      ? products
      : services;
  const categories = useMemo(
    () => [...new Set(source.map((item) => item.category).filter((value): value is string => Boolean(value)))].sort(),
    [source],
  );
  const vendors = useMemo(
    () => [...new Set(source.map((item) => item.vendor))].sort((a, b) => a.localeCompare(b, 'es')),
    [source],
  );
  const selectedItems = favorites.filter((item) => selectedIds.includes(item.id));
  const visibleItems = useMemo(() => {
    const filtered = source.filter((item) =>
      (category === 'Todas las categorías' || item.category === category) &&
      (vendor === 'Todos los vendedores' || item.vendor === vendor),
    );
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      if (sort === 'lowest') return a.price - b.price;
      if (sort === 'highest') return b.price - a.price;
      return (b.savedAt ?? 0) - (a.savedAt ?? 0);
    });
  }, [category, source, sort, vendor]);

  const pickerOptions = picker === 'category'
    ? ['Todas las categorías', ...categories]
    : picker === 'vendor'
      ? ['Todos los vendedores', ...vendors]
      : sortOptions.map((option) => option.label);

  const selectPickerOption = (label: string) => {
    if (picker === 'category') setCategory(label);
    else if (picker === 'vendor') setVendor(label);
    else {
      const option = sortOptions.find((item) => item.label === label);
      if (option) setSort(option.value);
    }
    setPicker(null);
  };

  const toggleSelection = (id: number) => {
    onClearQuoteError();
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const removeFavorite = (id: number) => {
    setSelectedIds((current) => current.filter((value) => value !== id));
    onRemove(id);
  };

  const selectedSortLabel = sortOptions.find((option) => option.value === sort)?.label ?? 'Más recientes';

  return (
    <>
      <OrdersReturnsHeader title="Mis favoritos" accountName={accountName} onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, selectedItems.length > 0 && styles.withQuoteBar]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.tabs}>
          <FavoriteTab
            active={kind === 'Todos'}
            icon="favorite"
            label={`Todos (${favorites.length})`}
            onPress={() => {
              setKind('Todos');
              setCategory('Todas las categorías');
              setVendor('Todos los vendedores');
            }}
          />
          <FavoriteTab
            active={kind === 'Producto'}
            icon="shopping-cart"
            label={`Productos (${products.length})`}
            onPress={() => {
              setKind('Producto');
              setCategory('Todas las categorías');
              setVendor('Todos los vendedores');
            }}
          />
          <FavoriteTab
            active={kind === 'Servicio'}
            icon="miscellaneous-services"
            label={`Servicios (${services.length})`}
            onPress={() => {
              setKind('Servicio');
              setCategory('Todas las categorías');
              setVendor('Todos los vendedores');
            }}
          />
        </View>

        <View style={styles.filters}>
          <View style={styles.filterColumn}>
            <AppText style={styles.filterLabel}>Categoría</AppText>
            <FilterButton
              label={category}
              onPress={() => setPicker('category')}
            />
          </View>
          <View style={styles.filterColumn}>
            <AppText style={styles.filterLabel}>Vendedor</AppText>
            <FilterButton
              label={vendor}
              onPress={() => setPicker('vendor')}
            />
          </View>
        </View>
        <View style={styles.sortRow}>
          <AppText style={styles.filterLabel}>Ordenar por</AppText>
          <FilterButton
            label={selectedSortLabel}
            onPress={() => setPicker('sort')}
          />
        </View>

        {visibleItems.length ? (
          visibleItems.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <View key={item.id} style={[styles.productCard, selected && styles.productCardSelected]}>
                <View style={[styles.imagePanel, { backgroundColor: item.color }]}>
                  <AppText style={styles.productEmoji}>{item.emoji}</AppText>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Incluir ${item.name} en cotización`}
                    accessibilityState={{ checked: selected }}
                    onPress={() => toggleSelection(item.id)}
                    style={[styles.selectButton, selected && styles.selectButtonSelected]}>
                    <MaterialIcons
                      name={selected ? 'check' : 'radio-button-unchecked'}
                      size={selected ? 17 : 19}
                      color={selected ? '#FFFFFF' : '#77768A'}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar ${item.name} de favoritos`}
                    onPress={() => removeFavorite(item.id)}
                    style={styles.favoriteButton}>
                    <MaterialIcons name="favorite" size={20} color={purple} />
                  </Pressable>
                </View>
                <View style={styles.productInfo}>
                  <AppText style={styles.productName}>{item.name}</AppText>
                  <AppText style={styles.productDetail}>{item.detail}</AppText>
                  <View style={styles.priceRow}>
                    <AppText style={styles.price}>{money(item.price)}</AppText>
                    {item.originalPrice && item.originalPrice > item.price ? (
                      <>
                        <View style={styles.offerBadge}>
                          <AppText style={styles.offerText}>Oferta</AppText>
                        </View>
                        <AppText style={styles.originalPrice}>{money(item.originalPrice)}</AppText>
                      </>
                    ) : null}
                  </View>
                  {quoteError && selected ? (
                    <AppText style={styles.errorText}>{quoteError}</AppText>
                  ) : null}
                  <PrimaryButton
                    label="Agregar al carrito"
                    onPress={() => {
                      onClearQuoteError();
                      onAddToCart(item);
                    }}
                  />
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            title={favorites.length ? 'No hay favoritos con estos filtros' : 'Aún no tienes favoritos'}
            description={favorites.length
              ? 'Prueba con otra categoría o vendedor.'
              : 'Guarda productos y servicios desde el catálogo para verlos aquí.'}
          />
        )}
        <PrimaryButton label="Seguir explorando" onPress={onExplore} />
      </ScrollView>

      {selectedItems.length ? (
        <View style={styles.quoteBar}>
          <View style={styles.quoteCopy}>
            <AppText style={styles.quoteCount}>
              {selectedItems.length} {selectedItems.length === 1 ? 'seleccionado' : 'seleccionados'}
            </AppText>
            <AppText style={styles.quoteHint}>La cotización debe ser de un solo vendedor.</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSelectedIds([]);
              onClearQuoteError();
            }}
            style={styles.clearButton}>
            <AppText style={styles.clearText}>Limpiar</AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onRequestQuote(selectedItems)}
            style={styles.quoteButton}>
            <MaterialIcons name="description" size={17} color="#FFFFFF" />
            <AppText style={styles.quoteButtonText}>Cotizar</AppText>
          </Pressable>
        </View>
      ) : null}

      <Modal
        visible={picker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPicker(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>
                {picker === 'category'
                  ? 'Selecciona una categoría'
                  : picker === 'vendor'
                    ? 'Selecciona un vendedor'
                    : 'Ordenar favoritos'}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar filtros"
                onPress={() => setPicker(null)}
                style={styles.closeButton}>
                <MaterialIcons name="close" size={20} color={muted} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalOptions}>
              {pickerOptions.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => selectPickerOption(option)}
                  style={styles.modalOption}>
                  <AppText style={styles.modalOptionText}>{option}</AppText>
                  <MaterialIcons name="chevron-right" size={19} color={muted} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function FavoriteTab({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: 'shopping-cart' | 'miscellaneous-services' | 'favorite';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}>
      <MaterialIcons name={icon} size={15} color={active ? purple : muted} />
      <AppText style={[styles.tabText, active && styles.activeTabText]}>{label}</AppText>
    </Pressable>
  );
}

function FilterButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.filterButton}>
      <AppText numberOfLines={1} style={styles.filterButtonText}>{label}</AppText>
      <MaterialIcons name="keyboard-arrow-down" size={17} color={muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#FAF9FD' },
  content: { padding: 14, gap: 10, paddingBottom: 24 },
  withQuoteBar: { paddingBottom: 112 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E8E5EF' },
  tab: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: purple },
  tabText: { color: muted, fontSize: purchaseTextScale.body, fontWeight: '600' },
  activeTabText: { color: purple, fontWeight: '700' },
  filters: { flexDirection: 'row', gap: 10 },
  filterColumn: { flex: 1, minWidth: 0, gap: 5 },
  filterLabel: { color: muted, fontSize: 10 },
  filterButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: '#E8E5EF', borderRadius: 9, backgroundColor: '#FFFFFF' },
  filterButtonText: { flex: 1, color: '#55546A', fontSize: purchaseTextScale.caption },
  sortRow: { gap: 4 },
  productCard: { overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 14 },
  productCardSelected: { borderWidth: 2, borderColor: purple },
  imagePanel: { height: 125, alignItems: 'center', justifyContent: 'center', margin: 7, borderRadius: 9 },
  productEmoji: { fontSize: 60 },
  selectButton: { position: 'absolute', top: 5, left: 5, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 1, borderColor: '#DEDCE7', backgroundColor: '#FFFFFF' },
  selectButtonSelected: { borderColor: purple, backgroundColor: purple },
  favoriteButton: { position: 'absolute', top: 5, right: 5, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#FFFFFF' },
  productInfo: { paddingHorizontal: 9, paddingBottom: 9, gap: 4 },
  productName: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '700' },
  productDetail: { color: muted, fontSize: purchaseTextScale.caption },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2 },
  price: { color: ink, fontSize: purchaseTextScale.subtitle, fontWeight: '900' },
  offerBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#E8F7EE' },
  offerText: { color: '#25814E', fontSize: 9, fontWeight: '700' },
  originalPrice: { color: '#9696A5', fontSize: 9, textDecorationLine: 'line-through' },
  errorText: { color: '#A52B2B', fontSize: 11 },
  quoteBar: { position: 'absolute', left: 12, right: 12, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 62, padding: 9, borderRadius: 13, backgroundColor: '#25243A', elevation: 8 },
  quoteCopy: { flex: 1, gap: 3 },
  quoteCount: { color: '#FFFFFF', fontSize: purchaseTextScale.body, fontWeight: '800' },
  quoteHint: { color: '#D5D3DF', fontSize: purchaseTextScale.caption },
  clearButton: { paddingHorizontal: 5, paddingVertical: 8 },
  clearText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  quoteButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 12, borderRadius: 10, backgroundColor: purple },
  quoteButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(27,24,40,0.42)' },
  modalCard: { maxHeight: '75%', padding: 15, borderRadius: 16, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 7 },
  modalTitle: { flex: 1, color: ink, fontSize: purchaseTextScale.subtitle, fontWeight: '700' },
  closeButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#F3F1F7' },
  modalOptions: { flexGrow: 0 },
  modalOption: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0', paddingHorizontal: 4 },
  modalOptionText: { color: '#55546A', fontSize: purchaseTextScale.body },
});
