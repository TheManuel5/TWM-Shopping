import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AddressesScreen from './profile/AddressesScreen';
import CartScreen from './cart/CartScreen';
import CheckoutScreen from './checkout/CheckoutScreen';
import PurchaseSuccessScreen from './checkout/PurchaseSuccessScreen';
import FavoritesScreen from './favorites/FavoritesScreen';
import PurchaseHistoryScreen from './history/PurchaseHistoryScreen';
import ProfileScreen from './profile/ProfileScreen';
import SellerSalesScreen from './profile/SellerSalesScreen';
import QuotationsScreen, {
  initialQuotes,
  type Quote,
} from './quotations/QuotationsScreen';
import ReturnsScreen from './returns/ReturnsScreen';
import {
  AppText,
  DashboardStat,
  MenuRow,
  purchaseTextScale,
  SectionTitle,
} from './components/PurchaseUi';
import { initialOrders, initialReturns } from './purchaseData';
import type {
  CartItem,
  DeliveryMode,
  PaymentMethod,
  PurchaseAddress,
} from './purchaseTypes';
import { addFavoriteToCart, removeFavorite } from './services/favoritesApi';
import { createPurchaseOrder } from './services/purchasesApi';

type Screen =
  | 'home'
  | 'favorites'
  | 'cart'
  | 'checkout'
  | 'confirmation'
  | 'orders'
  | 'returns'
  | 'quotes'
  | 'profile'
  | 'addresses';

const initialProducts: CartItem[] = [
  {
    id: 1,
    name: 'Polo clásico',
    detail: 'Talla M · Color beige',
    price: 49900,
    vendor: 'Tienda Sur',
    emoji: '👕',
    color: '#F0E7D9',
    quantity: 1,
  },
  {
    id: 2,
    name: 'Zapatillas urbanas',
    detail: 'Talla 38 · Color blanco',
    price: 129900,
    vendor: 'Tienda Sur',
    emoji: '👟',
    color: '#E8E9F5',
    quantity: 1,
  },
];

const initialFavorites: CartItem[] = [
  { id: 101, name: 'Cafetera Espresso Oster PrimaLatte', detail: '15 bares · Depósito 1,5 L', price: 129990, originalPrice: 159990, vendor: 'Tienda Sur', category: 'Hogar y Cocina', type: 'Producto', emoji: '☕', color: '#ECE9E5', quantity: 1, savedAt: 11 },
  { id: 102, name: 'Notebook Lenovo IdeaPad 3', detail: 'Ryzen 5 · 16 GB RAM · 512 GB SSD', price: 449990, vendor: 'Tech Store', category: 'Tecnología', type: 'Producto', emoji: '💻', color: '#E8E9F5', quantity: 1, savedAt: 10 },
  { id: 103, name: 'iPhone 15 128 GB', detail: 'Pantalla 6,1 pulgadas · Negro', price: 749950, vendor: 'Tech Store', category: 'Celulares', type: 'Producto', emoji: '📱', color: '#EAEAF0', quantity: 1, savedAt: 9 },
  { id: 104, name: 'Freidora de aire Oster', detail: '5,5 litros · Acero inoxidable', price: 79990, vendor: 'Hogar Plus', category: 'Hogar y Cocina', type: 'Producto', emoji: '🍟', color: '#F3E9DF', quantity: 1, savedAt: 8 },
  { id: 105, name: 'Zapatillas Adidas Grand Court', detail: 'Talla 38 · Blanco', price: 54990, vendor: 'Tienda Sur', category: 'Ropa, moda y calzado', type: 'Producto', emoji: '👟', color: '#E8E9F5', quantity: 1, savedAt: 7 },
  { id: 106, name: 'Silla de escritorio Mesh Pro', detail: 'Respaldo ajustable · Soporte lumbar', price: 89990, vendor: 'Hogar Plus', category: 'Hogar y Cocina', type: 'Producto', emoji: '🪑', color: '#E7E8EC', quantity: 1, savedAt: 6 },
  { id: 107, name: 'Polera básica de algodón', detail: 'Talla M · Beige', price: 11900, vendor: 'Tienda Sur', category: 'Ropa, moda y calzado', type: 'Producto', emoji: '👕', color: '#F0E7D9', quantity: 1, savedAt: 5 },
  { id: 108, name: 'Audífonos inalámbricos', detail: 'Bluetooth · Cancelación de ruido', price: 39990, vendor: 'Tech Store', category: 'Tecnología', type: 'Producto', emoji: '🎧', color: '#E9E8F2', quantity: 1, savedAt: 4 },
  { id: 201, name: 'Veterinaria Patitas Felices', detail: 'Consulta veterinaria · 60 minutos', price: 25000, vendor: 'Servicios Patitas', category: 'Servicios profesionales', type: 'Servicio', emoji: '🐾', color: '#E7F4EE', quantity: 1, savedAt: 3 },
  { id: 202, name: 'Mantenimiento de computadores', detail: 'Diagnóstico y optimización · 90 minutos', price: 29750, vendor: 'Tech Store', category: 'Computación y Tecnología', type: 'Servicio', emoji: '🛠️', color: '#E8E9F5', quantity: 1, savedAt: 2 },
  { id: 203, name: 'Aseo Hogar del Sur', detail: 'Limpieza domiciliaria · 120 minutos', price: 35000, vendor: 'Hogar Plus', category: 'Servicios domésticos', type: 'Servicio', emoji: '🧹', color: '#E7F4EE', quantity: 1, savedAt: 1 },
];

const initialAddresses: PurchaseAddress[] = [
  {
    id: 'home',
    label: 'Casa',
    region: 'Los Lagos',
    province: 'Osorno',
    commune: 'Osorno',
    street: 'Av. Manuel Rodríguez',
    number: '1234',
    department: 'Depto. 101',
    reference: 'A una cuadra de la Plaza de Armas.',
  },
  {
    id: 'work',
    label: 'Oficina',
    region: 'Los Lagos',
    province: 'Osorno',
    commune: 'Osorno',
    street: 'Calle Bilbao',
    number: '567',
    department: 'Oficina 302',
    reference: 'Edificio Torres del Sur, piso 3.',
  },
];

const purple = '#5B32EC';
const muted = '#77768A';

function money(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function PurchasesScreen() {
  const [screen, setScreen] = useState<Screen>('home');
  const [cart, setCart] = useState(initialProducts);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [accountMode, setAccountMode] = useState<'Comprador' | 'Vendedor'>('Comprador');
  const [fullName, setFullName] = useState('Ana Rodríguez');
  const [email, setEmail] = useState('ana.rodriguez@gmail.com');
  const [selectedVendor, setSelectedVendor] = useState('Tienda Sur');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('Despacho');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tarjeta');
  const [cardLast4, setCardLast4] = useState('');
  const [transferCode, setTransferCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState(initialOrders);
  const [returnRequests, setReturnRequests] = useState(initialReturns);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>('home');
  const [addressReturnScreen, setAddressReturnScreen] = useState<'profile' | 'checkout'>('profile');
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [lastOrderId, setLastOrderId] = useState('');
  const [quotes, setQuotes] = useState(initialQuotes);
  const [quoteRequestError, setQuoteRequestError] = useState<string | null>(null);

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const cartGroups = Array.from(new Set(cart.map((item) => item.vendor))).map((vendor) => ({
    vendor,
    items: cart.filter((item) => item.vendor === vendor),
  }));
  const activeGroup = cartGroups.find((group) => group.vendor === selectedVendor) ?? cartGroups[0];
  const activeItems = activeGroup?.items ?? [];
  const shippingCost = deliveryMode === 'Retiro'
    ? 0
    : selectedAddress?.commune === 'Osorno'
      ? 3570
      : selectedAddress
        ? 5950
        : 0;

  const openAddressManager = (returnScreen: 'profile' | 'checkout') => {
    setAddressReturnScreen(returnScreen);
    setScreen('addresses');
  };

  const changeQuantity = (id: number, change: number) => {
    setQuoteRequestError(null);
    setCart((items) =>
      items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + change } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const toggleCartFavorite = (item: CartItem) => {
    setFavorites((current) =>
      current.some((favorite) => favorite.id === item.id)
        ? removeFavorite(current, item.id)
        : [...current, { ...item, type: item.type ?? 'Producto', savedAt: Date.now() }],
    );
  };

  const requestQuoteFromCart = () => {
    if (!activeGroup || !activeItems.length) {
      setQuoteRequestError('Agrega por lo menos un producto antes de solicitar una cotización.');
      return;
    }

    if (
      activeItems.some(
        (item) =>
          !item.name.trim() ||
          !item.vendor.trim() ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !Number.isInteger(item.price) ||
          item.price < 0,
      )
    ) {
      setQuoteRequestError('Revisa los productos, precios y cantidades de tu carrito.');
      return;
    }

    const vendors = new Set(activeItems.map((item) => item.vendor.trim()));
    if (vendors.size !== 1) {
      setQuoteRequestError('Solicita una cotización por vendedor.');
      return;
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const quote: Quote = {
      id: `COT-${Date.now()}`,
      vendor: activeGroup.vendor.trim(),
      emittedDate: now.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      validUntil: validUntil.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Solicitada',
      total: activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      items: activeItems.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        detail: item.detail.trim(),
        unitPrice: item.price,
        qty: item.quantity,
      })),
      history: [],
    };

    setQuotes((current) => [quote, ...current]);
    setQuoteRequestError(null);
    setScreen('quotes');
  };

  const requestQuoteFromFavorites = (items: CartItem[]) => {
    if (!items.length) {
      setQuoteRequestError('Selecciona al menos un favorito para cotizar.');
      return;
    }

    if (new Set(items.map((item) => item.vendor)).size !== 1) {
      setQuoteRequestError('Selecciona favoritos de un solo vendedor para cotizar.');
      return;
    }

    if (
      items.some(
        (item) =>
          !item.name.trim() ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !Number.isInteger(item.price) ||
          item.price < 0,
      )
    ) {
      setQuoteRequestError('Revisa los productos y precios seleccionados.');
      return;
    }

    const now = new Date();
    const quote: Quote = {
      id: `COT-${Date.now()}`,
      vendor: items[0].vendor,
      emittedDate: now.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      validUntil: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Solicitada',
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      items: items.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        detail: item.detail.trim(),
        unitPrice: item.price,
        qty: item.quantity,
      })),
      history: [],
    };

    setQuotes((current) => [quote, ...current]);
    setQuoteRequestError(null);
    setScreen('quotes');
  };

  const acceptQuote = (quote: Quote) => {
    if (
      quote.status === 'Expirada' ||
      !quote.items.length ||
      !Number.isInteger(quote.total) ||
      quote.total < 0 ||
      quote.items.some(
        (item) =>
          !item.name.trim() ||
          !Number.isInteger(item.qty) ||
          item.qty < 1 ||
          !Number.isInteger(item.unitPrice) ||
          item.unitPrice < 0,
      )
    ) {
      return;
    }

    setQuotes((current) =>
      current.map((item) =>
        item.id === quote.id ? { ...item, status: 'Aceptada por el cliente' } : item,
      ),
    );
    setCart(
      quote.items.map((quoteItem) => {
        const product = initialProducts.find((item) => item.id === quoteItem.id) ?? initialProducts[0];
        return {
          ...product,
          id: quoteItem.id,
          name: quoteItem.name,
          detail: quoteItem.detail,
          price: quoteItem.unitPrice,
          vendor: quote.vendor,
          quantity: quoteItem.qty,
        };
      }),
    );
    setSelectedVendor(quote.vendor);
    setCheckoutError(null);
    setAcceptedTerms(false);
    setScreen('checkout');
  };

  const confirmPurchase = () => {
    setCheckoutError(null);
    if (!activeGroup || !activeItems.length) {
      setCheckoutError('Tu carrito está vacío. Agrega artículos antes de continuar.');
      return;
    }
    if (deliveryMode === 'Despacho' && !selectedAddress) {
      setCheckoutError('Selecciona o agrega una dirección de despacho.');
      return;
    }
    if (!acceptedTerms) {
      setCheckoutError('Confirma que los datos de entrega y pago son correctos.');
      return;
    }
    if (paymentMethod === 'Tarjeta' && !/^\d{4}$/.test(cardLast4)) {
      setCheckoutError('Ingresa los últimos cuatro dígitos de la tarjeta.');
      return;
    }
    if (paymentMethod === 'Transferencia' && transferCode.trim().length < 5) {
      setCheckoutError('Ingresa un código de transferencia válido.');
      return;
    }

    const order = createPurchaseOrder({
      items: activeItems,
      vendor: activeGroup.vendor,
      address: selectedAddress,
      deliveryMode,
      paymentMethod,
      cardLast4,
      transferCode,
      shipping: shippingCost,
    });
    const nextVendor = cartGroups.find((group) => group.vendor !== activeGroup.vendor)?.vendor;

    setPurchaseOrders((current) => [order, ...current]);
    setCart((items) => items.filter((item) => item.vendor !== activeGroup.vendor));
    setSelectedVendor(nextVendor ?? '');
    setLastOrderId(order.id);
    setLastOrderTotal(order.total);
    setAcceptedTerms(false);
    setScreen('confirmation');
  };

  const profileAddress = selectedAddress
    ? `${selectedAddress.street} ${selectedAddress.number}, ${selectedAddress.commune}`
    : '';

  const homeScreen = (
    <View style={styles.homeScreen}>
      <View style={styles.welcomeCard}>
        <View>
          <View style={styles.accountIdentity}>
            <MaterialIcons name="shopping-bag" size={15} color="#E5DEFF" />
            <AppText style={styles.accountEyebrow}>
              {`Mi cuenta · ${fullName}`}
            </AppText>
          </View>
          <AppText style={styles.welcomeTitle}>
            {fullName.trim() ? `Hola, ${fullName.trim()}` : 'Hola'}
          </AppText>
          <AppText style={styles.welcomeCopy}>
            {accountMode === 'Vendedor' ? 'Panel de ventas · Shopping' : 'Tu espacio de compra · Shopping'}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir carrito"
          onPress={() => setScreen('cart')}
          style={styles.cartButton}>
          <MaterialIcons name="shopping-cart" size={21} color="#FFFFFF" />
          <View style={styles.cartBadge}>
            <AppText style={styles.cartBadgeText}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </AppText>
          </View>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.homeContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileCopy}>
            <AppText style={styles.profileTitle}>Tu perfil</AppText>
            <AppText style={styles.secondaryText}>
              {fullName} · {email}
            </AppText>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setScreen('profile')}>
            <AppText style={styles.linkText}>Editar　›</AppText>
          </Pressable>
        </View>
        {accountMode === 'Vendedor' ? (
          <SellerSalesScreen onSwitchToBuyer={() => setAccountMode('Comprador')} />
        ) : (
          <>
            <View style={styles.stats}>
              <DashboardStat
                label="Pedidos"
                value={purchaseOrders.length}
                onPress={() => setScreen('orders')}
              />
              <DashboardStat
                label="Favoritos"
                value={favorites.length}
                onPress={() => setScreen('favorites')}
              />
              <DashboardStat
                label="En el carrito"
                value={cart.length}
                onPress={() => setScreen('cart')}
              />
            </View>
            <SectionTitle title="Mis compras" />
            <View style={styles.menuCard}>
              <MenuRow
                icon="history"
                label="Historial de compras"
                detail="Consulta y sigue tus pedidos"
                onPress={() => setScreen('orders')}
              />
              <MenuRow
                icon="undo"
                label="Devoluciones"
                detail="Solicitudes y seguimiento"
                onPress={() => {
                  setReturnOrderId(null);
                  setScreen('returns');
                }}
              />
              <MenuRow
                icon="description"
                label="Mis cotizaciones"
                detail={`${quotes.length} cotizaciones`}
                onPress={() => setScreen('quotes')}
                last
              />
            </View>
            <SectionTitle title="Mi actividad" />
            <View style={styles.menuCard}>
              <MenuRow
                icon="favorite-border"
                label="Mis favoritos"
                detail={`${favorites.length} productos guardados`}
                onPress={() => setScreen('favorites')}
              />
              <MenuRow
                icon="shopping-cart"
                label="Mi carrito"
                detail={`${cart.length} productos · ${money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}`}
                onPress={() => setScreen('cart')}
                last
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );

  let content;
  switch (screen) {
    case 'favorites':
      content = (
        <FavoritesScreen
          accountName={fullName}
          favorites={favorites}
          quoteError={quoteRequestError}
          onAddToCart={(item) => setCart((current) => addFavoriteToCart(current, item))}
          onRemove={(id) => setFavorites((current) => removeFavorite(current, id))}
          onBack={() => setScreen('home')}
          onExplore={() => setScreen('home')}
          onRequestQuote={requestQuoteFromFavorites}
          onClearQuoteError={() => setQuoteRequestError(null)}
        />
      );
      break;
    case 'cart':
      content = (
        <CartScreen
          accountName={fullName}
          cart={cart}
          favoriteIds={favorites.map((item) => item.id)}
          selectedVendor={selectedVendor}
          quoteError={quoteRequestError}
          onSelectVendor={setSelectedVendor}
          onChangeQuantity={changeQuantity}
          onRemoveItem={(id) => setCart((items) => items.filter((item) => item.id !== id))}
          onToggleFavorite={toggleCartFavorite}
          onContinue={() => {
            setCheckoutError(null);
            setAcceptedTerms(false);
            setScreen('checkout');
          }}
          onRequestQuote={requestQuoteFromCart}
          onContinueShopping={() => setScreen('home')}
          onClearQuoteError={() => setQuoteRequestError(null)}
        />
      );
      break;
    case 'checkout':
      content = (
        <CheckoutScreen
          accountName={fullName}
          items={activeItems}
          vendor={activeGroup?.vendor ?? ''}
          selectedAddress={selectedAddress}
          deliveryMode={deliveryMode}
          paymentMethod={paymentMethod}
          cardLast4={cardLast4}
          transferCode={transferCode}
          acceptedTerms={acceptedTerms}
          error={checkoutError}
          shippingCost={shippingCost}
          onBack={() => setScreen('cart')}
          onManageAddresses={() => openAddressManager('checkout')}
          onDeliveryModeChange={(mode) => {
            setDeliveryMode(mode);
            setCheckoutError(null);
          }}
          onPaymentMethodChange={(method) => {
            setPaymentMethod(method);
            setCheckoutError(null);
          }}
          onCardLast4Change={(value) => setCardLast4(value.replace(/\D/g, '').slice(0, 4))}
          onTransferCodeChange={setTransferCode}
          onToggleTerms={() => setAcceptedTerms((accepted) => !accepted)}
          onConfirm={confirmPurchase}
        />
      );
      break;
    case 'confirmation':
      content = (
        <PurchaseSuccessScreen
          accountName={fullName}
          orderId={lastOrderId}
          total={lastOrderTotal}
          hasOtherItems={cart.length > 0}
          onBack={() => setScreen('home')}
          onViewOrders={() => setScreen('orders')}
          onViewCart={() => setScreen('cart')}
          onHome={() => setScreen('home')}
        />
      );
      break;
    case 'orders':
      content = (
        <PurchaseHistoryScreen
          accountName={fullName}
          orders={purchaseOrders}
          onBack={() => setScreen('home')}
          onRequestReturn={(order) => {
            setReturnOrderId(order.id);
            setScreen('returns');
          }}
        />
      );
      break;
    case 'returns':
      content = (
        <ReturnsScreen
          accountName={fullName}
          orders={purchaseOrders}
          requests={returnRequests}
          initialOrderId={returnOrderId}
          onRequestChange={setReturnRequests}
          onBack={() => {
            if (returnOrderId) {
              setReturnOrderId(null);
              setScreen('orders');
            } else {
              setScreen('home');
            }
          }}
        />
      );
      break;
    case 'quotes':
      content = (
        <QuotationsScreen
          accountName={fullName}
          quotes={quotes}
          onBack={() => setScreen('home')}
          onGoToCart={() => setScreen('cart')}
          onAcceptQuote={acceptQuote}
        />
      );
      break;
    case 'profile':
      content = (
        <ProfileScreen
          fullName={fullName}
          onFullNameChange={setFullName}
          email={email}
          onEmailChange={setEmail}
          addressSummary={profileAddress || 'Agrega una dirección'}
          hasSelectedAddress={Boolean(selectedAddress)}
          role={accountMode === 'Vendedor' ? 'Vender' : 'Comprar'}
          onRoleChange={(role) => {
            setAccountMode(role === 'Vender' ? 'Vendedor' : 'Comprador');
            if (role === 'Vender') setScreen('home');
          }}
          onBack={() => setScreen('home')}
          onAddresses={() => openAddressManager('profile')}
        />
      );
      break;
    case 'addresses':
      content = (
        <AddressesScreen
          accountName={fullName}
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          returnToCheckout={addressReturnScreen === 'checkout'}
          onAddressesChange={setAddresses}
          onSelectAddress={setSelectedAddressId}
          onBack={() => setScreen(addressReturnScreen)}
          onUseSelectedAddress={() => setScreen('checkout')}
        />
      );
      break;
    default:
      content = homeScreen;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>{content}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ECEEF2' },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    marginBottom: 66,
    backgroundColor: '#E8E4EE',
  },
  homeScreen: { flex: 1, backgroundColor: '#FAF9FD' },
  welcomeCard: { minHeight: 103, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 19, paddingVertical: 16, backgroundColor: purple, borderBottomLeftRadius: 19, borderBottomRightRadius: 19 },
  accountIdentity: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  accountEyebrow: { color: '#E5DEFF', fontSize: purchaseTextScale.caption, fontWeight: '600' },
  welcomeTitle: { color: '#FFFFFF', fontSize: purchaseTextScale.pageTitle, fontWeight: '800' },
  welcomeCopy: { color: '#E5DEFF', fontSize: purchaseTextScale.subtitle, marginTop: 2 },
  cartButton: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: purple, borderWidth: 0 },
  cartBadge: { position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E94F72', borderWidth: 1.5, borderColor: purple },
  cartBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  homeContent: { padding: 17, gap: 12, paddingBottom: 24 },
  profileCard: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 13, backgroundColor: '#FFFFFF', borderRadius: 14 },
  profileCopy: { flex: 1, gap: 4 },
  profileTitle: { color: '#25243A', fontSize: purchaseTextScale.sectionTitle, fontWeight: '700' },
  secondaryText: { color: muted, fontSize: purchaseTextScale.body, lineHeight: 18 },
  linkText: { color: purple, fontSize: purchaseTextScale.body, fontWeight: '600' },
  stats: { flexDirection: 'row', gap: 9 },
  menuCard: { paddingHorizontal: 13, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF5' },
});
