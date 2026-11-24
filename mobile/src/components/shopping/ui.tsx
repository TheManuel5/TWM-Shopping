import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors as c } from "@/theme/shopping";

export function Button({
  title,
  onPress,
  outline,
  disabled,
}: {
  title: string;
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        outline && s.outline,
        (pressed || disabled) && { opacity: 0.55 },
      ]}
    >
      <Text style={[s.buttonText, outline && { color: c.primary }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Chip({
  title,
  active,
  onPress,
}: {
  title: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[s.chip, active && s.activeChip]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: active ? c.primary : c.muted,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function SearchField(props: TextInputProps) {
  return (
    <View style={s.search}>
      <Ionicons name="search-outline" color={c.muted} size={20} />
      <TextInput
        accessibilityLabel={props.placeholder || "Buscar"}
        placeholderTextColor={c.muted}
        {...props}
        style={s.input}
      />
    </View>
  );
}
export function Heading({
  children,
  action,
  onPress,
}: {
  children: ReactNode;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.heading}>
      <Text style={s.h2}>{children}</Text>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}>
          <Text style={s.link}>{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}
export function Header({
  title,
  subtitle,
  back,
  search,
  onBack,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  search?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <View style={s.header}>
      <View style={s.headerLine}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={12}
            onPress={
              onBack ||
              (() => (router.canGoBack() ? router.back() : router.replace("/")))
            }
          >
            <Ionicons name="chevron-back" size={27} color="white" />
          </Pressable>
        )}
        {!back && (
          <View style={s.logo}>
            <Ionicons name="bag-handle-outline" size={25} color="white" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
          <Text style={s.headerTitle}>{title}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mi cuenta"
          onPress={() => router.push("/cuenta")}
          hitSlop={12}
        >
          <Ionicons name="person-outline" color="white" size={23} />
        </Pressable>
      </View>
      {search}
    </View>
  );
}
export function Page({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView edges={["top"]} style={s.page}>
      {children}
    </SafeAreaView>
  );
}
export function Message({
  title,
  detail,
  action,
  onPress,
  busy,
}: {
  title: string;
  detail?: string;
  action?: string;
  onPress?: () => void;
  busy?: boolean;
}) {
  return (
    <View style={s.message}>
      {busy ? (
        <ActivityIndicator size="large" color={c.primary} />
      ) : (
        <Text style={s.messageIcon}>◇</Text>
      )}
      <Text style={s.h2}>{title}</Text>
      {detail && <Text style={s.body}>{detail}</Text>}
      {action && onPress && <Button title={action} onPress={onPress} />}
    </View>
  );
}
export function ModuleEntry({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Page>
      <Header title={title} />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Message
          title={title}
          detail={description}
          action="Explorar catálogo"
          onPress={() => router.push("/catalogo")}
        />
      </ScrollView>
    </Page>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.surface },
  header: {
    backgroundColor: c.primary,
    padding: 18,
    gap: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLine: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: {
    backgroundColor: "#FFFFFF30",
    width: 34,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 23, color: "white", fontWeight: "900" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  subtitle: { fontSize: 11, color: "#DDD2FF", marginBottom: 3 },
  back: { fontSize: 36, color: "white", lineHeight: 38 },
  account: { color: "white", fontSize: 29 },
  search: {
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: c.border,
    minHeight: 46,
  },
  input: { flex: 1, paddingVertical: 11, color: c.ink, fontSize: 14 },
  button: {
    backgroundColor: c.primary,
    borderRadius: 13,
    paddingHorizontal: 18,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 13 },
  outline: { backgroundColor: "white", borderWidth: 1, borderColor: c.primary },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  activeChip: { backgroundColor: c.primarySoft, borderColor: c.primary },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginVertical: 18,
  },
  h2: { fontSize: 18, fontWeight: "800", color: c.ink },
  link: { fontSize: 12, fontWeight: "700", color: c.primary },
  body: { color: c.muted, fontSize: 14, lineHeight: 22 },
  message: { padding: 25, alignItems: "center", gap: 16 },
  messageIcon: { fontSize: 45, color: c.primary },
});
