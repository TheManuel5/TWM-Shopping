import { type ComponentProps, type ReactNode, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Modal,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import ProfileScreen from './profile/ProfileScreen';
import { CHILE_GEOGRAPHY } from './profile/chileGeography';
import QuotationsScreen, {
  initialQuotes,
  type Quote,
} from './quotations/QuotationsScreen';
import PurchaseHistoryScreen from './history/PurchaseHistoryScreen';
import ReturnsScreen from './returns/ReturnsScreen';
import { initialOrders, initialReturns } from './purchaseData';
import type { PurchaseOrder } from './purchaseTypes';

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
  | 'addresses'
  | 'new-address';

type Product = {
  id: number;
  name: string;
  detail: string;
  price: number;
  vendor: string;
  emoji: string;
  color: string;
  quantity: number;
};

type PurchaseAddress = {
  id: string;
  label: string;
  region: string;
  province: string;
  commune: string;
  street: string;
  number: string;
  department: string;
  reference: string;
};
type GeographyField = 'region' | 'province' | 'commune';

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';
const background = '#E8E4EE';
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const initialProducts: Product[] = [
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

function money(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

function lettersAndSpaces(value: string) {
  return value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '');
}

function AppText({
  children,
  style,
  ...props
}: ComponentProps<typeof Text>) {
  return (
    <Text {...props} style={[styles.text, style]}>
      {children}
    </Text>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}>
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

function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <AppText style={styles.linkText}>{action}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProductRow({
  product,
  onAdd,
  onRemove,
  onIncrease,
  onDecrease,
  showQuantity = false,
}: {
  product: Product;
  onAdd?: () => void;
  onRemove?: () => void;
  onIncrease?: () => void;
  onDecrease?: () => void;
  showQuantity?: boolean;
}) {
  return (
    <View style={styles.productRow}>
      <View style={[styles.productImage, { backgroundColor: product.color }]}>
        <AppText style={styles.productEmoji}>{product.emoji}</AppText>
      </View>
      <View style={styles.productDetails}>
        <AppText style={styles.productName}>{product.name}</AppText>
        <AppText style={styles.secondaryText}>{product.detail}</AppText>
        <AppText style={styles.productPrice}>{money(product.price)}</AppText>
        {showQuantity && onIncrease && onDecrease ? (
          <View style={styles.quantityControl}>
            <Pressable accessibilityLabel="Disminuir cantidad" onPress={onDecrease}>
              <AppText style={styles.quantityButton}>−</AppText>
            </Pressable>
            <AppText style={styles.quantityValue}>{product.quantity}</AppText>
            <Pressable accessibilityLabel="Aumentar cantidad" onPress={onIncrease}>
              <AppText style={styles.quantityButton}>+</AppText>
            </Pressable>
          </View>
        ) : null}
      </View>
      {onAdd ? (
        <Pressable accessibilityRole="button" onPress={onAdd} style={styles.smallAction}>
          <AppText style={styles.smallActionText}>＋</AppText>
        </Pressable>
      ) : null}
      {onRemove ? (
        <Pressable accessibilityRole="button" onPress={onRemove} style={styles.removeAction}>
          <AppText style={styles.removeActionText}>×</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function PurchasesScreen() {
  const [screen, setScreen] = useState<Screen>('profile');
  const [cart, setCart] = useState(initialProducts);
  const [favorites, setFavorites] = useState(initialProducts);
  const [payment, setPayment] = useState('Tarjeta de crédito o débito');
  const [purchaseOrders, setPurchaseOrders] = useState(initialOrders);
  const [returnRequests, setReturnRequests] = useState(initialReturns);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>('home');
  const [lastOrderTotal, setLastOrderTotal] = useState(179800);
  const [lastOrderId, setLastOrderId] = useState('TW-2096');
  const [quotes, setQuotes] = useState(initialQuotes);
  const [quoteRequestError, setQuoteRequestError] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [regionInput, setRegionInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');
  const [communeInput, setCommuneInput] = useState('');
  const [streetInput, setStreetInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [referenceInput, setReferenceInput] = useState('');
  const [geoPicker, setGeoPicker] = useState<GeographyField | null>(null);
  const [returnToProfileAfterAddresses, setReturnToProfileAfterAddresses] = useState(false);

  const selectedAddress = addresses.find((item) => item.id === selectedAddressId);
  const address = selectedAddress
    ? `${selectedAddress.street} ${selectedAddress.number}, ${selectedAddress.commune}`
    : '';
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const geographyOptions = geoPicker === 'region'
    ? Object.keys(CHILE_GEOGRAPHY)
    : geoPicker === 'province'
      ? Object.keys(CHILE_GEOGRAPHY[regionInput] ?? {})
      : geoPicker === 'commune'
        ? CHILE_GEOGRAPHY[regionInput]?.[provinceInput] ?? []
        : [];
  const selectedGeography = CHILE_GEOGRAPHY[regionInput];
  const addressGeographyIsValid = Boolean(
    selectedGeography?.[provinceInput]?.includes(communeInput),
  );

  const updateQuantity = (id: number, change: number) => {
    setQuoteRequestError(null);
    setCart((items) =>
      items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + change } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const openAddressEditor = (addressToEdit?: PurchaseAddress) => {
    setEditingAddressId(addressToEdit?.id ?? null);
    setAddressLabel(addressToEdit?.label ?? '');
    setRegionInput(addressToEdit?.region ?? '');
    setProvinceInput(addressToEdit?.province ?? '');
    setCommuneInput(addressToEdit?.commune ?? '');
    setStreetInput(addressToEdit?.street ?? '');
    setNumberInput(addressToEdit?.number ?? '');
    setDepartmentInput(addressToEdit?.department ?? '');
    setReferenceInput(addressToEdit?.reference ?? '');
    setGeoPicker(null);
    setScreen('new-address');
  };

  const selectGeography = (field: GeographyField, value: string) => {
    if (field === 'region') {
      const provinces = CHILE_GEOGRAPHY[value] ?? {};
      const province = Object.keys(provinces)[0] ?? '';
      setRegionInput(value);
      setProvinceInput(province);
      setCommuneInput(provinces[province]?.[0] ?? '');
    } else if (field === 'province') {
      setProvinceInput(value);
      setCommuneInput(CHILE_GEOGRAPHY[regionInput]?.[value]?.[0] ?? '');
    } else {
      setCommuneInput(value);
    }
    setGeoPicker(null);
  };

  const deleteAddress = (id: string) => {
    const remaining = addresses.filter((item) => item.id !== id);
    setAddresses(remaining);
    if (selectedAddressId === id) {
      setSelectedAddressId(remaining[0]?.id ?? null);
    }
  };

  const saveAddress = () => {
    const requiredFields = [
      addressLabel,
      regionInput,
      provinceInput,
      communeInput,
      streetInput,
      numberInput,
    ];
    if (requiredFields.some((value) => !value.trim()) || !addressGeographyIsValid) return;

    const updatedAddress: PurchaseAddress = {
      id: editingAddressId ?? `address-${Date.now()}`,
      label: addressLabel.trim(),
      region: regionInput.trim(),
      province: provinceInput.trim(),
      commune: communeInput.trim(),
      street: streetInput.trim(),
      number: numberInput.trim(),
      department: departmentInput.trim(),
      reference: referenceInput.trim(),
    };

    if (editingAddressId) {
      setAddresses((current) =>
        current.map((item) =>
          item.id === editingAddressId ? updatedAddress : item,
        ),
      );
    } else {
      setAddresses((current) => [...current, updatedAddress]);
    }

    setSelectedAddressId(updatedAddress.id);
    setEditingAddressId(null);
    setAddressLabel('');
    setRegionInput('');
    setProvinceInput('');
    setCommuneInput('');
    setStreetInput('');
    setNumberInput('');
    setDepartmentInput('');
    setReferenceInput('');
    setScreen('addresses');
  };

  const requestQuoteFromCart = () => {
    if (!cart.length) {
      setQuoteRequestError('Agrega por lo menos un producto antes de solicitar una cotización.');
      return;
    }

    if (
      cart.some(
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

    const vendors = new Set(cart.map((item) => item.vendor.trim()));
    if (vendors.size !== 1) {
      setQuoteRequestError('Solicita una cotización por vendedor.');
      return;
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const quote: Quote = {
      id: `COT-${Date.now()}`,
      vendor: cart[0].vendor.trim(),
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
      total: cart.reduce((total, item) => total + item.price * item.quantity, 0),
      items: cart.map((item) => ({
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
    if (quote.status === 'Expirada') return;
    if (
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
        item.id === quote.id
          ? { ...item, status: 'Aceptada por el cliente' }
          : item,
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
          quantity: quoteItem.qty,
        };
      }),
    );
    setLastOrderTotal(quote.total);
    setScreen('checkout');
  };

  const goBack = () => {
    if (screen === 'checkout') setScreen('cart');
    else if (screen === 'new-address') setScreen('addresses');
    else if (screen === 'addresses' && returnToProfileAfterAddresses) {
      setReturnToProfileAfterAddresses(false);
      setScreen('profile');
    } else setScreen('home');
  };

  const header = (title: string, subtitle?: string) => (
    <View style={styles.header}>
      {screen !== 'home' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={goBack}
          style={styles.backButton}>
          <AppText style={styles.backArrow}>‹</AppText>
        </Pressable>
      ) : (
        <View style={styles.brandMark}>
          <AppText style={styles.brandMarkText}>S</AppText>
        </View>
      )}
      <View style={styles.headerCopy}>
        <AppText style={styles.headerTitle}>{title}</AppText>
        {subtitle ? <AppText style={styles.headerSubtitle}>{subtitle}</AppText> : null}
      </View>
      {screen === 'home' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir carrito"
          onPress={() => setScreen('cart')}
          style={styles.cartHeaderButton}>
          <AppText style={styles.cartHeaderIcon}>▱</AppText>
          <View style={styles.cartBadge}>
            <AppText style={styles.cartBadgeText}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </AppText>
          </View>
        </Pressable>
      ) : null}
    </View>
  );

  const accountPageHeader = (title: string) => (
    <View style={styles.accountPageHeader}>
      <View style={styles.accountPageHeaderRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={goBack}
          style={styles.accountPageBackButton}>
          <AppText style={styles.accountPageBackArrow}>‹</AppText>
        </Pressable>
        <View>
          <View style={styles.accountPageIdentity}>
            <MaterialIcons name="shopping-bag" size={14} color="#E5DEFF" />
            <AppText style={styles.accountPageEyebrow}>Mi cuenta · Gaby</AppText>
          </View>
          <AppText style={styles.accountPageTitle}>{title}</AppText>
        </View>
      </View>
    </View>
  );

  const homeScreen = () => (
    <>
      <View style={styles.accountHeader}>
        <View style={styles.accountWelcome}>
          <View style={styles.accountBrand}>
            <View style={styles.accountBrandIcon}>
              <MaterialIcons name="shopping-bag" size={19} color="#FFFFFF" />
            </View>
            <View style={styles.accountGreeting}>
              <AppText style={styles.accountBrandName}>Hola, Gaby</AppText>
              <AppText style={styles.accountBrandSubtitle}>Tu espacio de compra · Shopping</AppText>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir carrito"
            onPress={() => setScreen('cart')}
            style={styles.accountCartHeaderButton}>
            <MaterialIcons name="shopping-cart" size={21} color="#FFFFFF" />
            <View style={styles.cartBadge}>
              <AppText style={styles.cartBadgeText}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </AppText>
            </View>
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.homeContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <AppText style={styles.accountCardTitle}>Tu perfil</AppText>
            <AppText style={styles.secondaryText}>Gaby Lizeth Zanabria · gaby.zanabria@email.com</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar datos personales"
            onPress={() => setScreen('profile')}>
            <AppText style={styles.linkText}>Editar　›</AppText>
          </Pressable>
        </View>

        <View style={styles.accountStats}>
          <DashboardStat label="Pedidos" value={purchaseOrders.length} onPress={() => setScreen('orders')} />
          <DashboardStat label="Favoritos" value={favorites.length} onPress={() => setScreen('favorites')} />
          <DashboardStat label="En el carrito" value={cart.length} onPress={() => setScreen('cart')} />
        </View>

        <SectionTitle title="Mis compras" />
        <View style={styles.menuCard}>
          <MenuRow icon="history" label="Historial de compras" detail="Consulta y sigue tus pedidos" onPress={() => setScreen('orders')} />
          <MenuRow
            icon="undo"
            label="Devoluciones"
            detail="Solicitudes y seguimiento"
            onPress={() => {
              setReturnOrderId(null);
              setScreen('returns');
            }}
          />
          <MenuRow icon="description" label="Mis cotizaciones" detail={`${quotes.length} cotizaciones`} onPress={() => setScreen('quotes')} last />
        </View>

        <SectionTitle title="Mi actividad" />
        <View style={styles.menuCard}>
          <MenuRow icon="favorite-border" label="Mis favoritos" detail={`${favorites.length} productos guardados`} onPress={() => setScreen('favorites')} />
          <MenuRow icon="shopping-cart" label="Mi carrito" detail={`${cart.length} productos · ${money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}`} onPress={() => setScreen('cart')} last />
        </View>

        <View style={styles.helpCard}>
          <View style={styles.helpIcon}>
            <AppText style={styles.helpIconText}>?</AppText>
          </View>
          <AppText style={styles.helpTitle}>¿Necesitas ayuda?</AppText>
          <AppText style={styles.helpSubtitle}>Estamos aquí para acompañarte.</AppText>
          <Pressable accessibilityRole="button" style={styles.helpAction}>
            <AppText style={styles.linkText}>Contactar soporte　›</AppText>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );

  const favoritesScreen = () => (
    <>
      {header('Mis favoritos', `${favorites.length} productos guardados`)}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {favorites.length ? (
          <View style={styles.menuCard}>
            {favorites.map((item) => (
              <ProductRow
                key={item.id}
                product={item}
                onAdd={() => {
                  setCart((items) => {
                    const match = items.find((cartItem) => cartItem.id === item.id);
                    return match
                      ? items.map((cartItem) =>
                          cartItem.id === item.id
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem,
                        )
                      : [...items, { ...item, quantity: 1 }];
                  });
                }}
                onRemove={() =>
                  setFavorites((items) => items.filter((favorite) => favorite.id !== item.id))
                }
              />
            ))}
          </View>
        ) : (
          <EmptyState title="Aún no tienes favoritos" description="Guarda aquí los productos que te gusten." />
        )}
        <OutlineButton label="Seguir explorando" onPress={() => setScreen('home')} />
      </ScrollView>
    </>
  );

  const cartScreen = () => (
    <>
      {header('Mi carrito', `${cart.length} productos`)}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cart.length ? (
          <>
            <View style={styles.menuCard}>
              {cart.map((item) => (
                <ProductRow
                  key={item.id}
                  product={item}
                  showQuantity
                  onIncrease={() => updateQuantity(item.id, 1)}
                  onDecrease={() => updateQuantity(item.id, -1)}
                  onRemove={() => {
                    setQuoteRequestError(null);
                    setCart((items) => items.filter((cartItem) => cartItem.id !== item.id));
                  }}
                />
              ))}
            </View>
            <View style={styles.menuCard}>
              <AppText style={styles.cardHeading}>Resumen de compra</AppText>
              <PriceRow label="Subtotal" value={money(cartTotal)} />
              <PriceRow label="Envío" value="Gratis" valueStyle={styles.freeText} />
              <View style={styles.divider} />
              <PriceRow label="Total" value={money(cartTotal)} bold />
            </View>
            {quoteRequestError ? (
              <View style={styles.quoteErrorBanner}>
                <MaterialIcons name="error-outline" size={18} color="#B23B36" />
                <AppText style={styles.quoteErrorText}>{quoteRequestError}</AppText>
              </View>
            ) : null}
            <PrimaryButton label="Continuar compra" onPress={() => setScreen('checkout')} />
            <OutlineButton label="Solicitar cotización" onPress={requestQuoteFromCart} />
            <OutlineButton label="Seguir comprando" onPress={() => setScreen('home')} />
          </>
        ) : (
          <EmptyState title="Tu carrito está vacío" description="Agrega productos para comenzar tu compra." />
        )}
      </ScrollView>
    </>
  );

  const checkoutScreen = () => (
    <>
      {header('Finalizar compra', 'Revisa tus datos antes de pagar')}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.stepRow}>
          <Step number="1" label="Entrega" active />
          <View style={styles.stepLine} />
          <Step number="2" label="Pago" active />
          <View style={styles.stepLine} />
          <Step number="3" label="Confirmar" />
        </View>
        <View style={styles.menuCard}>
          <SectionTitle
            title="Dirección de entrega"
            action="Cambiar"
            onAction={() => {
              setReturnToProfileAfterAddresses(false);
              setScreen('addresses');
            }}
          />
          <AppText style={styles.addressName}>
            {selectedAddress?.label ?? 'Dirección no seleccionada'}
          </AppText>
          <AppText style={styles.secondaryText}>
            {address || 'Agrega una dirección de entrega.'}
          </AppText>
          {selectedAddress ? (
            <AppText style={styles.secondaryText}>
              {selectedAddress.region}, Provincia de {selectedAddress.province}, Comuna de {selectedAddress.commune}
            </AppText>
          ) : null}
        </View>
        <View style={styles.menuCard}>
          <AppText style={styles.cardHeading}>Método de pago</AppText>
          {['Tarjeta de crédito o débito', 'Pago contra entrega'].map((option) => (
            <Pressable
              key={option}
              onPress={() => setPayment(option)}
              style={styles.paymentOption}>
              <View style={[styles.radio, payment === option && styles.radioSelected]}>
                {payment === option ? <View style={styles.radioDot} /> : null}
              </View>
              <AppText style={styles.paymentLabel}>{option}</AppText>
            </Pressable>
          ))}
        </View>
        <View style={styles.menuCard}>
          <PriceRow label="Productos" value={money(cartTotal)} />
          <PriceRow label="Envío" value="Gratis" valueStyle={styles.freeText} />
          <View style={styles.divider} />
          <PriceRow label="Total a pagar" value={money(cartTotal)} bold />
        </View>
        <PrimaryButton
          label="Confirmar pedido"
          disabled={!cart.length || !selectedAddress}
          onPress={() => {
            const createdAt = new Date();
            const shipping = 0;
            const order: PurchaseOrder = {
              id: `TW-${createdAt.getTime().toString().slice(-4)}`,
              date: createdAt.toLocaleDateString('es-CL'),
              createdAt: createdAt.toISOString(),
              store: cart[0]?.vendor ?? 'Tienda Sur',
              status: 'Recibido',
              products: cart.map((item) => ({
                id: item.id,
                name: item.name,
                detail: item.detail,
                price: item.price,
                qty: item.quantity,
              })),
              total: cartTotal + shipping,
              shipping,
              payment,
              address: selectedAddress
                ? `${selectedAddress.street} ${selectedAddress.number}, ${selectedAddress.commune}, ${selectedAddress.region}`
                : '',
              dispatch: {},
              history: [{ date: createdAt.toISOString(), status: 'Recibido' }],
            };
            setLastOrderId(order.id);
            setPurchaseOrders((current) => [order, ...current]);
            setLastOrderTotal(cartTotal);
            setCart([]);
            setScreen('confirmation');
          }}
        />
        <AppText style={styles.secureNote}>▣　Tu compra está protegida</AppText>
      </ScrollView>
    </>
  );

  const confirmationScreen = () => (
    <>
      {header('Compra confirmada')}
      <View style={styles.centeredContent}>
        <View style={styles.successCircle}>
          <AppText style={styles.successCheck}>✓</AppText>
        </View>
        <AppText style={styles.confirmTitle}>¡Gracias por tu compra!</AppText>
        <AppText style={styles.confirmCopy}>
          Tu pedido se realizó correctamente. Te avisaremos cuando esté en camino.
        </AppText>
        <View style={[styles.menuCard, styles.confirmCard]}>
          <AppText style={styles.secondaryText}>Número de pedido</AppText>
          <AppText style={styles.orderNumber}>{lastOrderId}</AppText>
          <View style={styles.divider} />
          <PriceRow label="Total pagado" value={money(lastOrderTotal)} bold />
          <AppText style={styles.secondaryText}>Entrega estimada: 3–5 días hábiles</AppText>
        </View>
        <PrimaryButton label="Ver mis compras" onPress={() => setScreen('orders')} />
        <OutlineButton label="Volver al inicio" onPress={() => setScreen('home')} />
      </View>
    </>
  );

  const ordersScreen = () => (
    <PurchaseHistoryScreen
      orders={purchaseOrders}
      onBack={() => setScreen('home')}
      onRequestReturn={(order) => {
        setReturnOrderId(order.id);
        setScreen('returns');
      }}
    />
  );

  const returnsScreen = () => (
    <ReturnsScreen
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

  const quotesScreen = () => (
    <QuotationsScreen
      quotes={quotes}
      onBack={() => setScreen('home')}
      onGoToCart={() => setScreen('cart')}
      onAcceptQuote={acceptQuote}
    />
  );

  const profileScreen = () => (
    <ProfileScreen
      addressSummary={address || 'Agrega una dirección'}
      hasSelectedAddress={Boolean(selectedAddress)}
      onBack={() => setScreen('home')}
      onAddresses={() => {
        setReturnToProfileAfterAddresses(true);
        setScreen('addresses');
      }}
    />
  );

  const addressesScreen = () => (
    <>
      {accountPageHeader('Mis direcciones')}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {addresses.length ? (
          addresses.map((item) => {
            const selected = item.id === selectedAddressId;
            return (
              <View
                key={item.id}
                style={[styles.addressCard, selected && styles.addressCardSelected]}>
                <View style={styles.addressCardHeader}>
                  <AppText style={styles.addressName}>{item.label}</AppText>
                  <View style={styles.addressActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Editar dirección ${item.label}`}
                      onPress={() => openAddressEditor(item)}
                      style={styles.addressIconButton}>
                      <MaterialIcons name="edit" size={17} color={purple} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Eliminar dirección ${item.label}`}
                      onPress={() => deleteAddress(item.id)}
                      style={styles.addressIconButton}>
                      <MaterialIcons name="delete-outline" size={18} color={muted} />
                    </Pressable>
                    {selected ? (
                      <View
                        accessible
                        accessibilityLabel="Dirección seleccionada"
                        style={styles.selectedAddressCheck}>
                        <MaterialIcons name="check" size={17} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedAddressId(item.id)}
                  style={styles.addressDetails}>
                  <AppText style={styles.secondaryText}>
                    {item.region}, Provincia de {item.province}, Comuna de {item.commune}
                  </AppText>
                  <AppText style={styles.addressText}>
                    {item.street} {item.number}
                    {item.department ? `, ${item.department}` : ''}
                  </AppText>
                  {item.reference ? (
                    <AppText style={styles.secondaryText}>
                      Referencia: {item.reference}
                    </AppText>
                  ) : null}
                  {selected ? (
                    <AppText style={styles.selectedLabel}>Dirección seleccionada</AppText>
                  ) : null}
                </Pressable>
              </View>
            );
          })
        ) : (
          <EmptyState
            title="Aún no tienes direcciones"
            description="Agrega una dirección para recibir tus compras."
          />
        )}
        <OutlineButton
          label="＋　Agregar dirección"
          onPress={() => openAddressEditor()}
        />
      </ScrollView>
    </>
  );

  const newAddressScreen = () => (
    <>
      {accountPageHeader(editingAddressId ? 'Editar dirección' : 'Agregar dirección')}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuCard}>
          <AppText style={styles.inputLabel}>Etiqueta</AppText>
          <TextInput
            value={addressLabel}
            onChangeText={(value) => setAddressLabel(lettersAndSpaces(value))}
            placeholder="Casa u oficina"
            placeholderTextColor="#9696A5"
            autoCapitalize="words"
            style={styles.input}
          />
          <AppText style={styles.inputLabel}>Región</AppText>
          <GeographySelect
            value={regionInput}
            placeholder="Selecciona una región"
            onPress={() => setGeoPicker('region')}
          />
          <AppText style={styles.inputLabel}>Provincia</AppText>
          <GeographySelect
            value={provinceInput}
            placeholder="Selecciona una provincia"
            disabled={!regionInput}
            onPress={() => setGeoPicker('province')}
          />
          <AppText style={styles.inputLabel}>Comuna</AppText>
          <GeographySelect
            value={communeInput}
            placeholder="Selecciona una comuna"
            disabled={!provinceInput}
            onPress={() => setGeoPicker('commune')}
          />
          <AppText style={styles.inputLabel}>Calle</AppText>
          <TextInput
            value={streetInput}
            onChangeText={setStreetInput}
            placeholder="Nombre de la calle"
            placeholderTextColor="#9696A5"
            autoCapitalize="words"
            style={styles.input}
          />
          <AppText style={styles.inputLabel}>Número</AppText>
          <TextInput
            value={numberInput}
            onChangeText={(value) => setNumberInput(value.replace(/\D/g, '').slice(0, 8))}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={8}
            placeholder="Número exterior"
            placeholderTextColor="#9696A5"
            style={styles.input}
          />
          <AppText style={styles.inputLabel}>Departamento (opcional)</AppText>
          <TextInput
            value={departmentInput}
            onChangeText={setDepartmentInput}
            placeholder="Depto. / oficina"
            placeholderTextColor="#9696A5"
            style={styles.input}
          />
          <AppText style={styles.inputLabel}>Referencia (opcional)</AppText>
          <TextInput
            value={referenceInput}
            onChangeText={setReferenceInput}
            placeholder="Indicaciones para llegar"
            placeholderTextColor="#9696A5"
            multiline
            style={styles.textArea}
          />
        </View>
        <PrimaryButton
          label={editingAddressId ? 'Guardar cambios' : 'Guardar dirección'}
          disabled={
            !addressLabel.trim() ||
            !regionInput.trim() ||
            !provinceInput.trim() ||
            !communeInput.trim() ||
            !streetInput.trim() ||
              !numberInput.trim() ||
              !addressGeographyIsValid
          }
          onPress={saveAddress}
        />
      </ScrollView>
      <Modal
        visible={geoPicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setGeoPicker(null)}>
        <View style={styles.geoPickerBackdrop}>
          <View style={styles.geoPickerCard}>
            <View style={styles.geoPickerHeader}>
              <AppText style={styles.geoPickerTitle}>
                {geoPicker === 'region'
                  ? 'Selecciona una región'
                  : geoPicker === 'province'
                    ? 'Selecciona una provincia'
                    : 'Selecciona una comuna'}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar selector"
                onPress={() => setGeoPicker(null)}
                style={styles.geoPickerClose}>
                <MaterialIcons name="close" size={20} color={muted} />
              </Pressable>
            </View>
            <ScrollView style={styles.geoPickerOptions}>
              {geographyOptions.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected:
                      (geoPicker === 'region' && option === regionInput) ||
                      (geoPicker === 'province' && option === provinceInput) ||
                      (geoPicker === 'commune' && option === communeInput),
                  }}
                  onPress={() => geoPicker && selectGeography(geoPicker, option)}
                  style={styles.geoPickerOption}>
                  <AppText style={styles.geoPickerOptionText}>{option}</AppText>
                  {((geoPicker === 'region' && option === regionInput) ||
                    (geoPicker === 'province' && option === provinceInput) ||
                    (geoPicker === 'commune' && option === communeInput)) ? (
                    <MaterialIcons name="check" size={19} color={purple} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );

  const content: Record<Screen, () => ReactNode> = {
    home: homeScreen,
    favorites: favoritesScreen,
    cart: cartScreen,
    checkout: checkoutScreen,
    confirmation: confirmationScreen,
    orders: ordersScreen,
    returns: returnsScreen,
    quotes: quotesScreen,
    profile: profileScreen,
    addresses: addressesScreen,
    'new-address': newAddressScreen,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>{content[screen]()}</View>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  label,
  detail,
  onPress,
  last = false,
}: {
  icon: MaterialIconName;
  label: string;
  detail?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, !last && styles.menuRowBorder, pressed && styles.pressed]}>
      <View style={styles.menuIcon}>
        <MaterialIcons name={icon} size={19} color={purple} />
      </View>
      <View style={styles.menuCopy}>
        <AppText style={styles.menuLabel}>{label}</AppText>
        {detail ? <AppText style={styles.secondaryText}>{detail}</AppText> : null}
      </View>
      <AppText style={styles.menuChevron}>›</AppText>
    </Pressable>
  );
}

function DashboardStat({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.dashboardStat, pressed && styles.pressed]}>
      <AppText style={styles.dashboardStatValue}>{value}</AppText>
      <AppText style={styles.dashboardStatLabel}>{label}</AppText>
    </Pressable>
  );
}

function GeographySelect({
  value,
  placeholder,
  onPress,
  disabled = false,
}: {
  value: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.geoSelect, disabled && styles.geoSelectDisabled]}>
      <AppText style={[styles.geoSelectText, !value && styles.geoSelectPlaceholder]}>
        {value || placeholder}
      </AppText>
      <MaterialIcons name="keyboard-arrow-down" size={21} color={muted} />
    </Pressable>
  );
}

function PriceRow({
  label,
  value,
  bold = false,
  valueStyle,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.priceRow}>
      <AppText style={[styles.secondaryText, bold && styles.priceBold]}>{label}</AppText>
      <AppText style={[styles.priceValue, bold && styles.priceBold, valueStyle]}>{value}</AppText>
    </View>
  );
}

function Step({ number, label, active = false }: { number: string; label: string; active?: boolean }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, active && styles.stepNumberActive]}>
        <AppText style={[styles.stepNumberText, active && styles.stepNumberTextActive]}>{number}</AppText>
      </View>
      <AppText style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</AppText>
    </View>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><AppText style={styles.emptyIconText}>♡</AppText></View>
      <AppText style={styles.emptyTitle}>{title}</AppText>
      <AppText style={styles.emptyDescription}>{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: background },
  screen: {
    flex: 1,
    backgroundColor: '#FAF9FD',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 390,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D8D3E1',
    shadowColor: '#27223A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  text: { color: ink, fontSize: 14, fontFamily: 'System' },
  header: {
    minHeight: 66,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9E8F0',
    gap: 12,
  },
  accountHeader: {
    height: 92,
    backgroundColor: purple,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  accountWelcome: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountBrand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  accountBrandIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  accountGreeting: { gap: 3 },
  accountBrandName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  accountBrandSubtitle: { color: '#E1DAFF', fontSize: 11 },
  accountCartHeaderButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  accountPageHeader: {
    height: 92,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: purple,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  accountPageHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountPageBackButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountPageBackArrow: { color: '#FFFFFF', fontSize: 30, lineHeight: 34, marginTop: -3 },
  accountPageIdentity: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  accountPageEyebrow: { color: '#D9D0FF', fontSize: 10 },
  accountPageTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: purple, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: ink },
  headerSubtitle: { fontSize: 12, color: muted, marginTop: 2 },
  backButton: { width: 34, height: 38, justifyContent: 'center' },
  backArrow: { color: purple, fontSize: 36, lineHeight: 38 },
  cartHeaderButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  cartHeaderIcon: { fontSize: 20, color: purple },
  cartBadge: { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: purple, fontSize: 10, fontWeight: '700' },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 96 },
  homeContent: { paddingHorizontal: 16, paddingTop: 16, gap: 15, paddingBottom: 96 },
  profileCard: { minHeight: 82, borderRadius: 15, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderWidth: 1, borderColor: '#EEEAF5' },
  accountCardTitle: { color: ink, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { color: ink, fontSize: 14, fontWeight: '700' },
  accountStats: { flexDirection: 'row', gap: 9 },
  dashboardStat: { flex: 1, minHeight: 74, justifyContent: 'center', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 13, backgroundColor: '#FFFFFF' },
  dashboardStatValue: { color: purple, fontSize: 18, fontWeight: '800' },
  dashboardStatLabel: { color: muted, fontSize: 10, textAlign: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3, marginBottom: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: ink },
  linkText: { fontSize: 12, color: purple, fontWeight: '600' },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#EEEAF5' },
  menuRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  menuRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  menuIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#F2EFFF', alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1, gap: 3 },
  menuLabel: { fontSize: 13, fontWeight: '600', color: ink },
  menuChevron: { color: '#A3A1B0', fontSize: 24 },
  helpCard: { borderRadius: 15, backgroundColor: '#EEE9FF', padding: 16, gap: 5, borderWidth: 1, borderColor: '#E5DEFF' },
  helpIcon: { width: 27, height: 27, borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  helpIconText: { color: purple, fontSize: 15, fontWeight: '800' },
  helpTitle: { fontSize: 14, fontWeight: '700' },
  helpSubtitle: { fontSize: 12, color: muted, marginBottom: 4 },
  helpAction: { alignSelf: 'flex-start', paddingVertical: 3 },
  secondaryText: { color: muted, fontSize: 12, lineHeight: 18 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  productImage: { width: 72, height: 76, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  productEmoji: { fontSize: 34 },
  productDetails: { flex: 1, alignItems: 'flex-start', gap: 3 },
  productName: { fontSize: 14, color: ink, fontWeight: '600' },
  productPrice: { fontSize: 14, color: purple, fontWeight: '700', marginTop: 2 },
  smallAction: { width: 30, height: 30, borderRadius: 10, backgroundColor: purple, alignItems: 'center', justifyContent: 'center' },
  smallActionText: { color: '#FFFFFF', fontSize: 19, lineHeight: 22 },
  removeAction: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#F5F4F8', alignItems: 'center', justifyContent: 'center' },
  removeActionText: { color: muted, fontSize: 22, lineHeight: 24 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 5, borderWidth: 1, borderColor: '#E9E7F0', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 3 },
  quantityButton: { fontSize: 17, color: purple, fontWeight: '600' },
  quantityValue: { fontSize: 12, fontWeight: '600', minWidth: 12, textAlign: 'center' },
  primaryButton: { minHeight: 48, borderRadius: 13, backgroundColor: purple, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  disabledButton: { opacity: 0.45 },
  outlineButton: { minHeight: 44, borderRadius: 13, borderWidth: 1, borderColor: '#D8D1F6', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  outlineButtonText: { color: purple, fontWeight: '600', fontSize: 13 },
  pressed: { opacity: 0.72 },
  cardHeading: { fontSize: 14, fontWeight: '700', color: ink, marginVertical: 10 },
  priceRow: { minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceValue: { fontSize: 13, color: ink },
  priceBold: { color: ink, fontWeight: '700', fontSize: 15 },
  freeText: { color: '#1C9A67', fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EAE9F0', marginVertical: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 3 },
  step: { alignItems: 'center', gap: 5 },
  stepNumber: { width: 25, height: 25, borderRadius: 13, borderWidth: 1, borderColor: '#D7D5E0', alignItems: 'center', justifyContent: 'center' },
  stepNumberActive: { backgroundColor: purple, borderColor: purple },
  stepNumberText: { fontSize: 11, color: muted },
  stepNumberTextActive: { color: '#FFFFFF', fontWeight: '700' },
  stepLabel: { fontSize: 10, color: muted },
  stepLabelActive: { color: purple, fontWeight: '600' },
  stepLine: { width: 38, height: 1, backgroundColor: '#DAD8E3', marginHorizontal: 7, marginBottom: 15 },
  addressName: { fontSize: 14, fontWeight: '700', marginTop: 6, marginBottom: 3 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  paymentCopy: { flex: 1 },
  paymentLabel: { fontSize: 13, fontWeight: '500' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#C8C5D3', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: purple },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: purple },
  secureNote: { textAlign: 'center', color: muted, fontSize: 11, paddingVertical: 3 },
  centeredContent: { flex: 1, justifyContent: 'center', padding: 22, gap: 14 },
  successCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#E9F8F0', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  successCheck: { color: '#1DA76B', fontSize: 38, fontWeight: '700' },
  confirmTitle: { color: ink, fontSize: 21, fontWeight: '800', textAlign: 'center' },
  confirmCopy: { color: muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  confirmCard: { paddingVertical: 14, gap: 5 },
  orderNumber: { color: ink, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 1 },
  filterActive: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: purple },
  filterActiveText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9E7F0' },
  filterText: { fontSize: 11, color: muted },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingVertical: 8 },
  statusPill: { backgroundColor: '#F0ECFF', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { color: purple, fontSize: 10, fontWeight: '600' },
  statusGreen: { backgroundColor: '#E7F7EF' },
  statusGreenText: { color: '#178757' },
  statusOrange: { backgroundColor: '#FFF4E4' },
  statusOrangeText: { color: '#B97712' },
  orderProducts: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9 },
  miniProduct: { width: 29, height: 29, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  orderTotal: { marginLeft: 'auto', fontSize: 12, fontWeight: '700', color: ink },
  infoBanner: { flexDirection: 'row', gap: 10, backgroundColor: '#F0EDFF', borderRadius: 13, padding: 13 },
  infoIcon: { color: purple, fontSize: 17, fontWeight: '700' },
  infoCopy: { flex: 1, fontSize: 12, lineHeight: 18, color: '#5E5973' },
  quoteErrorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 11, backgroundColor: '#FDEDEC' },
  quoteErrorText: { flex: 1, color: '#9E302B', fontSize: 11, lineHeight: 16 },
  selectField: { minHeight: 43, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 10, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  chevron: { color: muted, fontSize: 18 },
  textArea: { minHeight: 82, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 10, padding: 11, textAlignVertical: 'top', color: ink, fontSize: 12 },
  quoteIcon: { color: purple, fontSize: 23, backgroundColor: '#F0EDFF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  quoteAction: { paddingVertical: 7 },
  quoteDescription: { marginTop: 10 },
  successBanner: { backgroundColor: '#E7F7EF', borderRadius: 11, padding: 12 },
  successBannerText: { color: '#178757', fontSize: 12, fontWeight: '600' },
  inputLabel: { color: muted, fontSize: 11, marginTop: 12, marginBottom: 6 },
  input: { height: 43, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 10, paddingHorizontal: 12, color: ink, fontSize: 13 },
  geoSelect: { minHeight: 45, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  geoSelectDisabled: { backgroundColor: '#F6F5F8', opacity: 0.6 },
  geoSelectText: { color: ink, fontSize: 13 },
  geoSelectPlaceholder: { color: '#9696A5' },
  geoPickerBackdrop: { flex: 1, backgroundColor: 'rgba(27,24,40,0.42)', justifyContent: 'center', padding: 24 },
  geoPickerCard: { maxHeight: '80%', borderRadius: 18, padding: 16, backgroundColor: '#FFFFFF' },
  geoPickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  geoPickerTitle: { color: ink, fontSize: 16, fontWeight: '700' },
  geoPickerClose: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#F4F2F7' },
  geoPickerOptions: { flexGrow: 0 },
  geoPickerOption: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0', paddingHorizontal: 4 },
  geoPickerOptionText: { color: ink, fontSize: 14 },
  addressCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 16, borderWidth: 1, borderColor: '#EEEAF5', gap: 8 },
  addressCardSelected: { backgroundColor: '#F7F4FF', borderWidth: 2, borderColor: purple },
  addressCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  addressCardTitle: { color: ink, fontSize: 14, fontWeight: '700' },
  addressActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressIconButton: { width: 31, height: 31, borderWidth: 1, borderColor: '#E9E7F0', borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  selectedAddressCheck: { width: 29, height: 29, borderRadius: 15, backgroundColor: purple, alignItems: 'center', justifyContent: 'center' },
  addressDetails: { gap: 2 },
  addressText: { fontSize: 13, color: ink, marginTop: 3 },
  selectedLabel: { color: purple, fontSize: 11, fontWeight: '700', marginTop: 4 },
  emptyState: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 55, gap: 9 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFEAFF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyIconText: { color: purple, fontSize: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptyDescription: { color: muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
