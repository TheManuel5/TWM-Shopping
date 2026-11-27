import { Children } from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { useFonts } from 'expo-font';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';

const purple = '#6338F5';
const muted = '#8B8998';

export default function AppTabs() {
  const [, fontError] = useFonts(MaterialIcons.font);
  if (fontError) throw fontError;

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Inicio</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Categorías</TabButton>
          </TabTrigger>
          <TabTrigger name="purchases" href="/purchases" asChild>
            <TabButton>Mi cuenta</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  ref: triggerRef,
  ...props
}: TabTriggerSlotProps) {
  void triggerRef;
  const label = typeof children === 'string' ? children : '';
  const icon = label === 'Inicio' ? 'home' : label === 'Categorías' ? 'category' : 'person-outline';

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButton,
        pressed && styles.pressed,
      ]}>
      <MaterialIcons
        name={icon}
        size={21}
        color={isFocused ? purple : muted}
      />
      <ThemedText
        type="small"
        style={[styles.tabLabel, isFocused && styles.tabLabelSelected]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const tabs = Children.toArray(props.children);

  return (
    <View {...props} style={styles.tabListContainer}>
      {tabs.slice(0, 2)}
      <StaticTabButton icon="+" label="Publicar" featured />
      <StaticTabButton label="Mis productos" bag />
      {tabs.slice(2)}
    </View>
  );
}

function StaticTabButton({
  icon,
  label,
  featured = false,
  bag = false,
}: {
  icon?: string;
  label: string;
  featured?: boolean;
  bag?: boolean;
}) {
  return (
    <View accessible accessibilityLabel={`${label}, navegación pendiente`} style={styles.tabButton}>
      {bag ? (
        <MaterialIcons name="shopping-bag" size={22} color={muted} />
      ) : (
        <View style={[styles.staticIcon, featured && styles.featuredIcon]}>
          <Text style={[styles.staticIconText, featured && styles.featuredIconText]}>{icon}</Text>
        </View>
      )}
      <ThemedText type="small" style={styles.tabLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    maxWidth: 390,
    marginHorizontal: 'auto',
    minHeight: 66,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8E6EF',
    zIndex: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    color: muted,
    fontSize: 10,
  },
  staticIcon: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: purple,
  },
  staticIconText: {
    color: muted,
    fontSize: 15,
    lineHeight: 20,
  },
  featuredIconText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
  },
  tabLabelSelected: {
    color: purple,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.65,
  },
});
