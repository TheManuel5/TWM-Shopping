import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { saveCatalogItem } from './api';
import type { CatalogItem, ProductVariant } from './types';
import {
  ActionButton,
  Card,
  Field,
  ImageGalleryPicker,
  MultiPickerModal,
  OptionPickerModal,
  palette,
  ScreenShell,
  SectionTitle,
  StateGate,
  styles as uiStyles,
} from './ui';
import { useSellerState } from './useSellerState';
import { dateKey, flattenCategoryNamesByType, validateOffer, validateVariants } from './validation';

const BRANDS = [
  { label: 'URBAN', value: 'URBAN' },
  { label: 'PUMA', value: 'PUMA' },
  { label: 'NEW BALANCE', value: 'NEW BALANCE' },
  { label: 'Otra', value: 'Otra' },
];

const MATERIALS = [
  { label: 'Textil', value: 'Textil' },
  { label: 'Cuero', value: 'Cuero' },
  { label: 'Sintético', value: 'Sintético' },
  { label: 'Metal', value: 'Metal' },
  { label: 'Madera', value: 'Madera' },
];

const COLOR_OPTIONS = [
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Violeta', hex: '#6030FF' },
  { name: 'Negro', hex: '#111827' },
  { name: 'Gris', hex: '#6B7280' },
];

function initialImages(editing?: CatalogItem): string[] {
  if (!editing) return [];
  if (editing.imagenes?.length) return editing.imagenes;
  if (editing.imagen && !editing.imagen.includes('/catalog/placeholder.svg')) {
    return [editing.imagen];
  }
  return [];
}

function initialVariants(editing?: CatalogItem): ProductVariant[] {
  if (!editing) {
    return [
      {
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        size: 'Única',
        color: 'Negro',
        price: 0,
        stock: 1,
      },
    ];
  }
  if (editing.variantes?.length) {
    return editing.variantes.map((variant) => ({
      ...variant,
      price: Number(variant.price || editing.precio || 0),
      stock: Number(variant.stock || 0),
    }));
  }
  return [
    {
      sku: `SKU-${editing.dbId || editing.id}`,
      size: editing.tamano || 'Única',
      color: editing.color || 'Negro',
      price: Number(editing.precio || 0),
      stock: Number(editing.stock || 0),
    },
  ];
}

function ProductForm({
  editing,
  ownerRut,
  revision,
  categoryOptions,
  relatedOptions,
}: {
  editing?: CatalogItem;
  ownerRut: string;
  revision: number;
  categoryOptions: { label: string; value: string }[];
  relatedOptions: { label: string; value: string }[];
}) {
  const [name, setName] = useState(editing?.nombre ?? '');
  const [category, setCategory] = useState(editing?.categoria ?? '');
  const [brand, setBrand] = useState(editing?.marca || 'URBAN');
  const [material, setMaterial] = useState(editing?.material || 'Textil');
  const [sizeBase, setSizeBase] = useState(editing?.tamano ?? editing?.talla ?? '');
  const [weight, setWeight] = useState(String(editing?.peso || 500));
  const [selectedColor, setSelectedColor] = useState(editing?.color || 'Negro');
  const [description, setDescription] = useState(editing?.descripcion ?? '');
  const [images, setImages] = useState<string[]>(() => initialImages(editing));
  const [related, setRelated] = useState<string[]>(editing?.relacionados ?? []);

  const [regularPrice, setRegularPrice] = useState(
    editing?.precio !== undefined ? String(editing.precio) : '',
  );
  const [hasOffer, setHasOffer] = useState(Boolean(editing?.oferta));
  const [offerPrice, setOfferPrice] = useState(
    editing?.oferta ? String(editing.oferta.precio) : '',
  );
  const [offerStart, setOfferStart] = useState(editing?.oferta?.inicio || dateKey());
  const [offerEnd, setOfferEnd] = useState(editing?.oferta?.fin || '');

  const [widthCm, setWidthCm] = useState(String(editing?.dimensiones?.ancho || 20));
  const [heightCm, setHeightCm] = useState(String(editing?.dimensiones?.alto || 15));
  const [depthCm, setDepthCm] = useState(String(editing?.dimensiones?.fondo || 10));
  const [variants, setVariants] = useState<ProductVariant[]>(() => initialVariants(editing));

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number,
  ) => {
    setVariants((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: `SKU-${Date.now().toString().slice(-6)}-${prev.length + 1}`,
        size: sizeBase || 'M',
        color: selectedColor || 'Negro',
        price: Number(regularPrice) || 0,
        stock: 0,
      },
    ]);
  };

  const handleSave = async (draft: boolean) => {
    if (saving) return;
    setFormError('');

    if (!category) {
      setFormError('Selecciona una categoría de la base de datos.');
      return;
    }
    if (name.trim().length < 3) {
      setFormError('Ingresa un nombre de al menos tres caracteres.');
      return;
    }

    const numericPrice = Number(regularPrice);
    const numericWeight = Number(weight);
    const numericW = Number(widthCm);
    const numericH = Number(heightCm);
    const numericD = Number(depthCm);

    if (!draft) {
      if (!material || !sizeBase.trim() || !description.trim() || !images.length) {
        setFormError('Completa material, tamaño, descripción y al menos una imagen.');
        return;
      }
      if (
        ![numericPrice, numericWeight, numericW, numericH, numericD].every(
          (val) => Number.isFinite(val) && val > 0,
        )
      ) {
        setFormError('Precio regular, peso y dimensiones deben ser mayores que cero.');
        return;
      }
      const variantError = validateVariants(variants);
      if (variantError) {
        setFormError(variantError);
        return;
      }
      if (hasOffer) {
        const offerError = validateOffer(
          numericPrice,
          Number(offerPrice),
          offerStart,
          offerEnd,
        );
        if (offerError) {
          setFormError(offerError);
          return;
        }
      }
    }

    const normalizedVariants = variants.map((variant) => ({
      ...variant,
      sku: variant.sku.trim() || `SKU-${Date.now()}`,
      size: variant.size.trim() || sizeBase.trim() || 'Única',
      color: variant.color.trim() || selectedColor || 'Negro',
      price: Math.max(1, Number(variant.price) || numericPrice || 1),
      stock: Math.max(0, Math.floor(Number(variant.stock) || 0)),
    }));

    const payload: CatalogItem = {
      ...editing,
      id: editing?.id || `P-NEW-${Date.now()}`,
      ownerRut: editing?.ownerRut || ownerRut,
      nombre: name.trim(),
      tipo: 'Producto',
      categoria: category,
      marca: brand,
      material,
      peso: Math.max(1, numericWeight || 500),
      tamano: sizeBase.trim(),
      talla: normalizedVariants[0]?.size || sizeBase.trim(),
      color: selectedColor,
      descripcion: description.trim(),
      precio: Math.max(0, numericPrice || normalizedVariants[0]?.price || 0),
      stock: normalizedVariants.reduce((sum, v) => sum + v.stock, 0),
      variantes: normalizedVariants,
      imagen: images[0] || '/catalog/placeholder.svg',
      imagenes: images,
      relacionados: related,
      dimensiones: {
        ancho: Math.max(1, numericW || 10),
        alto: Math.max(1, numericH || 10),
        fondo: Math.max(1, numericD || 10),
      },
      estado: draft ? 'Borrador' : 'Publicado',
      oferta: hasOffer
        ? {
            precio: Number(offerPrice),
            inicio: offerStart,
            fin: offerEnd,
          }
        : null,
    };

    setSaving(true);
    try {
      await saveCatalogItem(revision, payload);
      Alert.alert(
        draft ? 'Borrador guardado' : 'Producto guardado',
        draft
          ? 'Tu producto quedó guardado como borrador.'
          : 'La publicación fue guardada en Shopping.',
        [{ text: 'OK', onPress: () => router.replace('/vendedor/mis-productos' as never) }],
      );
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : 'No se pudo guardar el producto.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {!editing && (
        <View style={styles.typeSwitchRow}>
          <ActionButton label="Producto" onPress={() => {}} style={{ flex: 1 }} />
          <ActionButton
            label="Servicio"
            variant="outline"
            onPress={() => router.replace('/vendedor/publicar-servicio' as never)}
            style={{ flex: 1 }}
          />
        </View>
      )}

      <Card>
        <SectionTitle title="1. Información del producto" />
        <Field
          label="Nombre del producto *"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Zapatilla Urbana Runner"
        />
        <OptionPickerModal
          label="Categoría *"
          value={category}
          options={categoryOptions}
          placeholder="Selecciona una categoría"
          onSelect={setCategory}
        />
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <OptionPickerModal
              label="Marca"
              value={brand}
              options={BRANDS}
              onSelect={setBrand}
            />
          </View>
          <View style={{ flex: 1 }}>
            <OptionPickerModal
              label="Material principal *"
              value={material}
              options={MATERIALS}
              onSelect={setMaterial}
            />
          </View>
        </View>
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Field
              label="Tamaño / Rango *"
              value={sizeBase}
              onChangeText={setSizeBase}
              placeholder="Ej: 38-43 o M"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Peso (g) *"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={uiStyles.fieldLabel}>Color principal *</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((color) => {
            const active = selectedColor === color.name;
            return (
              <Pressable
                key={color.name}
                onPress={() => setSelectedColor(color.name)}
                style={[styles.colorPill, active && styles.colorPillActive]}
              >
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: color.hex, borderColor: palette.border },
                  ]}
                />
                <Text style={styles.colorText}>{color.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label="Descripción *"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Describe materiales, uso, garantía y detalles relevantes..."
        />
      </Card>

      <ImageGalleryPicker images={images} onChange={setImages} />

      <Card>
        <SectionTitle
          title="2. Variantes (SKU, precio y stock)"
          subtitle="Cada variante mantiene su propio SKU, precio y stock"
          right={
            <ActionButton
              label="Añadir"
              icon="add"
              variant="outline"
              onPress={addVariant}
              style={{ paddingVertical: 6, paddingHorizontal: 10 }}
            />
          }
        />

        {variants.map((variant, idx) => (
          <View key={`var-${idx}`} style={styles.variantBox}>
            <View style={styles.variantHeader}>
              <Text style={styles.variantTitle}>Variante #{idx + 1}</Text>
              {variants.length > 1 && (
                <Pressable
                  accessibilityLabel={`Eliminar variante ${idx + 1}`}
                  onPress={() =>
                    setVariants((prev) => prev.filter((_, itemIdx) => itemIdx !== idx))
                  }
                >
                  <Ionicons name="trash-outline" size={18} color={palette.danger} />
                </Pressable>
              )}
            </View>
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field
                  label="SKU *"
                  value={variant.sku}
                  onChangeText={(val) => updateVariant(idx, 'sku', val)}
                  autoCapitalize="characters"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Talla *"
                  value={variant.size}
                  onChangeText={(val) => updateVariant(idx, 'size', val)}
                />
              </View>
            </View>
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Color *"
                  value={variant.color}
                  onChangeText={(val) => updateVariant(idx, 'color', val)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Precio (CLP) *"
                  value={String(variant.price || '')}
                  onChangeText={(val) =>
                    updateVariant(idx, 'price', Math.max(0, Number(val) || 0))
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 0.8 }}>
                <Field
                  label="Stock *"
                  value={String(variant.stock)}
                  onChangeText={(val) =>
                    updateVariant(idx, 'stock', Math.max(0, Number(val) || 0))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <SectionTitle title="3. Precio, oferta y envío" />
        <Field
          label="Precio regular (CLP) *"
          value={regularPrice}
          onChangeText={setRegularPrice}
          keyboardType="numeric"
          placeholder="Ej: 29990"
        />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={uiStyles.fieldLabel}>Oferta temporal activa</Text>
            <Text style={uiStyles.hintText}>Solo una oferta vigente por publicación</Text>
          </View>
          <Switch
            value={hasOffer}
            onValueChange={setHasOffer}
            trackColor={{ false: palette.border, true: palette.primarySoft }}
            thumbColor={hasOffer ? palette.primary : '#F4F4F6'}
          />
        </View>

        {hasOffer && (
          <View style={{ gap: 8 }}>
            <Field
              label="Precio de oferta (CLP) *"
              value={offerPrice}
              onChangeText={setOfferPrice}
              keyboardType="numeric"
            />
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Fecha inicio *"
                  value={offerStart}
                  onChangeText={setOfferStart}
                  placeholder="AAAA-MM-DD"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Fecha término *"
                  value={offerEnd}
                  onChangeText={setOfferEnd}
                  placeholder="AAAA-MM-DD"
                />
              </View>
            </View>
          </View>
        )}

        <MultiPickerModal
          label="Productos relacionados (máx. 5)"
          selected={related}
          options={relatedOptions}
          max={5}
          placeholder="Seleccionar productos relacionados"
          onChange={setRelated}
        />

        <Text style={uiStyles.fieldLabel}>Dimensiones del paquete (cm) *</Text>
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Field
              label="Ancho"
              value={widthCm}
              onChangeText={setWidthCm}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Alto"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Fondo"
              value={depthCm}
              onChangeText={setDepthCm}
              keyboardType="numeric"
            />
          </View>
        </View>
      </Card>

      {formError ? <Text style={uiStyles.errorText}>{formError}</Text> : null}

      <View style={styles.submitRow}>
        <ActionButton
          label="Guardar borrador"
          variant="outline"
          loading={saving}
          onPress={() => handleSave(true)}
          style={{ flex: 1 }}
        />
        <ActionButton
          label={editing ? 'Guardar cambios' : 'Publicar producto'}
          loading={saving}
          onPress={() => handleSave(false)}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}

export function PublishProductScreen() {
  const { editar } = useLocalSearchParams<{ editar?: string }>();
  const { profile, collections, revision, loading, refreshing, error, reload, refresh } =
    useSellerState({ requireSeller: true });

  const catalog = useMemo(() => collections.catalog ?? [], [collections.catalog]);
  const editing = useMemo(
    () => (editar ? catalog.find((item) => String(item.id) === String(editar)) : undefined),
    [catalog, editar],
  );

  const categoryOptions = useMemo(
    () =>
      flattenCategoryNamesByType(collections.categories, 'Producto').map((name) => ({
        label: name,
        value: name,
      })),
    [collections.categories],
  );

  const relatedOptions = useMemo(
    () =>
      catalog
        .filter((item) => item.tipo !== 'Servicio' && item.id !== editing?.id)
        .map((item) => ({ label: item.nombre, value: item.id })),
    [catalog, editing?.id],
  );

  return (
    <ScreenShell
      title={editing ? 'Editar producto' : 'Publicar producto'}
      subtitle="Completa atributos, variantes, imágenes y precio"
      refreshing={refreshing}
      onRefresh={refresh}
    >
      <StateGate loading={loading} error={error} onRetry={reload}>
        <ProductForm
          key={editing?.id ?? 'new'}
          editing={editing}
          ownerRut={profile?.rut ?? ''}
          revision={revision}
          categoryOptions={categoryOptions}
          relatedOptions={relatedOptions}
        />
      </StateGate>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  typeSwitchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  colorPillActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  colorText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
  },
  variantBox: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 10,
    backgroundColor: palette.background,
    gap: 8,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.ink,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.primarySoft,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  submitRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
