import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { resolveImageUri, saveCatalogItem } from './api';
import type { CatalogItem } from './types';
import {
  ActionButton,
  Badge,
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
import {
  dateKey,
  flattenCategoryNamesByType,
  formatCLP,
  validateOffer,
} from './validation';

const DURATIONS = [
  { label: '60 minutos', value: '60 minutos' },
  { label: '90 minutos', value: '90 minutos' },
  { label: '120 minutos', value: '120 minutos' },
];

const AGE_OPTIONS = [
  { label: 'Sin restricción', value: 'Sin restricción' },
  { label: '18 años (Mayoría legal)', value: '18 años' },
];

const MODALITIES = [
  { label: 'En local', icon: 'storefront-outline' as const },
  { label: 'A domicilio', icon: 'home-outline' as const },
  { label: 'Remoto', icon: 'desktop-outline' as const },
];

function normalizeDuration(raw: string | undefined): string {
  if (!raw) return '90 minutos';
  if (raw.includes('60') || raw.startsWith('01:00')) return '60 minutos';
  if (raw.includes('120') || raw.startsWith('02:00')) return '120 minutos';
  return '90 minutos';
}

function initialServiceImages(editing?: CatalogItem): string[] {
  if (!editing) return [];
  if (editing.imagenes?.length) return editing.imagenes;
  if (editing.imagen && !editing.imagen.includes('/catalog/placeholder.svg')) {
    return [editing.imagen];
  }
  return [];
}

function ServiceForm({
  editing,
  ownerRut,
  revision,
  categoryOptions,
  communeOptions,
}: {
  editing?: CatalogItem;
  ownerRut: string;
  revision: number;
  categoryOptions: { label: string; value: string }[];
  communeOptions: { label: string; value: string }[];
}) {
  const [serviceName, setServiceName] = useState(editing?.nombre ?? '');
  const [category, setCategory] = useState(editing?.categoria ?? '');
  const [images, setImages] = useState<string[]>(() => initialServiceImages(editing));
  const [duration, setDuration] = useState(() => normalizeDuration(editing?.duracion));
  const [ageRestriction, setAgeRestriction] = useState(
    editing && Number(editing.edad) < 18 ? 'Sin restricción' : '18 años',
  );
  const [modality, setModality] = useState(editing?.modalidad || 'En local');
  const [comunas, setComunas] = useState<string[]>(editing?.comunas ?? []);
  const [description, setDescription] = useState(editing?.descripcion ?? '');
  const [officialPrice, setOfficialPrice] = useState(
    editing?.precio !== undefined ? String(editing.precio) : '',
  );
  const [offerActive, setOfferActive] = useState(Boolean(editing?.oferta));
  const [offerPrice, setOfferPrice] = useState(
    editing?.oferta ? String(editing.oferta.precio) : '',
  );
  const [offerFrom, setOfferFrom] = useState(editing?.oferta?.inicio || dateKey());
  const [offerTo, setOfferTo] = useState(editing?.oferta?.fin || '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSave = async (draft: boolean) => {
    if (saving) return;
    setFormError('');

    if (serviceName.trim().length < 3) {
      setFormError('Ingresa un nombre de al menos tres caracteres.');
      return;
    }
    if (!category) {
      setFormError('Selecciona una categoría de la base de datos.');
      return;
    }

    const numericPrice = Number(officialPrice);
    if (!draft) {
      if (
        !description.trim() ||
        !duration ||
        !comunas.length ||
        !images.length ||
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
      ) {
        setFormError(
          'Completa descripción, duración, comunas de cobertura, imagen y precio positivo.',
        );
        return;
      }
      if (offerActive) {
        const offerError = validateOffer(numericPrice, Number(offerPrice), offerFrom, offerTo);
        if (offerError) {
          setFormError(offerError);
          return;
        }
      }
    }

    const payload: CatalogItem = {
      ...editing,
      id: editing?.id || `S-NEW-${Date.now()}`,
      ownerRut: editing?.ownerRut || ownerRut,
      nombre: serviceName.trim(),
      descripcion: description.trim(),
      categoria: category,
      tipo: 'Servicio',
      duracion: duration,
      edad: ageRestriction === 'Sin restricción' ? 0 : 18,
      modalidad: modality,
      comunas,
      precio: Math.max(0, numericPrice || 0),
      stock: 100,
      imagen: images[0] || '/catalog/placeholder.svg',
      imagenes: images,
      estado: draft ? 'Borrador' : 'Publicado',
      oferta: offerActive
        ? {
            precio: Number(offerPrice),
            inicio: offerFrom,
            fin: offerTo,
          }
        : null,
    };

    setSaving(true);
    try {
      await saveCatalogItem(revision, payload);
      Alert.alert(
        draft ? 'Borrador guardado' : 'Servicio guardado',
        draft
          ? 'Tu servicio quedó guardado como borrador.'
          : 'El servicio quedó publicado en Shopping.',
        [{ text: 'OK', onPress: () => router.replace('/vendedor/mis-productos' as never) }],
      );
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : 'No se pudo guardar el servicio.',
      );
    } finally {
      setSaving(false);
    }
  };

  const previewUri = resolveImageUri(images[0]) ?? images[0];
  const displayPrice =
    offerActive && Number(offerPrice) > 0 ? Number(offerPrice) : Number(officialPrice || 0);

  return (
    <>
      {!editing && (
        <View style={styles.typeSwitchRow}>
          <ActionButton
            label="Producto"
            variant="outline"
            onPress={() => router.replace('/vendedor/publicar-producto' as never)}
            style={{ flex: 1 }}
          />
          <ActionButton label="Servicio" onPress={() => {}} style={{ flex: 1 }} />
        </View>
      )}

      <Card>
        <SectionTitle title="Información principal" />
        <Field
          label="Nombre del servicio *"
          value={serviceName}
          onChangeText={setServiceName}
          placeholder="Ej: Mantención de notebook a domicilio"
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
              label="Duración *"
              value={duration}
              options={DURATIONS}
              onSelect={setDuration}
            />
          </View>
          <View style={{ flex: 1 }}>
            <OptionPickerModal
              label="Restricción de edad *"
              value={ageRestriction}
              options={AGE_OPTIONS}
              onSelect={setAgeRestriction}
            />
          </View>
        </View>

        <Text style={uiStyles.fieldLabel}>Modalidad de atención *</Text>
        <View style={styles.modalityRow}>
          {MODALITIES.map((item) => {
            const active = modality === item.label;
            return (
              <Pressable
                key={item.label}
                onPress={() => setModality(item.label)}
                style={[styles.modalityBtn, active && styles.modalityBtnActive]}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={active ? '#FFFFFF' : palette.primary}
                />
                <Text style={[styles.modalityText, active && { color: '#FFFFFF' }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <MultiPickerModal
          label="Comunas de cobertura *"
          selected={comunas}
          options={communeOptions}
          placeholder="Seleccionar comunas"
          onChange={setComunas}
        />

        <Field
          label="Descripción del servicio *"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Explica qué incluye el servicio, requisitos y horarios..."
        />
      </Card>

      <ImageGalleryPicker images={images} onChange={setImages} />

      <Card>
        <SectionTitle title="Precio y disponibilidad" />
        <Field
          label="Precio oficial (CLP) *"
          value={officialPrice}
          onChangeText={setOfficialPrice}
          keyboardType="numeric"
          placeholder="Ej: 24990"
        />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={uiStyles.fieldLabel}>Activar oferta temporal</Text>
            <Text style={uiStyles.hintText}>Muestra precio rebajado durante un rango</Text>
          </View>
          <Switch
            value={offerActive}
            onValueChange={setOfferActive}
            trackColor={{ false: palette.border, true: palette.primarySoft }}
            thumbColor={offerActive ? palette.primary : '#F4F4F6'}
          />
        </View>

        {offerActive && (
          <View style={{ gap: 8 }}>
            <Field
              label="Precio en oferta (CLP) *"
              value={offerPrice}
              onChangeText={setOfferPrice}
              keyboardType="numeric"
            />
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Desde *"
                  value={offerFrom}
                  onChangeText={setOfferFrom}
                  placeholder="AAAA-MM-DD"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Hasta *"
                  value={offerTo}
                  onChangeText={setOfferTo}
                  placeholder="AAAA-MM-DD"
                />
              </View>
            </View>
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle title="Vista previa pública" />
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Ionicons name="image-outline" size={32} color={palette.muted} />
            <Text style={uiStyles.hintText}>Sin imagen seleccionada</Text>
          </View>
        )}
        <Text style={styles.previewTitle}>{serviceName || 'Nombre del servicio'}</Text>
        <View style={styles.previewPriceRow}>
          <Text style={styles.previewPrice}>{formatCLP(displayPrice)}</Text>
          {offerActive && Number(officialPrice) > 0 && (
            <>
              <Text style={styles.previewStrike}>{formatCLP(officialPrice)}</Text>
              <Badge label="Oferta" tone="danger" />
            </>
          )}
        </View>
        <Text style={uiStyles.hintText}>Duración: {duration}</Text>
        <Text style={uiStyles.hintText}>Edad: {ageRestriction}</Text>
        <Text style={uiStyles.hintText}>Modalidad: {modality}</Text>
        <Text style={uiStyles.hintText}>
          Cobertura: {comunas.length ? comunas.join(', ') : 'Sin comunas seleccionadas'}
        </Text>
      </Card>

      {formError ? <Text style={uiStyles.errorText}>{formError}</Text> : null}

      <View style={styles.typeSwitchRow}>
        <ActionButton
          label="Guardar borrador"
          variant="outline"
          loading={saving}
          onPress={() => handleSave(true)}
          style={{ flex: 1 }}
        />
        <ActionButton
          label={editing ? 'Guardar cambios' : 'Publicar servicio'}
          loading={saving}
          onPress={() => handleSave(false)}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}

export function PublishServiceScreen() {
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
      flattenCategoryNamesByType(collections.categories, 'Servicio').map((name) => ({
        label: name,
        value: name,
      })),
    [collections.categories],
  );

  const communeOptions = useMemo(
    () =>
      (collections.geography?.communes ?? []).map((commune) => ({
        label: commune.nombre,
        value: commune.nombre,
      })),
    [collections.geography?.communes],
  );

  return (
    <ScreenShell
      title={editing ? 'Editar servicio' : 'Publicar servicio'}
      subtitle="Configura modalidad, cobertura por comunas y precio"
      refreshing={refreshing}
      onRefresh={refresh}
    >
      <StateGate loading={loading} error={error} onRetry={reload}>
        <ServiceForm
          key={editing?.id ?? 'new'}
          editing={editing}
          ownerRut={profile?.rut ?? ''}
          revision={revision}
          categoryOptions={categoryOptions}
          communeOptions={communeOptions}
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
  modalityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: palette.surface,
  },
  modalityBtnActive: {
    backgroundColor: palette.primary,
  },
  modalityText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
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
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  previewPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.ink,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.primary,
  },
  previewStrike: {
    fontSize: 13,
    color: palette.muted,
    textDecorationLine: 'line-through',
  },
});
