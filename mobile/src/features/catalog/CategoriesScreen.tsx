import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Header,
  Message,
  Page,
  SearchField,
} from "@/components/shopping/ui";
import { colors as c } from "@/theme/shopping";
import { useCatalog } from "./CatalogProvider";
import { flatten, normalize } from "./model";
import type { Category } from "./types";

export default function CategoriesScreen() {
  const { id, group } = useLocalSearchParams<{ id?: string; group?: string }>();
  const { snapshot, loading, error, refresh } = useCatalog();
  const [query, setQuery] = useState("");
  const tree = snapshot?.collections.categories || {};
  const selected = id
    ? flatten(group && tree[group] ? { [group]: tree[group] } : tree).find(
        (node) => String(node.id) === id,
      )
    : undefined;
  const parent = flatten(
    group && tree[group] ? { [group]: tree[group] } : tree,
  ).find((node) => node.children?.some((child) => String(child.id) === id));
  const open = (node: Category, section: string) =>
    router.push({
      pathname: node.children?.length ? "/categoria/[id]" : "/catalogo",
      params: {
        ...(node.children?.length
          ? { id: String(node.id) }
          : { category: String(node.id) }),
        group: section,
      },
    });
  const sections = selected
    ? [[group || "", selected.children || []] as const]
    : Object.entries(tree);
  return (
    <Page>
      <Header
        title={selected?.name || "Categorías"}
        back={!!id}
        onBack={() =>
          parent
            ? router.replace({
                pathname: "/categoria/[id]",
                params: { id: String(parent.id), group },
              })
            : router.replace("/categorias")
        }
        subtitle={id ? group : "Encuentra lo que necesitas"}
        search={
          <SearchField
            placeholder="Buscar en categorías…"
            value={query}
            onChangeText={setQuery}
          />
        }
      />
      {loading && !snapshot ? (
        <Message busy title="Cargando categorías" />
      ) : error ? (
        <Message
          title="No pudimos cargar las categorías"
          detail={error}
          action="Reintentar"
          onPress={refresh}
        />
      ) : id && !selected ? (
        <Message
          title="Categoría no encontrada"
          action="Ver categorías"
          onPress={() => router.replace("/categorias")}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 18, gap: 18 }}>
          {selected && (
            <Button
              title={`Ver todo en ${selected.name}`}
              onPress={() =>
                router.push({
                  pathname: "/catalogo",
                  params: { category: String(selected.id), group },
                })
              }
            />
          )}
          {sections.map(([section, nodes]) => {
            const visible = query.trim()
              ? flatten({ [section]: nodes }).filter((node) =>
                  normalize(node.name).includes(normalize(query.trim())),
                )
              : nodes;
            return (
              <View key={section}>
                <View style={styles.section}>
                  <Text style={styles.sectionText}>
                    {section || selected?.name}
                  </Text>
                </View>
                {visible.map((node) => (
                  <Pressable
                    key={node.id}
                    accessibilityRole="button"
                    onPress={() => open(node, section)}
                    style={styles.row}
                  >
                    <View style={styles.symbol}>
                      <Text style={{ color: c.primary }}>▦</Text>
                    </View>
                    <Text style={styles.name}>{node.name}</Text>
                    <Text style={styles.arrow}>›</Text>
                  </Pressable>
                ))}
                {!visible.length && (
                  <Text style={styles.empty}>
                    No hay categorías que coincidan.
                  </Text>
                )}
              </View>
            );
          })}
          {!sections.length && (
            <Message title="No hay categorías disponibles" />
          )}
        </ScrollView>
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  section: { padding: 13, backgroundColor: c.primarySoft, borderRadius: 10 },
  sectionText: { color: c.ink, fontWeight: "800", fontSize: 14 },
  row: {
    minHeight: 58,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 6,
  },
  symbol: { backgroundColor: c.primarySoft, padding: 8, borderRadius: 8 },
  name: { flex: 1, fontSize: 14, color: c.ink },
  arrow: { color: c.muted, fontSize: 25 },
  empty: { padding: 18, color: c.muted },
});
