import { router, usePathname, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors as c } from "@/theme/shopping";

const destinations = [
  ["/", "Inicio", "home-outline"],
  ["/categorias", "Categorías", "grid-outline"],
  ["/publicar", "Publicar", "add-circle"],
  ["/mis-productos", "Mis productos", "bag-outline"],
  ["/cuenta", "Mi cuenta", "person-outline"],
] as const;
// Las pantallas de detalle viven en el Stack raíz para conservar un historial real.
export function DetailTabBar() {
  const path = usePathname();
  if (destinations.some(([href]) => href === path)) return null;
  return (
    <SafeAreaView edges={["bottom"]} style={styles.bar}>
      <View style={styles.row}>
        {destinations.map(([href, label, icon]) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{
              selected:
                href === "/categorias" &&
                /catalogo|categoria|producto|servicio|resenas/.test(path),
            }}
            key={href}
            onPress={() => router.navigate(href as Href)}
            style={styles.tab}
          >
            <Ionicons
              name={icon}
              color={
                href === "/categorias" || href === "/publicar"
                  ? c.primary
                  : c.muted
              }
              size={href === "/publicar" ? 34 : 23}
            />
            <Text
              style={[
                styles.label,
                href === "/categorias" && { color: c.primary },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  bar: { borderTopWidth: 1, borderColor: c.border, backgroundColor: "white" },
  row: { height: 64, flexDirection: "row", alignItems: "center" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  label: { fontSize: 10, color: c.muted, fontWeight: "600" },
});
