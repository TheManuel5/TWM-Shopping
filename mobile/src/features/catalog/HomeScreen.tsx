import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Header,
  Heading,
  Message,
  Page,
  SearchField,
} from "@/components/shopping/ui";
import { ListingCard } from "@/components/shopping/ListingCard";
import { colors as c } from "@/theme/shopping";
import { useCatalog } from "./CatalogProvider";
import { filterCatalog } from "./model";

export default function HomeScreen() {
  const { snapshot, loading, error, refresh } = useCatalog();
  const [query, setQuery] = useState("");
  const items = filterCatalog(snapshot?.collections.catalog || [], {
    sort: "rating",
  }).slice(0, 8);
  const categories = Object.entries(snapshot?.collections.categories || {})
    .flatMap(([group, nodes]) => nodes.map((node) => ({ ...node, group })))
    .slice(0, 6);
  return (
    <Page>
      <Header
        title="Shopping"
        subtitle="Compra, vende y descubre"
        search={
          <SearchField
            placeholder="Buscar productos y servicios…"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() =>
              router.push({ pathname: "/catalogo", params: { q: query } })
            }
          />
        }
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading && !!snapshot}
            onRefresh={refresh}
            tintColor={c.primary}
          />
        }
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={{ flex: 1, gap: 10 }}>
            <Text style={styles.eyebrow}>DESCUBRE SHOPPING</Text>
            <Text style={styles.heroTitle}>
              Todo lo que buscas,{"\n"}más cerca de ti.
            </Text>
            <Text style={styles.heroBody}>
              Productos y servicios de emprendedores.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/catalogo")}
              style={styles.heroButton}
            >
              <Text style={styles.heroButtonText}>Explorar catálogo →</Text>
            </Pressable>
          </View>
          <Image
            source={require("../../../assets/catalog/hero_devices.png")}
            contentFit="contain"
            style={styles.heroImage}
          />
        </View>
        {loading && !snapshot ? (
          <Message
            busy
            title="Preparando tu tienda"
            detail="Estamos cargando el catálogo."
          />
        ) : error ? (
          <Message
            title="No pudimos actualizar la tienda"
            detail={error}
            action="Reintentar"
            onPress={refresh}
          />
        ) : null}
        {snapshot && (
          <>
            <Heading
              action="Ver todas"
              onPress={() => router.push("/categorias")}
            >
              Categorías
            </Heading>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {categories.map((category, index) => (
                <Pressable
                  key={`${category.group}-${category.id}`}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: "/categoria/[id]",
                      params: {
                        id: String(category.id),
                        group: category.group,
                      },
                    })
                  }
                  style={styles.category}
                >
                  <View style={styles.categoryIcon}>
                    <Text style={{ fontSize: 24, color: c.primary }}>
                      {["▣", "♧", "◈", "▤", "◇", "✦"][index]}
                    </Text>
                  </View>
                  <Text style={styles.categoryText} numberOfLines={2}>
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Heading
              action="Ver todos"
              onPress={() => router.push("/catalogo")}
            >
              Para descubrir
            </Heading>
            <View style={styles.grid}>
              {items.map((item) => (
                <View key={item.id} style={styles.gridCell}>
                  <ListingCard item={item} />
                </View>
              ))}
            </View>
            {!items.length && (
              <Message
                title="El catálogo está vacío"
                detail="Las nuevas publicaciones aparecerán aquí."
              />
            )}
            <View style={styles.banner}>
              <Text style={styles.heroTitle}>También hay servicios</Text>
              <Text style={styles.heroBody}>
                Encuentra profesionales para lo que necesitas.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/catalogo",
                    params: { type: "Servicio" },
                  })
                }
              >
                <Text style={styles.link}>Explorar servicios →</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </Page>
  );
}
const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 30 },
  hero: {
    backgroundColor: c.primarySoft,
    padding: 20,
    borderRadius: 22,
    flexDirection: "row",
    minHeight: 200,
    overflow: "hidden",
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: c.primary,
    fontWeight: "800",
  },
  heroTitle: { color: c.ink, fontSize: 23, lineHeight: 28, fontWeight: "900" },
  heroBody: { fontSize: 12, color: c.muted, lineHeight: 18 },
  heroImage: { width: "35%", height: 160, alignSelf: "center" },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: c.primary,
    borderRadius: 20,
    padding: 12,
  },
  heroButtonText: { color: "white", fontWeight: "700", fontSize: 11 },
  category: { width: 76, alignItems: "center", gap: 8 },
  categoryIcon: {
    width: 62,
    height: 60,
    borderRadius: 16,
    backgroundColor: c.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: { fontSize: 11, color: c.ink, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCell: { width: "48%", flexGrow: 1 },
  banner: {
    gap: 12,
    backgroundColor: c.background,
    padding: 20,
    borderRadius: 18,
    marginTop: 24,
  },
  link: { color: c.primary, fontWeight: "700" },
});
