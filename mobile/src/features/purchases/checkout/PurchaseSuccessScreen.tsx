import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import OrdersReturnsHeader from '../OrdersReturnsHeader';
import {
  AppText,
  OutlineButton,
  PriceRow,
  PrimaryButton,
  purchaseTextScale,
} from '../components/PurchaseUi';

const purple = '#5B32EC';

function money(amount: number) {
  return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function PurchaseSuccessScreen({
  orderId,
  total,
  hasOtherItems,
  accountName,
  onBack,
  onViewOrders,
  onViewCart,
  onHome,
}: {
  orderId: string;
  total: number;
  hasOtherItems: boolean;
  accountName: string;
  onBack: () => void;
  onViewOrders: () => void;
  onViewCart: () => void;
  onHome: () => void;
}) {
  const [checkScale] = useState(() => new Animated.Value(0.7));
  const [checkOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: false,
      }),
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [checkOpacity, checkScale]);

  return (
    <>
      <OrdersReturnsHeader title="Compra confirmada" accountName={accountName} onBack={onBack} />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.successCircle,
            { opacity: checkOpacity, transform: [{ scale: checkScale }] },
          ]}>
          <MaterialIcons name="check" size={39} color="#1DA76B" />
        </Animated.View>
        <AppText style={styles.title}>¡Gracias por tu compra!</AppText>
        <AppText style={styles.copy}>
          Tu pedido se realizó correctamente. Te avisaremos cuando esté en camino.
        </AppText>
        <View style={styles.summaryCard}>
          <AppText style={styles.secondaryText}>Número de pedido</AppText>
          <AppText style={styles.orderNumber}>{orderId}</AppText>
          <View style={styles.divider} />
          <PriceRow label="Total pagado" value={money(total)} bold />
          <AppText style={styles.secondaryText}>Entrega estimada: 3–5 días hábiles</AppText>
        </View>
        {hasOtherItems ? (
          <View style={styles.infoBanner}>
            <MaterialIcons name="shopping-cart" size={18} color={purple} />
            <AppText style={styles.infoText}>
              Los productos de los otros vendedores siguen guardados en tu carrito.
            </AppText>
          </View>
        ) : null}
        <PrimaryButton label="Ver mis compras" onPress={onViewOrders} />
        {hasOtherItems ? <OutlineButton label="Ver carrito" onPress={onViewCart} /> : null}
        <OutlineButton label="Volver al inicio" onPress={onHome} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', padding: 22, gap: 14, backgroundColor: '#FAF9FD' },
  successCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#E9F8F0', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  title: { color: '#25243A', fontSize: purchaseTextScale.pageTitle, fontWeight: '800', textAlign: 'center' },
  copy: { color: '#77768A', fontSize: purchaseTextScale.subtitle, lineHeight: 20, textAlign: 'center' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 5, borderWidth: 1, borderColor: '#EEEAF5' },
  secondaryText: { color: '#77768A', fontSize: purchaseTextScale.body, lineHeight: 18 },
  orderNumber: { color: '#25243A', fontSize: purchaseTextScale.sectionTitle, fontWeight: '700', marginBottom: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EAE9F0', marginVertical: 8 },
  infoBanner: { flexDirection: 'row', gap: 10, backgroundColor: '#F0EDFF', borderRadius: 13, padding: 13 },
  infoText: { flex: 1, color: '#5E5973', fontSize: purchaseTextScale.body, lineHeight: 18 },
});
