import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveImageUri } from './api';

export const palette = {
  primary: '#6030FF',
  primarySoft: '#F0EAFF',
  ink: '#111A3B',
  muted: '#76819A',
  background: '#FAF9FF',
  surface: '#FFFFFF',
  border: '#E7E8F1',
  success: '#168466',
  successSoft: '#E2F6EE',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#C33852',
  dangerSoft: '#FFE4EA',
};

export function ScreenShell({
  title,
  subtitle,
  back = true,
  right,
  refreshing = false,
  onRefresh,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {back && (
            <Pressable
              accessibilityLabel="Volver"
              onPress={() => router.back()}
              style={styles.iconBtn}
            >
              <Ionicons name="arrow-back" size={20} color={palette.ink} />
            </Pressable>
          )}
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.headerSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right ? <View>{right}</View> : null}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.primary}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Badge({
  label,
  tone = 'primary',
}: {
  label: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const colors = {
    primary: { bg: palette.primarySoft, fg: palette.primary },
    success: { bg: palette.successSoft, fg: palette.success },
    warning: { bg: palette.warningSoft, fg: palette.warning },
    danger: { bg: palette.dangerSoft, fg: palette.danger },
    neutral: { bg: '#EEF0F6', fg: '#434E68' },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'primary',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'primary' | 'warning' | 'success';
}) {
  const accent =
    tone === 'warning'
      ? palette.warning
      : tone === 'success'
        ? palette.success
        : palette.primary;
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
      {hint ? (
        <Text style={styles.statHint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </Card>
  );
}

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;
  const bg =
    variant === 'primary'
      ? palette.primary
      : variant === 'danger'
        ? palette.danger
        : variant === 'outline'
          ? palette.surface
          : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger' ? '#FFFFFF' : palette.primary;
  const border = variant === 'outline' ? palette.primary : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : icon ? (
        <Ionicons name={icon} size={17} color={fg} />
      ) : null}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  multiline = false,
  keyboardType = 'default',
  editable = true,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        editable={editable}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          !editable && styles.inputDisabled,
          error ? styles.inputError : null,
        ]}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.searchWrap}>
      <Ionicons name="search-outline" size={18} color={palette.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        style={styles.searchInput}
      />
      {value ? (
        <Pressable accessibilityLabel="Limpiar búsqueda" onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={palette.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function FilterChips({
  options,
  selected,
  onSelect,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function OptionPickerModal({
  label,
  value,
  options,
  placeholder = 'Seleccionar...',
  error,
  onSelect,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  error?: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = options.find((item) => item.value === value)?.label ?? value;
  const visible = options.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        style={[styles.selectBtn, error ? styles.inputError : null]}
      >
        <Text style={[styles.selectText, !current && { color: palette.muted }]} numberOfLines={1}>
          {current || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={palette.muted} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <SectionTitle
              title={label}
              right={
                <Pressable onPress={() => setOpen(false)}>
                  <Ionicons name="close" size={22} color={palette.ink} />
                </Pressable>
              }
            />
            {options.length > 6 && (
              <SearchBar value={query} onChangeText={setQuery} placeholder="Filtrar opciones..." />
            )}
            <ScrollView style={{ maxHeight: 340, marginTop: 8 }}>
              {visible.map((item) => {
                const active = item.value === value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      onSelect(item.value);
                      setOpen(false);
                    }}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active && { color: palette.primary, fontWeight: '700' },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={18} color={palette.primary} /> : null}
                  </Pressable>
                );
              })}
              {!visible.length && (
                <Text style={styles.emptyText}>No hay opciones que coincidan.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function MultiPickerModal({
  label,
  selected,
  options,
  placeholder = 'Seleccionar...',
  max,
  error,
  onChange,
}: {
  label: string;
  selected: string[];
  options: { label: string; value: string }[];
  placeholder?: string;
  max?: number;
  error?: string;
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    if (max && selected.length >= max) {
      Alert.alert('Límite alcanzado', `Puedes seleccionar hasta ${max} elementos.`);
      return;
    }
    onChange([...selected, value]);
  };

  const visible = options.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        style={[styles.selectBtn, error ? styles.inputError : null]}
      >
        <Text
          style={[styles.selectText, !selected.length && { color: palette.muted }]}
          numberOfLines={1}
        >
          {selected.length ? `${selected.length} seleccionados` : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={palette.muted} />
      </Pressable>
      {selected.length > 0 && (
        <View style={styles.tagWrap}>
          {selected.map((val) => {
            const labelText = options.find((opt) => opt.value === val)?.label ?? val;
            return (
              <Pressable key={val} onPress={() => toggle(val)} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{labelText}</Text>
                <Ionicons name="close" size={14} color={palette.primary} />
              </Pressable>
            );
          })}
        </View>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <SectionTitle
              title={label}
              right={
                <Pressable onPress={() => setOpen(false)}>
                  <Ionicons name="close" size={22} color={palette.ink} />
                </Pressable>
              }
            />
            {options.length > 6 && (
              <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar..." />
            )}
            <ScrollView style={{ maxHeight: 340, marginTop: 8 }}>
              {visible.map((item) => {
                const active = selected.includes(item.value);
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => toggle(item.value)}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active && { color: palette.primary, fontWeight: '700' },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Ionicons
                      name={active ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={active ? palette.primary : palette.muted}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
            <ActionButton label="Listo" onPress={() => setOpen(false)} style={{ marginTop: 12 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function ImageGalleryPicker({
  images,
  onChange,
  max = 5,
  error,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  max?: number;
  error?: string;
}) {
  const [urlInput, setUrlInput] = useState('');
  const [busy, setBusy] = useState(false);

  const photos = images.filter((src) => src && !src.includes('/catalog/placeholder.svg'));

  const pickFromLibrary = async () => {
    if (busy || photos.length >= max) {
      if (photos.length >= max) {
        Alert.alert('Límite de fotos', `Puedes agregar hasta ${max} imágenes.`);
      }
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        'Autoriza el acceso a la galería para seleccionar fotos de tu publicación.',
      );
      return;
    }

    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: Math.max(1, max - photos.length),
        quality: 0.72,
        base64: true,
      });

      if (result.canceled || !result.assets.length) return;
      const next = [...photos];
      for (const asset of result.assets) {
        if (next.length >= max) break;
        if (asset.base64) {
          const mime = asset.mimeType || 'image/jpeg';
          next.push(`data:${mime};base64,${asset.base64}`);
        } else if (asset.uri) {
          next.push(asset.uri);
        }
      }
      onChange(next);
    } finally {
      setBusy(false);
    }
  };

  const addByUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      Alert.alert('URL inválida', 'Ingresa una URL que comience con http:// o https://.');
      return;
    }
    if (photos.length >= max) {
      Alert.alert('Límite de fotos', `Puedes agregar hasta ${max} imágenes.`);
      return;
    }
    onChange([...photos, trimmed]);
    setUrlInput('');
  };

  return (
    <Card style={error ? { borderColor: palette.danger } : undefined}>
      <SectionTitle
        title="Fotos de la publicación"
        subtitle={`Máximo ${max} imágenes · La primera será la principal`}
        right={<Badge label={`${photos.length}/${max}`} />}
      />

      {photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          {photos.map((src, index) => {
            const resolved = resolveImageUri(src) ?? src;
            return (
              <View
                key={`${src.slice(0, 32)}-${index}`}
                style={[styles.photoCard, index === 0 && styles.photoCardPrimary]}
              >
                <Image source={{ uri: resolved }} style={styles.photoPreview} resizeMode="cover" />
                <View style={styles.photoActions}>
                  {index === 0 ? (
                    <Text style={styles.photoPrimaryText}>Principal</Text>
                  ) : (
                    <Pressable
                      onPress={() =>
                        onChange([photos[index], ...photos.filter((_, idx) => idx !== index)])
                      }
                    >
                      <Text style={styles.photoMakePrimary}>Hacer principal</Text>
                    </Pressable>
                  )}
                  <Pressable
                    accessibilityLabel={`Quitar foto ${index + 1}`}
                    onPress={() => onChange(photos.filter((_, idx) => idx !== index))}
                  >
                    <Ionicons name="trash-outline" size={16} color={palette.danger} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={[styles.hintText, { marginVertical: 8 }]}>
          Aún no hay imágenes seleccionadas. Agrega desde tu galería o por URL.
        </Text>
      )}

      <ActionButton
        label={busy ? 'Cargando fotos...' : 'Elegir desde galería'}
        icon="images-outline"
        variant="outline"
        loading={busy}
        onPress={pickFromLibrary}
      />

      <View style={styles.urlRow}>
        <TextInput
          value={urlInput}
          onChangeText={setUrlInput}
          placeholder="O pega URL de imagen (https://...)"
          placeholderTextColor={palette.muted}
          autoCapitalize="none"
          style={[styles.input, { flex: 1 }]}
        />
        <ActionButton label="Agregar" onPress={addByUrl} style={{ paddingHorizontal: 14 }} />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Card>
  );
}

export function StateGate({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <Card style={styles.centerCard}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.stateTitle}>Cargando datos desde Shopping...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.centerCard}>
        <Ionicons name="alert-circle-outline" size={34} color={palette.danger} />
        <Text style={styles.stateTitle}>{error}</Text>
        <View style={styles.rowGap}>
          <ActionButton label="Reintentar" icon="refresh" onPress={onRetry} />
          <ActionButton
            label="Ir a acceso y ajustes"
            variant="outline"
            icon="person-circle-outline"
            onPress={() => router.push('/vendedor' as never)}
          />
        </View>
      </Card>
    );
  }

  return <>{children}</>;
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.ink,
  },
  headerSubtitle: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.ink,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: palette.muted,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statHint: {
    fontSize: 11,
    color: palette.muted,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldWrap: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
  },
  input: {
    backgroundColor: '#FBFBFF',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: palette.ink,
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: '#F1F2F7',
    color: palette.muted,
  },
  inputError: {
    borderColor: palette.danger,
  },
  errorText: {
    fontSize: 12,
    color: palette.danger,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    color: palette.muted,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: palette.ink,
    paddingVertical: 2,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBFBFF',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    color: palette.ink,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 26, 59, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  optionRowActive: {
    backgroundColor: palette.primarySoft,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
    color: palette.ink,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: palette.muted,
    paddingVertical: 20,
  },
  photoCard: {
    width: 116,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    backgroundColor: palette.background,
  },
  photoCardPrimary: {
    borderColor: palette.primary,
    borderWidth: 1.5,
  },
  photoPreview: {
    width: '100%',
    height: 88,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  photoPrimaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.primary,
  },
  photoMakePrimary: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.ink,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  centerCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
    textAlign: 'center',
  },
  rowGap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
});
