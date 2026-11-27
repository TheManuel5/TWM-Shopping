import type { ComponentProps } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type TextStyle,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';

export const purchaseTextScale = {
  pageTitle: 20,
  sectionTitle: 15,
  subtitle: 13,
  body: 12,
  caption: 10,
} as const;

export function AppText({ children, style, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props} style={[styles.text, style]}>{children}</Text>;
}

export function PrimaryButton({
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

export function OutlineButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
      <AppText style={styles.outlineButtonText}>{label}</AppText>
    </Pressable>
  );
}

export function SectionTitle({
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

export function PriceRow({
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

export function Step({
  number,
  label,
  active = false,
}: {
  number: string;
  label: string;
  active?: boolean;
}) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, active && styles.stepNumberActive]}>
        <AppText style={[styles.stepNumberText, active && styles.stepNumberTextActive]}>
          {number}
        </AppText>
      </View>
      <AppText style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</AppText>
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name="favorite-border" size={27} color={purple} />
      </View>
      <AppText style={styles.emptyTitle}>{title}</AppText>
      <AppText style={styles.emptyDescription}>{description}</AppText>
    </View>
  );
}

export function DashboardStat({
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

export type ListFilterOption = {
  label: string;
  value: string;
  count: number;
};

export function PurchaseListFilters({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  selectedFilter,
  filters,
  onSelectFilter,
  wrapFilters = false,
}: {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  selectedFilter: string;
  filters: ListFilterOption[];
  onSelectFilter: (value: string) => void;
  wrapFilters?: boolean;
}) {
  const filterOptions = filters.map((filter) => {
    const selected = filter.value === selectedFilter;
    return (
      <Pressable
        key={filter.value}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onSelectFilter(filter.value)}
        style={[styles.listFilterChip, selected && styles.listFilterChipSelected]}>
        <AppText style={[styles.listFilterText, selected && styles.listFilterTextSelected]}>
          {filter.label} ({filter.count})
        </AppText>
      </Pressable>
    );
  });

  return (
    <View style={styles.listFilters}>
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={19} color={muted} />
        <TextInput
          accessibilityLabel={searchPlaceholder}
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder={searchPlaceholder}
          placeholderTextColor="#9696A5"
          returnKeyType="search"
          style={styles.searchInput}
        />
        {searchValue ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            onPress={() => onSearchChange('')}
            style={styles.clearSearch}>
            <MaterialIcons name="close" size={17} color={muted} />
          </Pressable>
        ) : null}
      </View>
      <AppText style={styles.filterHeading}>Filtrar por estado</AppText>
      {wrapFilters ? (
        <View style={styles.listFilterOptionsWrapped}>{filterOptions}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listFilterOptions}>
          {filterOptions}
        </ScrollView>
      )}
    </View>
  );
}

export function MenuRow({
  icon,
  label,
  detail,
  onPress,
  last = false,
}: {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  detail?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !last && styles.menuRowBorder,
        pressed && styles.pressed,
      ]}>
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

const styles = StyleSheet.create({
  text: { color: ink, fontSize: purchaseTextScale.body, fontFamily: 'System' },
  primaryButton: { minHeight: 48, borderRadius: 13, backgroundColor: purple, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: purchaseTextScale.subtitle },
  disabledButton: { opacity: 0.45 },
  outlineButton: { minHeight: 44, borderRadius: 13, borderWidth: 1, borderColor: '#D8D1F6', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  outlineButtonText: { color: purple, fontWeight: '600', fontSize: purchaseTextScale.subtitle },
  pressed: { opacity: 0.72 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3, marginBottom: 1 },
  sectionTitle: { fontSize: purchaseTextScale.sectionTitle, fontWeight: '700', color: ink },
  linkText: { fontSize: purchaseTextScale.body, color: purple, fontWeight: '600' },
  priceRow: { minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secondaryText: { color: muted, fontSize: purchaseTextScale.body, lineHeight: 18 },
  priceValue: { fontSize: purchaseTextScale.body, color: ink },
  priceBold: { color: ink, fontWeight: '700', fontSize: purchaseTextScale.sectionTitle },
  step: { alignItems: 'center', gap: 5 },
  stepNumber: { width: 25, height: 25, borderRadius: 13, borderWidth: 1, borderColor: '#D7D5E0', alignItems: 'center', justifyContent: 'center' },
  stepNumberActive: { backgroundColor: purple, borderColor: purple },
  stepNumberText: { fontSize: 11, color: muted },
  stepNumberTextActive: { color: '#FFFFFF', fontWeight: '700' },
  stepLabel: { fontSize: 10, color: muted },
  stepLabelActive: { color: purple, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 55, gap: 9 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFEAFF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: purchaseTextScale.sectionTitle, fontWeight: '700', textAlign: 'center', color: ink },
  emptyDescription: { color: muted, fontSize: purchaseTextScale.body, textAlign: 'center', lineHeight: 18 },
  dashboardStat: { flex: 1, minHeight: 74, justifyContent: 'center', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#EEEAF5', borderRadius: 13, backgroundColor: '#FFFFFF' },
  dashboardStatValue: { color: purple, fontSize: 18, fontWeight: '800' },
  dashboardStatLabel: { color: muted, fontSize: 10, textAlign: 'center' },
  listFilters: { gap: 10 },
  searchBox: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E8E5EF', borderRadius: 12, backgroundColor: '#FFFFFF' },
  searchInput: { flex: 1, height: 42, paddingVertical: 0, color: ink, fontSize: purchaseTextScale.body },
  clearSearch: { width: 26, height: 28, alignItems: 'center', justifyContent: 'center' },
  filterHeading: { color: muted, fontSize: 11, fontWeight: '600', marginBottom: -3 },
  listFilterOptions: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  listFilterOptionsWrapped: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  listFilterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0EEF6' },
  listFilterChipSelected: { backgroundColor: purple },
  listFilterText: { color: muted, fontSize: purchaseTextScale.body, fontWeight: '600' },
  listFilterTextSelected: { color: '#FFFFFF' },
  menuRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  menuRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0' },
  menuIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#F2EFFF', alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1, gap: 3 },
  menuLabel: { fontSize: purchaseTextScale.body, fontWeight: '600', color: ink },
  menuChevron: { color: '#A3A1B0', fontSize: 24 },
});
