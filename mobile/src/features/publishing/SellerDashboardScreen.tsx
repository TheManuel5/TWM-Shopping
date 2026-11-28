import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ActionButton,
  Badge,
  Card,
  palette,
  ScreenShell,
  SectionTitle,
  StatCard,
  StateGate,
  styles as uiStyles,
} from './ui';
import { useSellerState } from './useSellerState';
import { dateKey, formatCLP } from './validation';

const ORDER_STATUSES = ['Recibido', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'];

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function SellerDashboardScreen() {
  const { profile, collections, loading, refreshing, error, reload, refresh } =
    useSellerState({ requireSeller: true });
  const [month, setMonth] = useState(() => dateKey().slice(0, 7));

  const myCatalog = useMemo(() => {
    const all = collections.catalog ?? [];
    if (!profile) return [];
    return profile.canAdmin ? all : all.filter((item) => item.ownerRut === profile.rut);
  }, [collections.catalog, profile]);

  const myOrders = useMemo(() => {
    const all = collections.orders ?? [];
    if (!profile) return [];
    return profile.canAdmin ? all : all.filter((item) => item.sellerRut === profile.rut);
  }, [collections.orders, profile]);

  const myQuotes = useMemo(() => {
    const all = collections.quotes ?? [];
    if (!profile) return [];
    return profile.canAdmin ? all : all.filter((item) => item.sellerRut === profile.rut);
  }, [collections.quotes, profile]);

  const myReturns = useMemo(() => {
    const all = collections.returns ?? [];
    if (!profile) return [];
    return profile.canAdmin ? all : all.filter((item) => item.sellerRut === profile.rut);
  }, [collections.returns, profile]);

  const selectedOrders = useMemo(
    () =>
      myOrders.filter((order) => {
        const key = dateKey(order.createdAt || order.date);
        return key.startsWith(month);
      }),
    [month, myOrders],
  );

  const sales = useMemo(
    () => selectedOrders.filter((order) => order.status !== 'Cancelado'),
    [selectedOrders],
  );

  const totalRevenue = sales.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const lowStock = myCatalog.filter(
    (item) => item.tipo !== 'Servicio' && Number(item.stock ?? 0) < 10,
  );
  const pendingQuotes = myQuotes.filter((quote) => quote.status === 'Solicitada');
  const pendingOrders = myOrders.filter((order) =>
    ['Recibido', 'En preparación', 'Enviado', 'En reparto'].includes(order.status),
  );
  const pendingReturns = myReturns.filter((ret) => ret.status === 'Solicitada');
  const deliveredCount = myOrders.filter((order) => order.status === 'Entregado').length;

  const daysInMonth = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m || 1, 0).getDate() || 31;
  }, [month]);

  const bars = useMemo(() => {
    const map = new Map<number, number>();
    for (const order of sales) {
      const key = dateKey(order.createdAt || order.date);
      const day = Number(key.slice(8, 10));
      if (day >= 1 && day <= 31) {
        map.set(day, (map.get(day) ?? 0) + Number(order.total || 0));
      }
    }
    return Array.from({ length: daysInMonth }, (_, idx) => ({
      day: idx + 1,
      amount: map.get(idx + 1) ?? 0,
    }));
  }, [daysInMonth, sales]);

  const maxBar = Math.max(1, ...bars.map((b) => b.amount));

  return (
    <ScreenShell
      title="Panel de control"
      subtitle="Resumen comercial, inventario y operaciones"
      refreshing={refreshing}
      onRefresh={refresh}
    >
      <StateGate loading={loading} error={error} onRetry={reload}>
        <Card style={styles.monthCard}>
          <Pressable
            accessibilityLabel="Mes anterior"
            onPress={() => setMonth((m) => shiftMonth(m, -1))}
            style={styles.monthBtn}
          >
            <Ionicons name="chevron-back" size={18} color={palette.ink} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={uiStyles.hintText}>Periodo seleccionado</Text>
            <Text style={styles.monthText}>{month}</Text>
          </View>
          <Pressable
            accessibilityLabel="Mes siguiente"
            onPress={() => setMonth((m) => shiftMonth(m, 1))}
            style={styles.monthBtn}
          >
            <Ionicons name="chevron-forward" size={18} color={palette.ink} />
          </Pressable>
        </Card>

        <View style={uiStyles.statGrid}>
          <StatCard label="Ventas del mes" value={formatCLP(totalRevenue)} tone="success" />
          <StatCard label="Pedidos" value={String(selectedOrders.length)} />
          <StatCard
            label="Stock bajo"
            value={String(lowStock.length)}
            hint="Menos de 10 unidades"
            tone="warning"
          />
          <StatCard label="Cotizaciones pend." value={String(pendingQuotes.length)} />
        </View>

        <Card>
          <SectionTitle
            title="Ventas diarias"
            right={<Text style={styles.totalAccent}>{formatCLP(totalRevenue)}</Text>}
          />
          <View style={styles.chartBox}>
            {bars.map((bar) => (
              <View key={bar.day} style={styles.barCol}>
                <View
                  style={[
                    styles.barFill,
                    { height: Math.max(3, Math.round((bar.amount / maxBar) * 90)) },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {bar.day === 1 || bar.day % 5 === 0 ? bar.day : ''}
                </Text>
              </View>
            ))}
          </View>
          {!sales.length && (
            <Text style={uiStyles.hintText}>Sin ventas registradas en {month}.</Text>
          )}
        </Card>

        <Card>
          <SectionTitle
            title="Operaciones pendientes"
            right={<Badge label={`${deliveredCount} entregados`} tone="success" />}
          />
          <View style={styles.pendingRow}>
            <Text style={styles.pendingLabel}>Pedidos activos por gestionar</Text>
            <Badge label={String(pendingOrders.length)} tone="primary" />
          </View>
          <View style={styles.pendingRow}>
            <Text style={styles.pendingLabel}>Cotizaciones por responder</Text>
            <Badge label={String(pendingQuotes.length)} tone="warning" />
          </View>
          <View style={styles.pendingRow}>
            <Text style={styles.pendingLabel}>Devoluciones solicitadas</Text>
            <Badge label={String(pendingReturns.length)} tone="danger" />
          </View>
          <View style={styles.quickLinks}>
            <ActionButton
              label="Mis productos"
              variant="outline"
              onPress={() => router.push('/vendedor/mis-productos' as never)}
              style={{ flex: 1 }}
            />
            <ActionButton
              label="Inventario"
              variant="outline"
              onPress={() => router.push('/vendedor/inventario' as never)}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        <Card>
          <SectionTitle title="Distribución de pedidos" />
          {ORDER_STATUSES.map((status) => {
            const count = selectedOrders.filter((o) => o.status === status).length;
            const pct = Math.round((count / Math.max(1, selectedOrders.length)) * 100);
            return (
              <View key={status} style={{ gap: 4 }}>
                <View style={styles.distRow}>
                  <Text style={styles.distLabel}>{status}</Text>
                  <Text style={styles.distValue}>{count}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })}
        </Card>

        <Card>
          <SectionTitle
            title="Alertas de inventario (< 10)"
            right={
              <Pressable onPress={() => router.push('/vendedor/inventario' as never)}>
                <Text style={styles.linkText}>Ver todo</Text>
              </Pressable>
            }
          />
          {lowStock.length === 0 ? (
            <Text style={uiStyles.hintText}>El inventario no presenta alertas críticas.</Text>
          ) : (
            lowStock.slice(0, 6).map((item) => (
              <View key={item.id} style={styles.alertRow}>
                <Text style={styles.alertName} numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Badge label={`Stock: ${item.stock ?? 0}`} tone="warning" />
              </View>
            ))
          )}
        </Card>

        <Card>
          <SectionTitle title="Transacciones recientes del periodo" />
          {selectedOrders.length === 0 ? (
            <Text style={uiStyles.hintText}>No hay transacciones en este periodo.</Text>
          ) : (
            selectedOrders.slice(0, 8).map((order) => (
              <View key={order.id} style={styles.txRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txId}>
                    #{order.id} · {order.customer}
                  </Text>
                  <Text style={uiStyles.hintText}>{order.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Text style={styles.txAmount}>{formatCLP(order.total)}</Text>
                  <Badge label={order.status} tone="neutral" />
                </View>
              </View>
            ))
          )}
        </Card>
      </StateGate>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.ink,
  },
  totalAccent: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.primary,
  },
  chartBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 112,
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingTop: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '80%',
    backgroundColor: palette.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 8,
    color: palette.muted,
    marginTop: 2,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  pendingLabel: {
    fontSize: 13,
    color: palette.ink,
    fontWeight: '600',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  distRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distLabel: {
    fontSize: 12,
    color: palette.ink,
    fontWeight: '600',
  },
  distValue: {
    fontSize: 12,
    color: palette.ink,
    fontWeight: '800',
  },
  progressTrack: {
    height: 7,
    backgroundColor: palette.primarySoft,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 4,
  },
  alertName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  txId: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.primary,
  },
});
