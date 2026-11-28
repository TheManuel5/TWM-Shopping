import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { resolveImageUri, saveCatalogItem } from './api';
import type { CatalogItem } from './types';
import {
  ActionButton,
  Badge,
  Card,
  FilterChips,
  OptionPickerModal,
  palette,
  ScreenShell,
  SearchBar,
  SectionTitle,
  StatCard,
  StateGate,
  styles as uiStyles,
} from './ui';
import { useSellerState } from './useSellerState';
import { formatCLP } from './validation';

type VariantRow = {
  product: CatalogItem;
  sku: string;
  variantLabel: string;
  stock: number;
  price: number;
  offerPrice?: number;
};

const ADJUST_REASONS = [
  { label: 'Reposición de proveedor', value: 'Reposición' },
  { label: 'Reintegro por devolución', value: 'Devolución aprobada' },
  { label: 'Ajuste de inventario físico', value: 'Auditoría' },
];

function stockStatus(stock: number) {
  if (stock === 0) return { label: 'Sin stock', tone: 'danger' as const };
  if (stock < 10) return { label: 'Stock bajo', tone: 'warning' as const };
  return { label: 'Activo', tone: 'success' as const };
}

export function InventoryScreen() {
  const { profile, collections, revision, loading, refreshing, error, reload, refresh } =
    useSellerState({ requireSeller: true });

  const [tab, setTab] = useState<'Inventario' | 'Ofertas'>('Inventario');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [search, setSearch] = useState('');
  const [adjustTarget, setAdjustTarget] = useState<VariantRow | null>(null);
  const [delta, setDelta] = useState(5);
  const [reason, setReason] = useState('Reposición');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const myProducts = useMemo(() => {
    const all = collections.catalog ?? [];
    if (!profile) return [];
    const scoped = profile.canAdmin ? all : all.filter((item) => item.ownerRut === profile.rut);
    return scoped.filter((item) => item.tipo !== 'Servicio');
  }, [collections.catalog, profile]);

  const rows: VariantRow[] = useMemo(
    () =>
      myProducts.flatMap((product) => {
        const variants = product.variantes?.length
          ? product.variantes
          : [
              {
                sku: `PRD-${product.dbId || product.id}`,
                stock: Number(product.stock ?? 0),
                size: product.tamano || 'Única',
                color: product.color || '',
                price: Number(product.precio ?? 0),
              },
            ];
        return variants.map((variant) => ({
          product,
          sku: variant.sku,
          variantLabel: [variant.size, variant.color].filter(Boolean).join(' · ') || 'Única',
          stock: Number(variant.stock ?? 0),
          price: Number(variant.price ?? product.precio ?? 0),
          offerPrice: product.oferta?.precio,
        }));
      }),
    [myProducts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchLow = !onlyLowStock || row.stock < 10;
      const matchTab = tab !== 'Ofertas' || Boolean(row.offerPrice);
      const matchQuery =
        !q ||
        row.product.nombre.toLowerCase().includes(q) ||
        row.sku.toLowerCase().includes(q);
      return matchLow && matchTab && matchQuery;
    });
  }, [onlyLowStock, rows, search, tab]);

  const lowStockCount = rows.filter((row) => row.stock > 0 && row.stock < 10).length;
  const offerCount = rows.filter((row) => Boolean(row.offerPrice)).length;

  const updateVariantStock = async (row: VariantRow, nextStock: number) => {
    if (saving || !Number.isInteger(nextStock) || nextStock < 0) return;
    setSaving(true);
    setActionError('');
    try {
      const updatedVariants = row.product.variantes?.length
        ? row.product.variantes.map((variant) =>
            variant.sku === row.sku ? { ...variant, stock: nextStock } : variant,
          )
        : [
            {
              sku: row.sku,
              size: row.product.tamano || 'Única',
              color: row.product.color || 'Negro',
              price: row.price,
              stock: nextStock,
            },
          ];

      const updatedProduct: CatalogItem = {
        ...row.product,
        variantes: updatedVariants,
        stock: updatedVariants.reduce((sum, variant) => sum + Number(variant.stock), 0),
      };
      await saveCatalogItem(revision, updatedProduct);
      await reload();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : 'No se pudo actualizar el stock.',
      );
    } finally {
      setSaving(false);
    }
  };

  const removeOffer = (row: VariantRow) => {
    Alert.alert(
      'Quitar oferta',
      `¿Quitar la oferta temporal de "${row.product.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar oferta',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            setActionError('');
            try {
              await saveCatalogItem(revision, { ...row.product, oferta: null });
              setAdjustTarget(null);
              await reload();
            } catch (cause) {
              setActionError(
                cause instanceof Error ? cause.message : 'No se pudo quitar la oferta.',
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenShell
      title="Inventario y ofertas"
      subtitle="Stock por variante y alertas críticas (< 10)"
      refreshing={refreshing}
      onRefresh={refresh}
    >
      <StateGate loading={loading} error={error} onRetry={reload}>
        <View style={uiStyles.statGrid}>
          <StatCard label="Productos" value={String(myProducts.length)} />
          <StatCard label="Variantes" value={String(rows.length)} />
          <StatCard label="Stock bajo (< 10)" value={String(lowStockCount)} tone="warning" />
          <StatCard label="Ofertas activas" value={String(offerCount)} tone="success" />
        </View>

        <FilterChips
          options={['Inventario', 'Ofertas']}
          selected={tab}
          onSelect={(val) => setTab(val as 'Inventario' | 'Ofertas')}
        />

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar producto o SKU..."
        />

        <Card style={styles.lowToggleCard}>
          <Text style={uiStyles.fieldLabel}>Mostrar solo stock bajo (&lt; 10 unidades)</Text>
          <Switch
            value={onlyLowStock}
            onValueChange={setOnlyLowStock}
            trackColor={{ false: palette.border, true: palette.warningSoft }}
            thumbColor={onlyLowStock ? palette.warning : '#F4F4F6'}
          />
        </Card>

        {actionError ? <Text style={uiStyles.errorText}>{actionError}</Text> : null}

        {filtered.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={uiStyles.hintText}>No hay variantes que coincidan con el filtro.</Text>
          </Card>
        ) : (
          filtered.map((row) => {
            const thumb = resolveImageUri(row.product.imagen);
            const status = stockStatus(row.stock);

            return (
              <Card key={`${row.product.id}-${row.sku}`}>
                <View style={styles.rowTop}>
                  {thumb ? (
                    <Image source={{ uri: thumb }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.thumbFallback}>
                      <Ionicons name="cube-outline" size={22} color={palette.primary} />
                    </View>
                  )}
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={styles.badges}>
                      <Badge label={status.label} tone={status.tone} />
                      {row.offerPrice ? <Badge label="En oferta" tone="primary" /> : null}
                    </View>
                    <Text style={styles.name} numberOfLines={2}>
                      {row.product.nombre}
                    </Text>
                    <Text style={uiStyles.hintText}>
                      SKU: {row.sku} · {row.variantLabel}
                    </Text>
                    <Text style={styles.price}>
                      {formatCLP(row.offerPrice ?? row.price)}
                      {row.offerPrice ? ` (antes ${formatCLP(row.price)})` : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.controlsRow}>
                  <View style={styles.stepper}>
                    <Pressable
                      accessibilityLabel={`Disminuir stock de ${row.sku}`}
                      disabled={saving || row.stock <= 0}
                      onPress={() => void updateVariantStock(row, Math.max(0, row.stock - 1))}
                      style={styles.stepBtn}
                    >
                      <Ionicons name="remove" size={18} color={palette.ink} />
                    </Pressable>
                    <Text style={styles.stockNumber}>{row.stock}</Text>
                    <Pressable
                      accessibilityLabel={`Aumentar stock de ${row.sku}`}
                      disabled={saving}
                      onPress={() => void updateVariantStock(row, row.stock + 1)}
                      style={styles.stepBtn}
                    >
                      <Ionicons name="add" size={18} color={palette.ink} />
                    </Pressable>
                  </View>

                  <ActionButton
                    label="Ajustar / Oferta"
                    variant="outline"
                    onPress={() => {
                      setDelta(5);
                      setReason('Reposición');
                      setAdjustTarget(row);
                    }}
                    style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                  />
                </View>
              </Card>
            );
          })
        )}

        <Modal
          visible={Boolean(adjustTarget)}
          transparent
          animationType="slide"
          onRequestClose={() => setAdjustTarget(null)}
        >
          <View style={uiStyles.modalBackdrop}>
            <View style={uiStyles.modalCard}>
              <SectionTitle
                title="Ajustar inventario"
                subtitle={
                  adjustTarget
                    ? `${adjustTarget.product.nombre} · SKU ${adjustTarget.sku}`
                    : undefined
                }
                right={
                  <Pressable onPress={() => setAdjustTarget(null)}>
                    <Ionicons name="close" size={22} color={palette.ink} />
                  </Pressable>
                }
              />

              {adjustTarget && (
                <>
                  <View style={styles.projectionRow}>
                    <Card style={{ flex: 1, backgroundColor: palette.warningSoft }}>
                      <Text style={uiStyles.hintText}>Stock actual</Text>
                      <Text style={styles.bigNumber}>{adjustTarget.stock}</Text>
                    </Card>
                    <Card style={{ flex: 1, backgroundColor: palette.primarySoft }}>
                      <Text style={uiStyles.hintText}>Proyectado</Text>
                      <Text style={[styles.bigNumber, { color: palette.primary }]}>
                        {Math.max(0, adjustTarget.stock + delta)}
                      </Text>
                    </Card>
                  </View>

                  <Text style={uiStyles.fieldLabel}>Unidades a sumar o restar</Text>
                  <View style={styles.stepper}>
                    <Pressable onPress={() => setDelta((d) => d - 1)} style={styles.stepBtn}>
                      <Ionicons name="remove" size={18} color={palette.ink} />
                    </Pressable>
                    <Text style={styles.stockNumber}>{delta >= 0 ? `+${delta}` : delta}</Text>
                    <Pressable onPress={() => setDelta((d) => d + 1)} style={styles.stepBtn}>
                      <Ionicons name="add" size={18} color={palette.ink} />
                    </Pressable>
                  </View>

                  <OptionPickerModal
                    label="Motivo del ajuste"
                    value={reason}
                    options={ADJUST_REASONS}
                    onSelect={setReason}
                  />

                  <ActionButton
                    label={`Guardar ajuste (${reason})`}
                    loading={saving}
                    onPress={async () => {
                      const next = Math.max(0, adjustTarget.stock + delta);
                      await updateVariantStock(adjustTarget, next);
                      setAdjustTarget(null);
                    }}
                  />

                  <ActionButton
                    label="Editar publicación y oferta"
                    variant="outline"
                    onPress={() => {
                      const id = adjustTarget.product.id;
                      setAdjustTarget(null);
                      router.push({
                        pathname: '/vendedor/publicar-producto' as never,
                        params: { editar: id },
                      } as never);
                    }}
                  />

                  {adjustTarget.offerPrice ? (
                    <ActionButton
                      label="Quitar oferta temporal"
                      variant="danger"
                      onPress={() => removeOffer(adjustTarget)}
                    />
                  ) : null}
                </>
              )}
            </View>
          </View>
        </Modal>
      </StateGate>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  lowToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTop: {
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: palette.primarySoft,
  },
  thumbFallback: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.ink,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: palette.background,
    alignSelf: 'flex-start',
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  stockNumber: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: palette.ink,
  },
  projectionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bigNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.ink,
  },
});
