import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import OrdersReturnsHeader from '../OrdersReturnsHeader';
import type { CartItem } from '../purchaseTypes';
import {
  AppText,
  EmptyState,
  OutlineButton,
  PriceRow,
  PrimaryButton,
  purchaseTextScale,
} from '../components/PurchaseUi';

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';

function money(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function CartScreen({
  cart,
  accountName,
  selectedVendor,
  quoteError,
  onSelectVendor,
  onChangeQuantity,
  onRemoveItem,
  onToggleFavorite,
  favoriteIds,
  onContinue,
  onRequestQuote,
  onContinueShopping,
  onClearQuoteError,
}: {
  cart: CartItem[];
  accountName: string;
  selectedVendor: string;
  quoteError: string | null;
  onSelectVendor: (vendor: string) => void;
  onChangeQuantity: (id: number, change: number) => void;
  onRemoveItem: (id: number) => void;
  onToggleFavorite: (item: CartItem) => void;
  favoriteIds: number[];
  onContinue: () => void;
  onRequestQuote: () => void;
  onContinueShopping: () => void;
  onClearQuoteError: () => void;
}) {
  const groups = Array.from(new Set(cart.map((item) => item.vendor))).map((vendor) => ({
    vendor,
    items: cart.filter((item) => item.vendor === vendor),
  }));
  const activeGroup = groups.find((group) => group.vendor === selectedVendor) ?? groups[0];
  const activeItems = activeGroup?.items ?? [];
  const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const [collapsedVendors, setCollapsedVendors] = useState<string[]>([]);

  const toggleVendor = (vendor: string, selected: boolean, expanded: boolean) => {
    if (!selected) {
      onSelectVendor(vendor);
      setCollapsedVendors((current) => current.filter((item) => item !== vendor));
      return;
    }

    setCollapsedVendors((current) =>
      expanded
        ? [...current, vendor]
        : current.filter((item) => item !== vendor),
    );
  };

  return (
    <>
      <OrdersReturnsHeader title="Mi carrito" accountName={accountName} onBack={onContinueShopping} />
      <ScrollView style={styles.scrollViewport} contentContainerStyle={styles.content}>
        {cart.length ? (
          <>
            <AppText style={styles.intro}>Compra a un vendedor a la vez.</AppText>
            {groups.length > 1 ? (
              <View style={styles.infoBanner}>
                <MaterialIcons name="info-outline" size={18} color={purple} />
                <AppText style={styles.infoText}>
                  Elige qué vendedor quieres pagar ahora. Los demás productos seguirán guardados en tu carrito.
                </AppText>
              </View>
            ) : null}
            {groups.map((group) => {
              const selected = group.vendor === activeGroup?.vendor;
              const units = group.items.reduce((sum, item) => sum + item.quantity, 0);
              const groupTotal = group.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              const expanded = !collapsedVendors.includes(group.vendor);
              return (
                <View
                  key={group.vendor}
                  style={[styles.vendorCard, selected && styles.vendorCardSelected]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected, expanded }}
                    accessibilityLabel={`${expanded ? 'Ocultar' : 'Mostrar'} productos de ${group.vendor}`}
                    onPress={() => toggleVendor(group.vendor, selected, expanded)}
                    style={[styles.vendorHeader, selected && styles.vendorHeaderSelected]}>
                    <MaterialIcons
                      name={selected ? 'check-circle' : 'storefront'}
                      size={19}
                      color={purple}
                    />
                    <View style={styles.vendorCopy}>
                      <AppText style={styles.vendorName}>{group.vendor}</AppText>
                      <AppText style={styles.secondaryText}>
                        {units} {units === 1 ? 'producto' : 'productos'}
                        {selected ? ' · Seleccionado para comprar' : ' · Compra por separado'}
                      </AppText>
                    </View>
                    {groups.length > 1 ? (
                      <AppText style={styles.vendorTotal}>{money(groupTotal)}</AppText>
                    ) : null}
                    <MaterialIcons
                      name={expanded ? 'expand-less' : 'expand-more'}
                      size={21}
                      color={purple}
                    />
                  </Pressable>
                  {selected && expanded ? (
                    <View style={styles.vendorItems}>
                      {group.items.map((item, index) => (
                        <View
                          key={item.id}
                          style={[
                            styles.productRow,
                            index === group.items.length - 1 && styles.lastProductRow,
                          ]}>
                          <View style={[styles.productImage, { backgroundColor: item.color }]}>
                            <AppText style={styles.productEmoji}>{item.emoji}</AppText>
                          </View>
                          <View style={styles.productCopy}>
                            <AppText style={styles.productName}>{item.name}</AppText>
                            <AppText style={styles.secondaryText}>{item.detail}</AppText>
                            <View style={styles.productFooter}>
                              <AppText style={styles.productPrice}>
                                {money(item.price * item.quantity)}
                              </AppText>
                              <View style={styles.productActions}>
                                <View style={styles.quantityControl}>
                                  <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`Disminuir cantidad de ${item.name}`}
                                    onPress={() => onChangeQuantity(item.id, -1)}
                                    style={styles.quantityAction}>
                                    <MaterialIcons name="remove" size={17} color={purple} />
                                  </Pressable>
                                  <AppText style={styles.quantityValue}>{item.quantity}</AppText>
                                  <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`Aumentar cantidad de ${item.name}`}
                                    onPress={() => onChangeQuantity(item.id, 1)}
                                    style={styles.quantityAction}>
                                    <MaterialIcons name="add" size={17} color={purple} />
                                  </Pressable>
                                </View>
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`${favoriteIds.includes(item.id) ? 'Quitar' : 'Guardar'} ${item.name} ${favoriteIds.includes(item.id) ? 'de' : 'en'} favoritos`}
                                  onPress={() => onToggleFavorite(item)}
                                  style={styles.favoriteButton}>
                                  <MaterialIcons
                                    name={favoriteIds.includes(item.id) ? 'favorite' : 'favorite-border'}
                                    size={18}
                                    color={purple}
                                  />
                                </Pressable>
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`Quitar ${item.name} del carrito`}
                                  onPress={() => {
                                    onClearQuoteError();
                                    onRemoveItem(item.id);
                                  }}
                                  style={styles.removeButton}>
                                  <MaterialIcons name="delete-outline" size={18} color={muted} />
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
            <View style={styles.summaryCard}>
              <AppText style={styles.cardTitle}>Total productos</AppText>
              <PriceRow
                label={`Subtotal (${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'})`}
                value={money(subtotal)}
              />
              <PriceRow label="Envío" value="Se calcula al confirmar" />
              <View style={styles.divider} />
              <PriceRow label="Total parcial" value={money(subtotal)} bold />
              <AppText style={styles.secondaryText}>IVA incluido</AppText>
            </View>
            {quoteError ? (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={18} color="#B23B36" />
                <AppText style={styles.errorText}>{quoteError}</AppText>
              </View>
            ) : null}
            <PrimaryButton label="Continuar compra" onPress={onContinue} />
            <OutlineButton label="Solicitar cotización" onPress={onRequestQuote} />
            <OutlineButton label="Seguir comprando" onPress={onContinueShopping} />
          </>
        ) : (
          <>
            <EmptyState
              title="Tu carrito está vacío"
              description="Explora el catálogo y agrega productos o servicios para comenzar tu compra."
            />
            <OutlineButton label="Volver a mi cuenta" onPress={onContinueShopping} />
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewport: { flex: 1, backgroundColor: '#FAF9FD' },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  intro: { color: muted, fontSize: purchaseTextScale.subtitle, marginBottom: -3 },
  infoBanner: { flexDirection: 'row', gap: 10, backgroundColor: '#F0EDFF', borderRadius: 13, padding: 13 },
  infoText: { flex: 1, fontSize: purchaseTextScale.body, lineHeight: 18, color: '#5E5973' },
  vendorCard: { overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 15 },
  vendorCardSelected: { borderWidth: 1.5, borderColor: purple },
  vendorHeader: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, paddingVertical: 10 },
  vendorHeaderSelected: { backgroundColor: '#F3EFFF' },
  vendorCopy: { flex: 1, minWidth: 0, gap: 3 },
  vendorName: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '800' },
  vendorTotal: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '700' },
  secondaryText: { color: muted, fontSize: 10, lineHeight: 15 },
  vendorItems: { paddingHorizontal: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  lastProductRow: { borderBottomWidth: 0 },
  productImage: { width: 58, height: 58, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  productEmoji: { fontSize: 29 },
  productCopy: { flex: 1, minWidth: 0, gap: 3 },
  productName: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '700' },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, marginTop: 4 },
  productPrice: { color: purple, fontSize: 12, fontWeight: '800' },
  productActions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  favoriteButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#F3F0FF' },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#E9E7F0', borderRadius: 9, paddingHorizontal: 5, paddingVertical: 2 },
  quantityAction: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  quantityValue: { color: ink, fontSize: 12, fontWeight: '600', minWidth: 12, textAlign: 'center' },
  removeButton: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#F5F4F8', alignItems: 'center', justifyContent: 'center' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#EEEAF5' },
  cardTitle: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '700', marginBottom: 8 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EAE9F0', marginVertical: 8 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 11, backgroundColor: '#FDEDEC' },
  errorText: { flex: 1, color: '#9E302B', fontSize: 11, lineHeight: 16 },
});
