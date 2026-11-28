import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { deleteCatalogItem, resolveImageUri } from './api';
import type { CatalogItem } from './types';
import {
  ActionButton,
  Badge,
  Card,
  FilterChips,
  palette,
  ScreenShell,
  SearchBar,
  StatCard,
  StateGate,
  styles as uiStyles,
} from './ui';
import { useSellerState } from './useSellerState';
import { formatCLP } from './validation';

export function MyProductsScreen() {
  const { profile, collections, revision, loading, refreshing, error, reload, refresh } =
    useSellerState({ requireSeller: true });

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Producto' | 'Servicio'>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Publicado' | 'Borrador'>('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');

  const myCatalog = useMemo(() => {
    const all = collections.catalog ?? [];
    if (!profile) return [];
    return profile.canAdmin ? all : all.filter((item) => item.ownerRut === profile.rut);
  }, [collections.catalog, profile]);

  const categories = useMemo(
    () => ['Todas', ...new Set(myCatalog.map((item) => item.categoria).filter(Boolean))],
    [myCatalog],
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return myCatalog.filter((item) => {
      const matchesText =
        !text ||
        [item.nombre, item.categoria, item.descripcion, item.id]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(text);
      const matchesType = typeFilter === 'Todos' || item.tipo === typeFilter;
      const matchesStatus = statusFilter === 'Todos' || item.estado === statusFilter;
      const matchesCat = categoryFilter === 'Todas' || item.categoria === categoryFilter;
      return matchesText && matchesType && matchesStatus && matchesCat;
    });
  }, [categoryFilter, myCatalog, query, statusFilter, typeFilter]);

  const myOrders = useMemo(() => {
    const orders = collections.orders ?? [];
    if (!profile) return [];
    return profile.canAdmin ? orders : orders.filter((order) => order.sellerRut === profile.rut);
  }, [collections.orders, profile]);

  const activeSales = myOrders.filter((order) => order.status !== 'Cancelado');
  const totalStock = myCatalog
    .filter((item) => item.tipo !== 'Servicio')
    .reduce((sum, item) => sum + Number(item.stock ?? 0), 0);

  const confirmDelete = (item: CatalogItem) => {
    Alert.alert(
      'Eliminar publicación',
      `¿Seguro que deseas eliminar "${item.nombre}"? Esta acción se aplicará en la base de datos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setBusyId(item.id);
            setActionError('');
            try {
              await deleteCatalogItem(revision, item.id);
              await reload();
            } catch (cause) {
              setActionError(
                cause instanceof Error ? cause.message : 'No se pudo eliminar la publicación.',
              );
            } finally {
              setBusyId('');
            }
          },
        },
      ],
    );
  };

  const openEdit = (item: CatalogItem) => {
    const target =
      item.tipo === 'Servicio' ? '/vendedor/publicar-servicio' : '/vendedor/publicar-producto';
    router.push({ pathname: target as never, params: { editar: item.id } } as never);
  };

  return (
    <ScreenShell
      title="Mis productos y servicios"
      subtitle="Administra, edita o retira tus publicaciones"
      refreshing={refreshing}
      onRefresh={refresh}
      right={
        <Pressable
          accessibilityLabel="Agregar producto"
          onPress={() => router.push('/vendedor/publicar-producto' as never)}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </Pressable>
      }
    >
      <StateGate loading={loading} error={error} onRetry={reload}>
        <View style={uiStyles.statGrid}>
          <StatCard label="Publicaciones" value={String(myCatalog.length)} />
          <StatCard label="Unidades stock" value={String(totalStock)} />
          <StatCard label="Ventas activas" value={String(activeSales.length)} tone="success" />
          <StatCard
            label="Ingresos"
            value={formatCLP(activeSales.reduce((sum, o) => sum + Number(o.total || 0), 0))}
            tone="success"
          />
        </View>

        <View style={styles.quickCreateRow}>
          <ActionButton
            label="Nuevo producto"
            icon="cube-outline"
            onPress={() => router.push('/vendedor/publicar-producto' as never)}
            style={{ flex: 1 }}
          />
          <ActionButton
            label="Nuevo servicio"
            icon="construct-outline"
            variant="outline"
            onPress={() => router.push('/vendedor/publicar-servicio' as never)}
            style={{ flex: 1 }}
          />
        </View>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre, categoría o descripción..."
        />

        <FilterChips
          options={['Todos', 'Producto', 'Servicio']}
          selected={typeFilter}
          onSelect={(val) => setTypeFilter(val as 'Todos' | 'Producto' | 'Servicio')}
        />

        <FilterChips
          options={['Todos', 'Publicado', 'Borrador']}
          selected={statusFilter}
          onSelect={(val) => setStatusFilter(val as 'Todos' | 'Publicado' | 'Borrador')}
        />

        {categories.length > 2 && (
          <FilterChips
            options={categories}
            selected={categoryFilter}
            onSelect={setCategoryFilter}
          />
        )}

        {actionError ? <Text style={uiStyles.errorText}>{actionError}</Text> : null}

        <Text style={styles.countText}>
          Mostrando {filtered.length} de {myCatalog.length} publicaciones
        </Text>

        {filtered.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Ionicons name="bag-outline" size={32} color={palette.muted} />
            <Text style={styles.emptyTitle}>No hay publicaciones para mostrar</Text>
            <Text style={uiStyles.hintText}>
              Ajusta los filtros o crea una nueva publicación para tu tienda.
            </Text>
          </Card>
        ) : (
          filtered.map((item) => {
            const thumb = resolveImageUri(item.imagen);
            const isService = item.tipo === 'Servicio';
            const stockVal = Number(item.stock ?? 0);
            const stockTone = isService
              ? 'success'
              : stockVal === 0
                ? 'danger'
                : stockVal < 10
                  ? 'warning'
                  : 'success';

            return (
              <Card key={item.id}>
                <View style={styles.itemRow}>
                  {thumb ? (
                    <Image source={{ uri: thumb }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.thumbFallback}>
                      <Ionicons
                        name={isService ? 'construct-outline' : 'cube-outline'}
                        size={24}
                        color={palette.primary}
                      />
                    </View>
                  )}

                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.badgeRow}>
                      <Badge label={item.tipo} tone="primary" />
                      <Badge
                        label={item.estado || 'Publicado'}
                        tone={item.estado === 'Borrador' ? 'neutral' : 'success'}
                      />
                      <Badge
                        label={isService ? 'Disponible' : `Stock: ${stockVal}`}
                        tone={stockTone}
                      />
                    </View>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.nombre}
                    </Text>
                    <Text style={uiStyles.hintText} numberOfLines={1}>
                      {item.categoria} · SKU {item.variantes?.[0]?.sku || item.dbId || item.id}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>
                        {formatCLP(item.oferta?.precio ?? item.precio)}
                      </Text>
                      {item.oferta?.precio ? (
                        <Text style={styles.strikePrice}>{formatCLP(item.precio)}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <ActionButton
                    label="Editar"
                    icon="create-outline"
                    variant="outline"
                    onPress={() => openEdit(item)}
                    style={{ flex: 1, paddingVertical: 8 }}
                  />
                  <ActionButton
                    label="Eliminar"
                    icon="trash-outline"
                    variant="danger"
                    loading={busyId === item.id}
                    disabled={Boolean(busyId)}
                    onPress={() => confirmDelete(item)}
                    style={{ flex: 1, paddingVertical: 8 }}
                  />
                </View>
              </Card>
            );
          })
        )}
      </StateGate>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCreateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countText: {
    fontSize: 12,
    color: palette.muted,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: palette.primarySoft,
  },
  thumbFallback: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.ink,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.primary,
  },
  strikePrice: {
    fontSize: 12,
    color: palette.muted,
    textDecorationLine: 'line-through',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
});
